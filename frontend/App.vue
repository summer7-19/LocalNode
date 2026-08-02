<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { ElMessage, ElMessageBox } from 'element-plus'
import HandwritingPad from './components/HandwritingPad.vue'
import {
  ArrowLeft, Brush, Check, Clock, Document, EditPen,
  Folder, FolderAdd, Grid, Link as LinkIcon, List, MoreFilled, Picture,
  Search, Plus, RefreshLeft, RefreshRight, Close, Delete, Minus
} from '@element-plus/icons-vue'

const EMPTY_CONTENT = { type: 'doc', content: [{ type: 'paragraph' }] }
const index = ref({ documents: [], folders: [] })
const activeId = ref(null)
const draft = ref(null)
const activeTag = ref('')
const activeFolder = ref('')
const queryInput = ref(localStorage.getItem('localnote-query') || '')
const query = ref(queryInput.value)
const title = ref('')
const selectedTags = ref([])
const selectedFolder = ref('folder-inbox')
const viewMode = ref(localStorage.getItem('localnote-view') || 'list')
const saving = ref(false)
const dirty = ref(false)
const suppressChanges = ref(false)
const folderDialog = ref(false)
const handwritingVisible = ref(false)
const contextMenu = ref(null)
const folderForm = ref({ name: '', parentId: null })
const expandedKeys = ref([])
const color = ref('#2f3430')
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
const tags = computed(() => [...new Set(index.value.documents.flatMap(doc => doc.tags || []))].sort())
const sidebarTags = computed(() => activeId.value ? [...(selectedTags.value || [])] : [])
const filteredDocuments = computed(() => index.value.documents
  .filter(doc => !activeTag.value || doc.tags?.includes(activeTag.value))
  .filter(doc => !activeFolder.value || doc.parentId === activeFolder.value)
  .filter(doc => !query.value || `${doc.title} ${doc.summary || ''} ${(doc.tags || []).join(' ')}`.toLowerCase().includes(query.value.toLowerCase()))
  .sort((a, b) => b.updatedAt - a.updatedAt))
const recentDocuments = computed(() => [...index.value.documents].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6))
const folderTree = computed(() => buildFolderTree(null))
const pageTitle = computed(() => activeTag.value ? `# ${activeTag.value}` : activeFolder.value ? index.value.folders.find(f => f.id === activeFolder.value)?.name || '目录' : '最近文档')

function buildFolderTree(parentId) {
  return index.value.folders.filter(folder => folder.parentId === parentId).map(folder => ({ ...folder, children: buildFolderTree(folder.id) }))
}

function formatDate(time) {
  if (!time) return '刚刚'
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(time)
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

async function openNote(id) {
  if (activeId.value && id !== activeId.value && !(await leaveCurrent())) return
  const doc = index.value.documents.find(item => item.id === id)
  if (!doc) return
  suppressChanges.value = true
  activeId.value = id
  draft.value = null
  title.value = doc.title
  selectedTags.value = [...(doc.tags || [])]
  selectedFolder.value = doc.parentId || 'folder-inbox'
  const data = await window.localNote.readNote(id)
  editor.value?.commands.setContent(data?.content || EMPTY_CONTENT)
  dirty.value = false
  await nextTick()
  suppressChanges.value = false
}

async function createDraft() {
  if (activeId.value && !(await leaveCurrent())) return
  suppressChanges.value = true
  draft.value = { title: '未命名文档', tags: [], parentId: 'folder-inbox' }
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
      tags: [...selectedTags.value],
      parentId: selectedFolder.value || null,
      summary: editor.value.getText().replace(/\s+/g, ' ').trim().slice(0, 120)
    }
    const record = await window.localNote.saveNote(metadata, editor.value.getJSON())
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

async function addImage() {
  const src = await window.localNote.pickImage()
  if (src) run('setImage', { src })
}

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
  folderForm.value = { name: '', parentId: activeFolder.value || null }
  folderDialog.value = true
}

async function createFolder() {
  const name = folderForm.value.name.trim()
  if (!name) return ElMessage.warning('请输入文件夹名称')
  const record = await window.localNote.createFolder({ name, parentId: folderForm.value.parentId })
  index.value.folders.push(record)
  folderDialog.value = false
  ElMessage.success('文件夹已创建')
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
    const documents = await window.localNote.deleteTag(tag)
    index.value.documents = documents
    if (activeTag.value === tag) activeTag.value = ''
    selectedTags.value = selectedTags.value.filter(item => item !== tag)
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
    index.value.documents = await window.localNote.deleteNote(document.id)
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

watch(title, markChanged)
watch(selectedTags, markChanged, { deep: true })
watch(selectedFolder, markChanged)
onMounted(async () => {
  index.value = await window.localNote.loadIndex()
  const saved = JSON.parse(localStorage.getItem('localnote-expanded') || 'null')
  expandedKeys.value = saved ? saved.filter(id => index.value.folders.some(folder => folder.id === id)) : index.value.folders.map(folder => folder.id)
  window.localNote.onFlushRequest(async () => {
    if (await flushBeforeClose()) window.localNote.confirmClose()
  })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('click', closeContextMenu)
})
onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  clearTimeout(searchTimer)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">L</span><div><strong>LocalNote</strong><small>PRIVATE NOTES</small></div></div>

      <el-button class="create-button" type="primary" :icon="EditPen" @click="createDraft">新建文档 <kbd>Ctrl N</kbd></el-button>

      <nav class="sidebar-nav">
        <button :class="{ active: !activeTag && !activeFolder }" @click="showAll"><el-icon><Clock /></el-icon><span>最近文档</span><em>{{ index.documents.length }}</em></button>
      </nav>

      <section class="side-section">
        <div class="side-title"><span>目录</span><el-tooltip content="新建文件夹"><el-button text circle :icon="FolderAdd" @click="showFolderDialog" /></el-tooltip></div>
        <el-tree class="folder-tree" :data="folderTree" node-key="id" :props="{ label: 'name', children: 'children' }" :default-expanded-keys="expandedKeys" highlight-current @node-click="selectFolder" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
          <template #default="{ data }"><el-icon><Folder /></el-icon><span>{{ data.name }}</span></template>
        </el-tree>
      </section>

      <section class="side-section tag-section">
        <div class="side-title"><span>目录标签</span><small>{{ sidebarTags.length }}</small></div>
        <button v-for="tag in sidebarTags" :key="tag" class="side-tag" :class="{ active: activeTag === tag }" @click="selectTag(tag)"><span>#</span><b>{{ tag }}</b><el-icon class="tag-delete" @click.stop="deleteTag(tag)"><Close /></el-icon></button>
        <p v-if="!activeId" class="empty-tip">打开文档后显示标签</p>
        <p v-else-if="!sidebarTags.length" class="empty-tip">该文档暂无标签</p>
      </section>

      <section class="side-section recent-section">
        <div class="side-title"><span>最近打开</span></div>
        <button v-for="doc in recentDocuments" :key="doc.id" class="recent-note" :class="{ active: activeId === doc.id }" @click="openNote(doc.id)" @contextmenu.prevent="showDocumentMenu($event, doc)">
          <el-icon><Document /></el-icon><span><b>{{ doc.title }}</b><small>{{ formatDate(doc.updatedAt) }}</small></span>
        </button>
      </section>

      <div class="privacy"><span class="status-dot"></span><div><strong>仅保存在本机</strong><small>Documents / LocalNote</small></div></div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="search-box"><el-icon><Search /></el-icon><input v-model="queryInput" placeholder="搜索标题、标签或摘要" /></div>
        <div class="top-actions"><span v-if="activeId" class="save-status"><el-icon><Check /></el-icon>{{ isDraft ? '尚未保存' : saving ? '正在保存' : dirty ? '等待保存' : '已保存' }}</span><el-avatar :size="34">LN</el-avatar></div>
      </header>

      <div v-if="!activeId" class="dashboard">
        <div class="dashboard-head">
          <div><p class="eyebrow">LOCAL WORKSPACE</p><h1>{{ pageTitle }}</h1><p class="subheading">{{ filteredDocuments.length }} 篇文档 · 数据只属于你</p></div>
          <div class="view-actions">
            <el-segmented :model-value="viewMode" :options="[{ label: '横向', value: 'list', icon: List }, { label: '纵向', value: 'grid', icon: Grid }]" @change="setView" />
            <el-button type="primary" :icon="Plus" @click="createDraft">新建文档</el-button>
          </div>
        </div>

        <el-empty v-if="!filteredDocuments.length" description="这里还没有文档">
          <el-button type="primary" @click="createDraft">写第一篇笔记</el-button>
        </el-empty>

        <div v-else class="document-list" :class="viewMode">
          <button v-for="doc in filteredDocuments" :key="doc.id" class="document-item" @click="openNote(doc.id)" @contextmenu.prevent="showDocumentMenu($event, doc)">
            <div class="document-icon"><el-icon><Document /></el-icon></div>
            <div class="document-main"><h3>{{ doc.title }}</h3><p>{{ doc.summary || '这篇文档暂时没有内容摘要' }}</p><div class="document-tags"><span v-for="tag in doc.tags" :key="tag"># {{ tag }}</span></div></div>
            <div class="document-folder"><el-icon><Folder /></el-icon>{{ index.folders.find(folder => folder.id === doc.parentId)?.name || '未分类' }}</div>
            <time>{{ formatDate(doc.updatedAt) }}</time>
            <el-icon class="more"><MoreFilled /></el-icon>
          </button>
        </div>
      </div>

      <div v-else class="editor-page">
        <div class="editor-navigation">
          <el-button text :icon="ArrowLeft" @click="backToDashboard">返回文档</el-button>
          <div class="editor-actions"><span v-if="isDraft" class="draft-badge">草稿不会自动保存</span><el-button type="primary" :loading="saving" @click="saveNote(true)">保存文档</el-button></div>
        </div>

        <div class="document-meta">
          <input v-model="title" class="title-input" placeholder="未命名文档" />
          <div class="meta-row">
            <el-select v-model="selectedFolder" class="folder-select" placeholder="选择目录" :prefix-icon="Folder">
              <el-option v-for="folder in index.folders" :key="folder.id" :label="folder.name" :value="folder.id" />
            </el-select>
            <el-select v-model="selectedTags" class="tag-select" multiple filterable allow-create default-first-option collapse-tags collapse-tags-tooltip placeholder="添加标签">
              <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </div>
        </div>

        <div v-if="editor" class="toolbar">
          <el-dropdown trigger="click" @command="setHeading">
            <el-button text>正文 <span class="caret">⌄</span></el-button>
            <template #dropdown><el-dropdown-menu><el-dropdown-item :command="0">正文</el-dropdown-item><el-dropdown-item v-for="level in 6" :key="level" :command="level">标题 {{ level }}</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
          <i class="divider"></i>
          <el-tooltip content="加粗 Ctrl+B"><el-button text :class="{ active: editor.isActive('bold') }" @click="run('toggleBold')"><b>B</b></el-button></el-tooltip>
          <el-tooltip content="斜体"><el-button text :class="{ active: editor.isActive('italic') }" @click="run('toggleItalic')"><i>I</i></el-button></el-tooltip>
          <el-tooltip content="下划线"><el-button text :class="{ active: editor.isActive('underline') }" @click="run('toggleUnderline')"><u>U</u></el-button></el-tooltip>
          <el-tooltip content="删除线"><el-button text :class="{ active: editor.isActive('strike') }" @click="run('toggleStrike')"><s>S</s></el-button></el-tooltip>
          <el-color-picker v-model="color" size="small" @change="value => value && run('setColor', value)" />
          <el-tooltip content="高亮"><el-button text :class="{ active: editor.isActive('highlight') }" :icon="Brush" @click="run('toggleHighlight', { color: '#fff0a8' })" /></el-tooltip>
          <i class="divider"></i>
          <el-button text :class="{ active: editor.isActive('bulletList') }" @click="run('toggleBulletList')">• 列表</el-button>
          <el-button text :class="{ active: editor.isActive('orderedList') }" @click="run('toggleOrderedList')">1. 列表</el-button>
          <el-button text :class="{ active: editor.isActive('blockquote') }" @click="run('toggleBlockquote')">“ 引用</el-button>
          <el-button text :class="{ active: editor.isActive('codeBlock') }" @click="run('toggleCodeBlock')">&lt;/&gt;</el-button>
          <el-tooltip content="分割线"><el-button text :class="{ active: editor.isActive('horizontalRule') }" :icon="Minus" @click="run('setHorizontalRule')" /></el-tooltip>
          <i class="divider"></i>
          <el-tooltip content="左对齐"><el-button text :class="{ active: editor.isActive({ textAlign: 'left' }) }" @click="run('setTextAlign', 'left')"><span class="align-glyph align-left"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="居中"><el-button text :class="{ active: editor.isActive({ textAlign: 'center' }) }" @click="run('setTextAlign', 'center')"><span class="align-glyph align-center"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="右对齐"><el-button text :class="{ active: editor.isActive({ textAlign: 'right' }) }" @click="run('setTextAlign', 'right')"><span class="align-glyph align-right"><i></i><i></i><i></i></span></el-button></el-tooltip>
          <el-tooltip content="链接"><el-button text :icon="LinkIcon" @click="setLink" /></el-tooltip>
          <el-tooltip content="本地图片"><el-button text :icon="Picture" @click="addImage" /></el-tooltip>
          <el-tooltip content="手写画板"><el-button text :icon="EditPen" @click="handwritingVisible = true" /></el-tooltip>
          <i class="toolbar-spacer"></i>
          <el-tooltip content="撤销"><el-button text :disabled="!editor.can().undo()" :icon="RefreshLeft" @click="run('undo')" /></el-tooltip>
          <el-tooltip content="重做"><el-button text :disabled="!editor.can().redo()" :icon="RefreshRight" @click="run('redo')" /></el-tooltip>
        </div>

        <div class="paper"><EditorContent :editor="editor" /></div>
        <footer class="editor-footer"><span>{{ editor?.getText().length || 0 }} 字</span><span>{{ isDraft ? '按 Ctrl+S 保存并加入文档列表' : '停止输入后自动保存' }}</span></footer>
      </div>
    </section>

    <el-dialog v-model="folderDialog" title="新建文件夹" width="420px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="文件夹名称"><el-input v-model="folderForm.name" autofocus maxlength="30" show-word-limit placeholder="例如：工作项目" @keyup.enter="createFolder" /></el-form-item>
        <el-form-item label="上级目录"><el-select v-model="folderForm.parentId" clearable placeholder="根目录" style="width:100%"><el-option v-for="folder in index.folders" :key="folder.id" :label="folder.name" :value="folder.id" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="folderDialog = false">取消</el-button><el-button type="primary" @click="createFolder">创建</el-button></template>
    </el-dialog>
    <HandwritingPad v-model="handwritingVisible" @insert="insertDrawing" />
    <div v-if="contextMenu" class="context-menu" :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }" @click.stop>
      <button @click="deleteDocument(contextMenu.document)"><el-icon><Delete /></el-icon>删除文档</button>
    </div>
  </main>
</template>
