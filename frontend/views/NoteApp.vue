<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {  EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import HandwritingPad from '../components/HandwritingPad.vue'
import {
  ArrowLeft, ArrowDown, Brush, Check, Clock, Document, EditPen,
  Folder, FolderAdd, Grid, Hide, Key, Link as LinkIcon, List, Loading, Lock, Message, MoreFilled, Picture,
  Search, Plus, RefreshLeft, RefreshRight, Close, Delete, Minus, SwitchButton, User as UserIcon, View
} from '@element-plus/icons-vue'

import { useUserStore } from '../store/user.js'
import { getUserMes, updateUser } from '../api/user.js'
import { createKnow, createNoteByKnow, getKnow, getNoteByKnow, KnowTree } from '../api/know.js'
import { deleteNote, getNoteById, updateNote, getNote, searchNote } from '../api/note.js'
import {sendEmailCode,verifyEmailCode} from '../api/emailCode.js'



const EMPTY_CONTENT = { type: 'doc', content: [{ type: 'paragraph' }] }
const index = ref({ documents: [], folders: [] })
const activeId = ref(null)
const draft = ref(null)
const activeTag = ref('')
const activeFolder = ref('')
const queryInput = ref(localStorage.getItem('localnote-query') || '')
const query = ref(queryInput.value)
const searchResults = ref([])
const searchOpen = ref(false)
const searchLoading = ref(false)
const searchError = ref('')
const searchActiveIndex = ref(-1)
const lastSearchKeyword = ref('')
const title = ref('')
const selectedTags = ref([])
const selectedFolder = ref('folder-inbox')
const viewMode = ref(localStorage.getItem('localnote-view') || 'list')
const saving = ref(false)
const dirty = ref(false)
const suppressChanges = ref(false)
const folderDialog = ref(false)
const folderSaving = ref(false)
const folderFormRef = ref(null)
const folderTreeRef = ref(null)
const handwritingVisible = ref(false)
const contextMenu = ref(null)
const folderForm = ref({ title: '', description: '', parentId: null })
const folderRules = {
  title: [{
    validator: (_rule, value, callback) => {
      if (!value || !value.trim()) callback(new Error('请输入文件夹名称'))
      else callback()
    },
    trigger: ['blur', 'change']
  }]
}
const expandedKeys = ref([])
const color = ref('#2f3430')

const router = useRouter()
const userDialog = ref(false)
const forgotDialog = ref(false)
const profileLoading = ref(false)
const profile = ref({ userID: null, userName: '', email: '' })
const forgotFormRef = ref(null)
const forgotForm = ref({ email: '', code: '', password: '', confirmPassword: '' })
const forgotSending = ref(false)
const forgotSubmitting = ref(false)
const forgotCountdown = ref(0)
const showForgotPassword = ref(false)
const showForgotConfirm = ref(false)
let forgotTimer = null

const forgotRules = {
  code: [{
    validator: (_rule, value, callback) => {
      if (!/^\d{6}$/.test((value || '').trim())) return callback(new Error('请输入 6 位短信验证码'))
      callback()
    },
    trigger: ['blur', 'change']
  }],
  password: [{
    validator: (_rule, value, callback) => {
      if (!value || value.length < 6) return callback(new Error('新密码至少 6 位字符'))
      callback()
    },
    trigger: ['blur', 'change']
  }],
  confirmPassword: [{
    validator: (_rule, value, callback) => {
      if (!value) return callback(new Error('请再次输入新密码'))
      if (value !== forgotForm.value.password) return callback(new Error('两次输入的密码不一致'))
      callback()
    },
    trigger: ['blur', 'change']
  }]
}

const avatarText = computed(() => {
  const name = profile.value.userName?.trim()
  return name ? name.slice(0, 2).toUpperCase() : 'LN'
})

async function loadProfile(silent = false) {
  profileLoading.value = true
  try {
    const res = await getUserMes()
    const user = Array.isArray(res.data) ? res.data[0] : res.data
    if (user) {
      profile.value = { userID: user.userID ?? null, userName: user.userName ?? '', email: user.email ?? ''   }
      forgotForm.value.email = user.email
    }
  } catch {
    if (!silent) ElMessage.error('获取个人信息失败，请稍后重试')
  } finally {
    profileLoading.value = false
  }
}

function resetForgotState() {
  clearInterval(forgotTimer)
  forgotTimer = null
  forgotCountdown.value = 0
  forgotSending.value = false
  forgotSubmitting.value = false
  showForgotPassword.value = false
  showForgotConfirm.value = false
}

function openForgotDialog() {
  resetForgotState()
  forgotForm.value = { email:profile.value.email, code: '', password: '', confirmPassword: '' }
  forgotDialog.value = true
  nextTick(() => forgotFormRef.value?.clearValidate())
}

async function sendForgotCode() {
  if (forgotSending.value || forgotCountdown.value > 0) return
  forgotSending.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  await sendEmailCode({email:profile.value.email,purpose:'resetPassword'})
  forgotSending.value = false
  if (!forgotDialog.value) return
  forgotCountdown.value = 60
  ElMessage.success('验证码已发送')
  clearInterval(forgotTimer)
  forgotTimer = setInterval(() => {
    forgotCountdown.value -= 1
    if (forgotCountdown.value <= 0) {
      clearInterval(forgotTimer)
      forgotTimer = null
    }
  }, 1000)
}

async function submitForgot() {
  if (forgotSubmitting.value) return
  try {
    await forgotFormRef.value?.validate()
  } catch {
    return
  }
  forgotSubmitting.value = true
  try {
    const result=await verifyEmailCode({email:forgotForm.value.email,code:forgotForm.value.code,purpose:'resetPassword'})
    if(result.code!==200){
      ElMessage.error(result.message)
    }
    await updateUser({password:forgotForm.value.password})
    forgotDialog.value=false
    ElMessage.success('密码已重置')
  } finally {
    forgotSubmitting.value = false
  }
}

async function handleUserCommand(command) {
  if (command === 'profile') {
    userDialog.value = true
    loadProfile()
    return
  }
  if (command === 'forgot') {
    openForgotDialog()
    return
  }
  if (command === 'logout') {
    const warning = isDraft.value
      ? '当前草稿尚未保存，退出登录会丢失草稿。'
      : '退出登录后需要重新登录才能继续使用。'
    try {
      await ElMessageBox.confirm(warning, '退出登录', {
        confirmButtonText: '退出登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
    localStorage.removeItem('localnote-token')
    router.push('/')
    ElMessage.success('已退出登录')
  }
}

const AllTree = ref([])

let saveTimer
let searchTimer

watch(queryInput, value => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    query.value = value
    localStorage.setItem('localnote-query', value)
  }, 250)
})


const editor = useEditor({
  extensions: [
    StarterKit.configure({ link: false, underline: false }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ allowBase64: false }),
    Placeholder.configure({ placeholder: '从这里开始，写下你的想法…' })
  ],
  content: EMPTY_CONTENT,
  onUpdate: markChanged,
  editorProps: { attributes: { class: 'editor-content' } }
})

const isDraft = computed(() => activeId.value === '__draft__')
const currentDoc = computed(() => isDraft.value ? draft.value : index.value.documents.find(doc => doc.id === activeId.value))
const tag = computed(() => [...new Set(index.value.documents.flatMap(doc => doc.tag || []))].sort())
const sidebarTags = computed(() => activeId.value ? [...(selectedTags.value || [])] : [])

const recentDocuments = computed(() => [...index.value.documents].sort((a, b) => b.updateTime - a.updateTime).slice(0, 6))
const folderTree = computed(() => index.value.folders)
const folderOptions = computed(() => {
  const options = []
  const walk = (nodes, depth) => {
    for (const node of nodes || []) {
      options.push({ id: node.id, title: node.title, depth })
      walk(node.children, depth + 1)
    }
  }
  walk(index.value.folders, 0)
  return options
})

const findNodeTree = (nodes, targetId) => {
  if (!Array.isArray(nodes)) return null;
  for (const node of nodes) {
    if (!node) continue;
    if (node.id === targetId) return node
    if (node.children && node.children.length > 0) return findNodeTree(node.children, targetId)
  }
  return null
}
const pageTitle = computed(() => {
  // console.log('[pageTitle 调试]', {
  //   activeFolder: activeFolder.value,
  //   activeTag: activeTag.value,
  //   AllTreeLength: AllTree.value?.length
  // });

  if (activeTag.value) {
    return `# ${activeTag.value}`;
  }

  // 检查点：activeFolder.value 是不是 null / 0 / undefined？
  if (activeFolder.value) {
    const node = findNodeTree(AllTree.value, activeFolder.value);
    console.log('[findNodeTree 结果]', node);
    return node?.title || '目录';
  }

  return '最近文档';
});
// const pageTitle = computed(() => activeTag.value ? `# ${activeTag.value}` : activeFolder.value ? findNodeTree(AllTree.value, activeFolder.value)?.title || '目录' : '最近文档')
const filteredDocuments = computed(() => index.value.documents
  .filter(doc => !activeTag.value || doc.tag == activeTag.value)
  .filter(doc => !activeFolder.value || doc.parentId == activeFolder.value)
  .filter(doc => !query.value || `${doc.title} ${doc.content || ''} ${(doc.tag || []).join(' ')}`.toLowerCase().includes(query.value.toLowerCase()))
  .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()))

// function buildFolderTree(parentId) {
//   return index.value.folders.filter(folder => folder.parentId === parentId).map(folder => ({ ...folder, children: buildFolderTree(folder.KnowledgeID) }))
// }

function formatDate(time) {
  if (!time) return '刚刚'
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(time))
}

function setView(mode) {
  viewMode.value = mode
  localStorage.setItem('localnote-view', mode)
}

function markChanged() {
  if (suppressChanges.value) return
  dirty.value = true
  if (!isDraft.value) scheduleSave()
}

function scheduleSave() {
  if (!activeId.value || isDraft.value) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveNote(false), 900)
}

function normalizeEditorContent(content) {
  if (!content) return EMPTY_CONTENT
  if (typeof content === 'object') return content
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // 普通 HTML/文本内容直接交给编辑器
  }
  return content
}

async function openNote(id) {
  if (activeId.value && id !== activeId.value && !(await leaveCurrent())) return
  const doc = index.value.documents.find(item => item.id === id)
  suppressChanges.value = true
  activeId.value = id
  draft.value = null
  title.value = doc?.title || ''
  selectedTags.value = [...(doc?.tag || [])]
  selectedFolder.value = doc?.parentId || 'folder-inbox'
  try {
    const res = await getNoteById(id)
    const data = Array.isArray(res) ? res[0] : res
    if (data) {
      if (!doc) {
        title.value = data.title || ''
        selectedTags.value = [...(data.tag || [])]
        selectedFolder.value = data.parentId || 'folder-inbox'
      }
      editor.value?.commands.setContent(normalizeEditorContent(data.content))
    }
  } catch (error) {
    ElMessage.error(`打开笔记失败：${error?.message || '请稍后重试'}`)
  } finally {
    dirty.value = false
    await nextTick()
    suppressChanges.value = false
  }
}

async function createDraft() {
  if (activeId.value && !(await leaveCurrent())) return
  suppressChanges.value = true
  draft.value = { title: '未命名文档', tag: [], parentId: 'folder-inbox' }
  activeId.value = '__draft__'
  title.value = ''
  selectedTags.value = []
  selectedFolder.value = 'folder-inbox'
  editor.value?.commands.setContent(EMPTY_CONTENT)
  dirty.value = false
  await nextTick()
  suppressChanges.value = false
}

async function saveNote(explicit = true) {
  if (!currentDoc.value || !editor.value || (isDraft.value && !explicit)) return false
  clearTimeout(saveTimer)
  saving.value = true
  try {
    const metadata = {
      ...(isDraft.value ? {} : currentDoc.value),
      title: title.value.trim() || '未命名文档',
      tag: [...selectedTags.value],
      parentId: selectedFolder.value || null,
      description: editor.value.getText().replace(/\s+/g, ' ').trim().slice(0, 120)
    }
    const record = await updateNote(currentDoc.value.id, metadata)
    const existing = index.value.documents.find(doc => doc.id === record.id)
    if (existing) Object.assign(existing, record)
    else index.value.documents.unshift(record)
    activeId.value = record.id
    draft.value = null
    dirty.value = false
    if (explicit) ElMessage.success('文档已保存到本地')
    return true
  } catch (error) {
    ElMessage.error(`保存失败：${error?.message || '请稍后重试'}`)
    return false
  } finally {
    saving.value = false
  }
}

async function leaveCurrent() {
  if (!activeId.value) return true
  if (isDraft.value && dirty.value) {
    try {
      await ElMessageBox.confirm('这个文档还没有保存。保存后才会出现在文档列表中。', '保存新文档？', {
        confirmButtonText: '保存', cancelButtonText: '放弃', distinguishCancelAndClose: true, type: 'warning'
      })
      return await saveNote(true)
    } catch (action) {
      if (action === 'cancel') {
        draft.value = null
        dirty.value = false
        return true
      }
      return false
    }
  }
  if (!isDraft.value && dirty.value) await saveNote(false)
  return true
}

async function backToDashboard() {
  if (!(await leaveCurrent())) return
  activeId.value = null
  draft.value = null
}

async function flushBeforeClose() {
  if (!activeId.value || !editor.value) return true
  return leaveCurrent()
}

function onNodeExpand(data) {
  if (!expandedKeys.value.includes(data.id)) expandedKeys.value = [...expandedKeys.value, data.id]
  localStorage.setItem('localnote-expanded', JSON.stringify(expandedKeys.value))
}

function onNodeCollapse(data) {
  expandedKeys.value = expandedKeys.value.filter(id => id !== data.id)
  localStorage.setItem('localnote-expanded', JSON.stringify(expandedKeys.value))
}

function run(command, attrs) {
  editor.value?.chain().focus()[command](attrs).run()
}

function setHeading(level) {
  if (!level) editor.value?.chain().focus().setParagraph().run()
  else editor.value?.chain().focus().toggleHeading({ level }).run()
}

async function setLink() {
  try {
    const result = await ElMessageBox.prompt('输入链接地址', '添加超链接', {
      inputValue: editor.value?.getAttributes('link').href || 'https://',
      inputPattern: /^(https?:\/\/|mailto:).+/,
      inputErrorMessage: '请输入完整的 http(s) 或 mailto 链接'
    })
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: result.value }).run()
  } catch { /* 用户取消 */ }
}


// 图片
async function addImage() {
  const src = await window.localNote.pickImage()
  if (src) run('setImage', { src })
}
// 手写
async function insertDrawing(dataUrl) {
  try {
    const src = await window.localNote.saveDrawing(dataUrl)
    if (src) {
      run('setImage', { src, alt: '手写笔记' })
      handwritingVisible.value = false
      ElMessage.success('手写内容已插入笔记')
    }
  } catch (error) {
    ElMessage.error(`手写内容保存失败：${error?.message || '请稍后重试'}`)
  }
}

function showFolderDialog() {
  folderForm.value = { title: '', description: '', parentId: activeFolder.value || null }
  folderDialog.value = true
}

async function refreshFolderTree() {
  try {
    const tree = await KnowTree()
    AllTree.value = tree
    index.value.folders = tree.filter(node => node.parentId === null)
  } catch {
    // 目录树刷新失败不阻塞创建，下次进入工作台会重新加载
  }
}

async function createFolder() {
  if (folderSaving.value) return
  try {
    await folderFormRef.value?.validate()
  } catch {
    return
  }
  const name = folderForm.value.title.trim()
  const parentId = typeof folderForm.value.parentId === 'number' ? folderForm.value.parentId : null
  folderSaving.value = true
  try {
    await createKnow({ title: name, description: folderForm.value.description || '', parentId })
    folderDialog.value = false
    ElMessage.success(`文件夹「${name}」已创建`)
    await refreshFolderTree()
    if (parentId !== null) {
      await nextTick()
      folderTreeRef.value?.getNode(parentId)?.expand()
    }
  } catch (error) {
    ElMessage.error(error?.message || '创建文件夹失败，请稍后重试')
  } finally {
    folderSaving.value = false
  }
}

function selectFolder(data) {
  activeFolder.value = data.id
  activeTag.value = ''
  activeId.value = null
}

function selectTag(tag) {
  activeTag.value = tag
  activeFolder.value = ''
  activeId.value = null
}

async function deleteTag(tag) {
  try {
    await ElMessageBox.confirm(`删除标签“${tag}”？它会从所有文档中移除。`, '删除标签', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    const documents = await getNoteById(activeId.value)
    index.value.documents = documents
    if (activeTag.value === tag) activeTag.value = ''
    selectedTags.value = selectedTags.value.filter(item => item !== tag)
    index.value.documents.tag = '';
    updateNote(activeId.value, index.value.documents)
    ElMessage.success('标签已删除')
  } catch { /* 用户取消 */ }
}

function showDocumentMenu(event, document) {
  contextMenu.value = {
    document,
    x: Math.min(event.clientX, window.innerWidth - 190),
    y: Math.min(event.clientY, window.innerHeight - 62)
  }
}

function closeContextMenu() {
  contextMenu.value = null
}

async function deleteDocument(document) {
  closeContextMenu()
  try {
    await ElMessageBox.confirm(`删除“${document.title}”？文档正文文件也会从本地移除。`, '删除文档', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await deleteNote(document.id)
    index.value.documents = index.value.documents.filter(d => d.id !== document.id)
    console.log("当前笔记:", index.value.documents)
    if (activeId.value === document.id) {
      activeId.value = null
      draft.value = null
    }
    ElMessage.success('文档已删除')
  } catch { /* 用户取消 */ }
}

function showAll() {
  activeTag.value = ''
  activeFolder.value = ''
  activeId.value = null
}

function onKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    saveNote(true)
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
    event.preventDefault()
    createDraft()
  }
}

function extractPlainText(content) {
  if (!content) return ''
  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content
    const parts = []
    const walk = node => {
      if (!node) return
      if (Array.isArray(node)) {
        node.forEach(walk)
        return
      }
      if (typeof node !== 'object') return
      if (typeof node.text === 'string') parts.push(node.text)
      if (Array.isArray(node.content)) walk(node.content)
    }
    walk(data)
    return parts.join(' ').replace(/\s+/g, ' ').trim()
  } catch {
    return String(content).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

function resultSummary(item) {
  if (item.type === 'folder') return item.content || '暂无描述'
  return extractPlainText(item.content) || '暂无正文'
}

function closeSearch() {
  searchOpen.value = false
  searchActiveIndex.value = -1
}

async function search() {
  const key = queryInput.value.trim()
  if (!key) {
    closeSearch()
    return
  }
  lastSearchKeyword.value = key
  searchOpen.value = true
  searchLoading.value = true
  searchError.value = ''
  searchActiveIndex.value = -1
  try {
    const data = await searchNote(key)
    searchResults.value = Array.isArray(data) ? data : []
    searchActiveIndex.value = searchResults.value.length ? 0 : -1
  } catch (error) {
    searchResults.value = []
    searchError.value = error?.message || '搜索失败，请稍后重试'
  } finally {
    searchLoading.value = false
  }
}

function onSearchInput() {
  if (searchOpen.value && queryInput.value.trim() !== lastSearchKeyword.value) closeSearch()
}

function onSearchFocus() {
  if (searchResults.value.length && queryInput.value.trim() === lastSearchKeyword.value) {
    searchOpen.value = true
    if (searchActiveIndex.value < 0) searchActiveIndex.value = 0
  }
}

function onSearchKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    const active = searchResults.value[searchActiveIndex.value]
    if (searchOpen.value && active) selectSearchResult(active)
    else search()
    return
  }
  if (event.key === 'Escape') {
    closeSearch()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  if (!searchOpen.value) {
    if (searchResults.value.length && queryInput.value.trim() === lastSearchKeyword.value) searchOpen.value = true
    else if (!searchLoading.value) search()
    return
  }
  if (!searchResults.value.length) return
  searchActiveIndex.value = event.key === 'ArrowDown'
    ? Math.min(searchActiveIndex.value + 1, searchResults.value.length - 1)
    : Math.max(searchActiveIndex.value - 1, 0)
}

async function selectSearchResult(item) {
  if (!item) return
  closeSearch()
  queryInput.value = ''
  query.value = ''
  localStorage.removeItem('localnote-query')
  searchResults.value = []
  lastSearchKeyword.value = ''

  if (item.type === 'folder') {
    if (!(await leaveCurrent())) return
    selectFolder({ id: item.id })
    await nextTick()
    const node = folderTreeRef.value?.getNode(item.id)
    let parent = node?.parent
    while (parent) {
      parent.expand?.()
      parent = parent.parent
    }
    node?.expand?.()
    folderTreeRef.value?.setCurrentKey(item.id)
    return
  }

  await openNote(item.id)
}

function clearSearch() {
  queryInput.value = ''
  query.value = ''
  localStorage.removeItem('localnote-query')
  searchResults.value = []
  lastSearchKeyword.value = ''
  closeSearch()
}

function closeSearchOnOutsideClick(event) {
  if (!(event.target instanceof Element) || !event.target.closest('.search-box')) closeSearch()
}

watch(title, markChanged)
watch(selectedTags, markChanged, { deep: true })
watch(selectedFolder, markChanged)
onMounted(async () => {
  loadProfile(true)
  await refreshFolderTree()
  try {
    const nodes = await getNote()
    index.value.documents = Array.isArray(nodes) ? nodes : []
  } catch {
    index.value.documents = []
  }

  const saved = JSON.parse(localStorage.getItem('localnote-expanded') || 'null')
  expandedKeys.value = saved ? saved.filter(id => index.value.folders.some(folder => folder.id === id)) : index.value.folders.map(folder => folder.id)
  // window.localNote.onFlushRequest(async () => {
  //   if (await flushBeforeClose()) window.localNote.confirmClose()
  // })
  activeFolder.value = index.value.folders[0]?.id ?? ''
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('click', closeSearchOnOutsideClick)
})
onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  clearTimeout(searchTimer)
  clearInterval(forgotTimer)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('click', closeSearchOnOutsideClick)
})
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">L</span>
        <div><strong>LocalNote</strong><small>PRIVATE NOTES</small></div>
      </div>

      <el-button class="create-button" type="primary" :icon="EditPen" @click="createDraft">新建文档 <kbd>Ctrl
          N</kbd></el-button>

      <nav class="sidebar-nav">
        <button :class="{ active: !activeTag && !activeFolder }" @click="showAll"><el-icon>
            <Clock />
          </el-icon><span>最近文档</span><em>{{ index.documents.length }}</em></button>
      </nav>

      <section class="side-section">
        <div class="side-title"><span>目录</span><el-button text circle :icon="FolderAdd" @click="showFolderDialog" />
        </div>
        <el-tree ref="folderTreeRef" class="folder-tree" :data="folderTree" node-key="id"
          :props="{ label: 'name', children: 'children', notes: 'notes' }" :default-expanded-keys="expandedKeys"
          highlight-current @node-click="selectFolder" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
          <template #default="{ data }"><el-icon>
              <Folder />
            </el-icon><span>{{ data.title }}</span></template>
        </el-tree>
      </section>

      <section class="side-section tag-section">
        <div class="side-title"><span>目录标签</span><small>{{ sidebarTags.length }}</small></div>
        <button v-for="tag in sidebarTags" :key="tag" class="side-tag" :class="{ active: activeTag === tag }"
          @click="selectTag(tag)"><span>#</span><b>{{ tag }}</b><el-icon class="tag-delete"
            @click.stop="deleteTag(tag)">
            <Close />
          </el-icon></button>
        <p v-if="!activeId" class="empty-tip">打开文档后显示标签</p>
        <p v-else-if="!sidebarTags.length" class="empty-tip">该文档暂无标签</p>
      </section>

      <section class="side-section recent-section">
        <div class="side-title"><span>最近打开</span></div>
        <button v-for="doc in recentDocuments" :key="doc.id" class="recent-note"
          :class="{ active: activeId === doc.id }" @click="openNote(doc.id)"
          @contextmenu.prevent="showDocumentMenu($event, doc)">
          <el-icon>
            <Document />
          </el-icon><span><b>{{ doc.title }}</b><small>{{ formatDate(doc.updateTime) }}</small></span>
        </button>
      </section>

      <!-- <div class="privacy"><span class="status-dot"></span>
        <div><strong>仅保存在本机</strong><small>Documents / LocalNote</small></div>
      </div> -->
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="search-box" :class="{ 'is-open': searchOpen }" role="search">
          <el-icon>
            <Search />
          </el-icon>
          <input v-model="queryInput" placeholder="搜索标题、标签或摘要" aria-label="搜索标题、标签或摘要"
            @keydown="onSearchKeydown" @input="onSearchInput" @focus="onSearchFocus" />
          <el-icon v-if="searchLoading" class="search-loading is-loading">
            <Loading />
          </el-icon>
          <button v-else-if="queryInput" class="search-clear" type="button" aria-label="清空搜索" @click="clearSearch">
            <el-icon>
              <Close />
            </el-icon>
          </button>

          <div v-if="searchOpen" class="search-results" role="listbox" aria-label="搜索结果">
            <div class="search-results-head"><span>搜索结果</span><small>{{ searchLoading ? '检索中' :
                `${searchResults.length} 项,仅展示前10项` }}</small></div>
            <div v-if="searchLoading" class="search-state"><el-icon class="is-loading">
                <Loading />
              </el-icon>正在搜索…</div>
            <div v-else-if="searchError" class="search-state is-error">{{ searchError }}</div>
            <div v-else-if="!searchResults.length" class="search-state">没有找到与“{{ lastSearchKeyword }}”相关的内容</div>
            <div v-else class="search-result-list">
              <button v-for="(item, index) in searchResults" :key="`${item.type}-${item.id}`" class="search-result"
                :class="{ active: index === searchActiveIndex }" type="button" role="option"
                :aria-selected="index === searchActiveIndex" @mouseenter="searchActiveIndex = index"
                @click="selectSearchResult(item)">
                <span class="search-result-icon" :class="item.type === 'folder' ? 'folder' : 'note'"><el-icon>
                    <Folder v-if="item.type === 'folder'" />
                    <Document v-else />
                  </el-icon></span>
                <span class="search-result-main">
                  <span class="search-result-title">{{ item.title }}</span>
                  <span class="search-result-meta"><em class="search-type"
                      :class="item.type === 'folder' ? 'folder' : 'note'">{{ item.type === 'folder' ? '目录' : '笔记'
                      }}</em><span
                      v-if="item.type !== 'folder' && item.folderTitle" class="search-result-folder">{{ item.folderTitle }}</span><span
                      class="search-result-summary">{{ resultSummary(item) }}</span></span>
                </span>
              </button>
            </div>
            <div v-if="!searchLoading && searchResults.length" class="search-results-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span>
            </div>
          </div>
        </div>
        <div class="top-actions"><span v-if="activeId" class="save-status"><el-icon>
              <Check />
            </el-icon>{{ isDraft ? '尚未保存' : saving ? '正在保存' : dirty ? '等待保存' : '已保存' }}</span>
          <el-dropdown trigger="hover" placement="bottom-end" :show-timeout="120" :hide-timeout="180"
            popper-class="user-dropdown" @command="handleUserCommand">
            <button class="user-trigger" type="button" aria-label="账户菜单">
              <el-avatar :size="40">{{ avatarText }}</el-avatar>
              <el-icon class="user-caret">
                <ArrowDown />
              </el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <li class="user-dropdown-head">
                  <el-avatar :size="30">{{ avatarText }}</el-avatar>
                  <div>
                    <strong>{{ profile.userName || 'LocalNote 用户' }}</strong>
                    <small>{{ profile.email || '未绑定邮箱' }}</small>
                  </div>
                </li>
                <el-dropdown-item command="profile" :icon="UserIcon">个人信息</el-dropdown-item>
                <el-dropdown-item command="forgot" :icon="Lock">忘记密码</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div v-if="!activeId" class="dashboard">
        <div class="dashboard-head">
          <div>
            <p class="eyebrow">LOCAL WORKSPACE</p>
            <h1>{{ pageTitle }}</h1>
            <p class="subheading">{{ filteredDocuments.length }} 篇文档 </p>
          </div>
          <div class="view-actions">
            <el-segmented :model-value="viewMode"
              :options="[{ label: '横向', value: 'list', icon: List }, { label: '纵向', value: 'grid', icon: Grid }]"
              @change="setView" />
            <el-button type="primary" :icon="Plus" @click="createDraft">新建文档</el-button>
          </div>
        </div>

        <el-empty v-if="!filteredDocuments.length" description="这里还没有文档">
          <el-button type="primary" @click="createDraft">写第一篇笔记</el-button>
        </el-empty>

        <div v-else class="document-list" :class="viewMode">
          <button v-for="doc in filteredDocuments" :key="doc.id" class="document-item" @click="openNote(doc.id)"
            @contextmenu.prevent="showDocumentMenu($event, doc)">
            <div class="document-icon"><el-icon>
                <Document />
              </el-icon></div>
            <div class="document-main">
              <h3>{{ doc.title }}</h3>
              <p>{{ doc.description || '这篇文档暂时没有内容摘要' }}</p>
              <div class="document-tags"><span v-for="tag in doc.tag" :key="tag"># {{ tag }}</span></div>
            </div>
            <div class="document-folder"><el-icon>
                <Folder />
              </el-icon>{{index.folders.find(folder => folder.id === doc.parentId)?.name || '未分类'}}</div>
            <time>{{ formatDate(doc.updateTime) }}</time>
            <el-icon class="more">
              <MoreFilled />
            </el-icon>
          </button>
        </div>
      </div>

      <div v-else class="editor-page">
        <div class="editor-navigation">
          <el-button text :icon="ArrowLeft" @click="backToDashboard">返回文档</el-button>
          <div class="editor-actions"><span v-if="isDraft" class="draft-badge">草稿不会自动保存</span><el-button type="primary"
              :loading="saving" @click="saveNote(true)">保存文档</el-button></div>
        </div>

        <div class="document-meta">
          <input v-model="title" class="title-input" placeholder="未命名文档" />
          <div class="meta-row">
            <el-select v-model="selectedFolder" class="folder-select" placeholder="选择目录" :prefix-icon="Folder">
              <el-option v-for="folder in folderOptions" :key="folder.id" :label="folder.title" :value="folder.id" />
            </el-select>
            <el-select v-model="selectedTags" class="tag-select" multiple filterable allow-create default-first-option
              collapse-tags collapse-tags-tooltip placeholder="添加标签">
              <el-option v-for="tag in tag" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </div>
        </div>

        <div v-if="editor" class="toolbar">
          <el-dropdown trigger="click" @command="setHeading">
            <el-button text>正文 <span class="caret">⌄</span></el-button>
            <template #dropdown><el-dropdown-menu><el-dropdown-item :command="0">正文</el-dropdown-item><el-dropdown-item
                  v-for="level in 6" :key="level" :command="level">标题 {{ level
                  }}</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
          <i class="divider"></i>
          <el-tooltip content="加粗 Ctrl+B"><el-button text :class="{ active: editor.isActive('bold') }"
              @click="run('toggleBold')"><b>B</b></el-button></el-tooltip>
          <el-tooltip content="斜体"><el-button text :class="{ active: editor.isActive('italic') }"
              @click="run('toggleItalic')"><i>I</i></el-button></el-tooltip>
          <el-tooltip content="下划线"><el-button text :class="{ active: editor.isActive('underline') }"
              @click="run('toggleUnderline')"><u>U</u></el-button></el-tooltip>
          <el-tooltip content="删除线"><el-button text :class="{ active: editor.isActive('strike') }"
              @click="run('toggleStrike')"><s>S</s></el-button></el-tooltip>
          <el-color-picker v-model="color" size="small" @change="value => value && run('setColor', value)" />
          <el-tooltip content="高亮"><el-button text :class="{ active: editor.isActive('highlight') }" :icon="Brush"
              @click="run('toggleHighlight', { color: '#fff0a8' })" /></el-tooltip>
          <i class="divider"></i>
          <el-button text :class="{ active: editor.isActive('bulletList') }" @click="run('toggleBulletList')">•
            列表</el-button>
          <el-button text :class="{ active: editor.isActive('orderedList') }" @click="run('toggleOrderedList')">1.
            列表</el-button>
          <el-button text :class="{ active: editor.isActive('blockquote') }" @click="run('toggleBlockquote')">“
            引用</el-button>
          <el-button text :class="{ active: editor.isActive('codeBlock') }"
            @click="run('toggleCodeBlock')">&lt;/&gt;</el-button>
          <el-tooltip content="分割线"><el-button text :class="{ active: editor.isActive('horizontalRule') }" :icon="Minus"
              @click="run('setHorizontalRule')" /></el-tooltip>
          <i class="divider"></i>
          <el-tooltip content="左对齐"><el-button text :class="{ active: editor.isActive({ textAlign: 'left' }) }"
              @click="run('setTextAlign', 'left')"><span
                class="align-glyph align-left"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="居中"><el-button text :class="{ active: editor.isActive({ textAlign: 'center' }) }"
              @click="run('setTextAlign', 'center')"><span
                class="align-glyph align-center"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="右对齐"><el-button text :class="{ active: editor.isActive({ textAlign: 'right' }) }"
              @click="run('setTextAlign', 'right')"><span
                class="align-glyph align-right"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="链接"><el-button text :icon="LinkIcon" @click="setLink" /></el-tooltip>
          <el-tooltip content="本地图片"><el-button text :icon="Picture" @click="addImage" /></el-tooltip>
          <el-tooltip content="手写画板"><el-button text :icon="EditPen" @click="handwritingVisible = true" /></el-tooltip>
          <i class="toolbar-spacer"></i>
          <el-tooltip content="撤销"><el-button text :disabled="!editor.can().undo()" :icon="RefreshLeft"
              @click="run('undo')" /></el-tooltip>
          <el-tooltip content="重做"><el-button text :disabled="!editor.can().redo()" :icon="RefreshRight"
              @click="run('redo')" /></el-tooltip>
        </div>

        <div class="paper">
          <EditorContent :editor="editor" />
        </div>
        <footer class="editor-footer"><span>{{ editor?.getText().length || 0 }} 字</span>
          <span>{{ isDraft ? '按 Ctrl+S保存并加入文档列表' : '停止输入后自动保存' }}</span>
        </footer>
      </div>
    </section>

    <el-dialog v-model="userDialog" title="个人信息" width="380px" align-center>
      <div v-loading="profileLoading" class="profile-card">
        <el-avatar :size="58">{{ avatarText }}</el-avatar>
        <strong class="profile-name">{{ profile.userName || '未命名用户' }}</strong>
        <dl class="profile-fields">
          <div>
            <dt>用户名</dt>
            <dd>{{ profile.userName || '—' }}</dd>
          </div>
          <div>
            <dt>邮箱</dt>
            <dd>{{ profile.email || '未绑定' }}</dd>
          </div>
        </dl>
      </div>
      <template #footer><el-button @click="userDialog = false">关闭</el-button></template>
    </el-dialog>

    <el-dialog v-model="forgotDialog" width="420px" align-center class="forgot-dialog" @closed="resetForgotState">
      <template #header>
        <div class="forgot-head">
          <span class="forgot-mark" aria-hidden="true"><el-icon>
              <Lock />
            </el-icon></span>
          <div class="forgot-head-copy">
            <h2>忘记密码</h2>
            <p>验证身份后设置新的登录密码</p>
          </div>
        </div>
      </template>

      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-position="top" class="forgot-form"
        @submit.prevent>
        <el-form-item label="邮箱" prop="email"><el-input v-model="profile.email" :prefix-icon="Message"
            disabled /></el-form-item>
        <el-form-item label="短信验证码" prop="code">
          <div class="code-row"><el-input v-model="forgotForm.code" maxlength="6" inputmode="numeric" :prefix-icon="Key"
              placeholder="请输入 6 位验证码" autocomplete="one-time-code" @keyup.enter="submitForgot" /><el-button
              class="code-button" :loading="forgotSending" :disabled="forgotSending || forgotCountdown > 0"
              @click="sendForgotCode">{{ forgotCountdown > 0 ? `${forgotCountdown}s 后重发` : '发送验证码' }}</el-button></div>
        </el-form-item>
        <el-form-item label="新密码" prop="password"><el-input v-model="forgotForm.password"
            :type="showForgotPassword ? 'text' : 'password'" :prefix-icon="Lock" placeholder="至少 6 位字符"
            autocomplete="new-password">
            <template #suffix>
              <button class="password-toggle" type="button" :aria-label="showForgotPassword ? '隐藏密码' : '显示密码'"
                :aria-pressed="showForgotPassword" @mousedown.prevent
                @click="showForgotPassword = !showForgotPassword"><el-icon>
                  <Hide v-if="showForgotPassword" />
                  <View v-else />
                </el-icon></button>
            </template>
          </el-input></el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword"><el-input v-model="forgotForm.confirmPassword"
            :type="showForgotConfirm ? 'text' : 'password'" :prefix-icon="Lock" placeholder="再次输入新密码"
            autocomplete="new-password" @keyup.enter="submitForgot">
            <template #suffix>
              <button class="password-toggle" type="button" :aria-label="showForgotConfirm ? '隐藏密码' : '显示密码'"
                :aria-pressed="showForgotConfirm" @mousedown.prevent
                @click="showForgotConfirm = !showForgotConfirm"><el-icon>
                  <Hide v-if="showForgotConfirm" />
                  <View v-else />
                </el-icon></button>
            </template>
          </el-input></el-form-item>
      </el-form>

      <template #footer>
        <div class="forgot-footer"><el-button @click="forgotDialog = false">取消</el-button><el-button type="primary"
            :loading="forgotSubmitting" @click="submitForgot()">重置密码</el-button></div>
      </template>
    </el-dialog>

    <el-dialog v-model="folderDialog" width="min(440px, calc(100vw - 32px))" align-center class="folder-dialog"
      modal-class="folder-dialog-overlay" :show-close="false" destroy-on-close>
      <template #header>
        <div class="folder-dialog-head">
          <span class="folder-dialog-mark" aria-hidden="true"><el-icon>
              <FolderAdd />
            </el-icon></span>
          <div class="folder-dialog-copy">
            <h2>新建文件夹</h2>
            <p>把相关文档收进同一个目录</p>
          </div>
          <button class="folder-dialog-close" type="button" aria-label="关闭" @click="folderDialog = false"><el-icon>
              <Close />
            </el-icon></button>
        </div>
      </template>
      <el-form ref="folderFormRef" :model="folderForm" :rules="folderRules" label-position="top" class="folder-form"
        @submit.prevent>
        <el-form-item label="文件夹名称" prop="title"><el-input v-model="folderForm.title" autofocus maxlength="30"
            show-word-limit placeholder="例如：工作项目" :disabled="folderSaving" @keyup.enter="createFolder" />
        </el-form-item>
        <el-form-item label="上级目录" prop="parentId"><el-select v-model="folderForm.parentId" clearable
            :value-on-clear="null" placeholder="根目录" style="width:100%" :disabled="folderSaving"
            popper-class="folder-select-popper"><el-option v-for="folder in folderOptions" :key="folder.id"
              :label="folder.title" :value="folder.id"><span class="folder-option"
                :style="{ paddingLeft: `${folder.depth * 14}px` }"><el-icon>
                  <Folder />
                </el-icon>{{ folder.title }}</span></el-option></el-select></el-form-item>
      </el-form>
      <template #footer>
        <div class="folder-dialog-footer">
          <span class="folder-dialog-hint"><kbd>Enter</kbd> 创建<span class="hint-sep">·</span><kbd>Esc</kbd>
            取消</span>
          <div class="folder-dialog-actions"><el-button :disabled="folderSaving"
              @click="folderDialog = false">取消</el-button><el-button type="primary" :loading="folderSaving" :icon="Plus"
              @click="createFolder">创建</el-button></div>
        </div>
      </template>
    </el-dialog>
    <HandwritingPad v-model="handwritingVisible" @insert="insertDrawing" />
    <div v-if="contextMenu" class="context-menu" :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      @click.stop>
      <button @click="deleteDocument(contextMenu.document)"><el-icon>
          <Delete />
        </el-icon>删除文档</button>
    </div>
  </main>
</template>
