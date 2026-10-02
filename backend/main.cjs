// const { app, BrowserWindow, ipcMain, dialog, net, protocol } = require('electron')
// const fs = require('fs/promises')
// const path = require('path')
// const { pathToFileURL } = require('url')

// protocol.registerSchemesAsPrivileged([{ scheme: 'localnote', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }])

// const dataDir = () => path.join(app.getPath('documents'), 'LocalNote')
// const indexPath = () => path.join(dataDir(), 'index.json')
// const defaultIndex = { documents: [], folders: [{ id: 'folder-inbox', name: '收集箱', parentId: null }] }

// async function ensureStore() {
//   await fs.mkdir(path.join(dataDir(), 'docs'), { recursive: true })
//   try { await fs.access(indexPath()) } catch { await fs.writeFile(indexPath(), JSON.stringify(defaultIndex, null, 2)) }
// }
// async function readIndex() { await ensureStore(); return JSON.parse(await fs.readFile(indexPath(), 'utf8')) }
// async function writeIndex(index) {
//   await ensureStore()
//   const target = indexPath()
//   const temp = `${target}.tmp`
//   await fs.writeFile(temp, JSON.stringify(index, null, 2), 'utf8')
//   await fs.rename(temp, target)
// }

// const forceCloseWindows = new WeakSet()

// function createWindow() {
//   const window = new BrowserWindow({ width: 1280, height: 800, minWidth: 960, minHeight: 640, backgroundColor: '#f7f7f5', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } })
//   window.on('close', event => {
//     if (forceCloseWindows.has(window)) return
//     event.preventDefault()
//     window.webContents.send('notes:flush-request')
//   })
//   window.webContents.on('render-process-gone', () => {
//     if (!forceCloseWindows.has(window)) { forceCloseWindows.add(window); window.close() }
//   })
//   if (process.env.VITE_DEV_SERVER_URL) window.loadURL(process.env.VITE_DEV_SERVER_URL)
//   else window.loadFile(path.join(__dirname, '../dist/index.html'))
// }
// app.whenReady().then(() => {
//   protocol.handle('localnote', request => {
//     const assetName = path.basename(decodeURIComponent(new URL(request.url).pathname))
//     return net.fetch(pathToFileURL(path.join(dataDir(), 'assets', assetName)).toString())
//   })
//   createWindow()
//   app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow() })
// })
// app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// ipcMain.on('notes:flush-done', event => {
//   const window = BrowserWindow.fromWebContents(event.sender)
//   if (window && !window.isDestroyed()) { forceCloseWindows.add(window); window.close() }
// })
// ipcMain.handle('notes:load-index', readIndex)
// ipcMain.handle('notes:read', async (_, id) => {
//   const index = await readIndex(); const doc = index.documents.find(item => item.id === id)
//   if (!doc) return null
//   try { return JSON.parse(await fs.readFile(path.join(dataDir(), doc.filePath), 'utf8')) } catch { return { content: { type: 'doc', content: [{ type: 'paragraph' }] } } }
// })
// ipcMain.handle('notes:save', async (_, document, content) => {
//   const index = await readIndex(); const now = Date.now(); const existing = index.documents.find(item => item.id === document.id)
//   const id = document.id || `doc-${now}`; const filePath = existing?.filePath || `docs/${id}.json`
//   const record = { ...existing, ...document, id, filePath, updatedAt: now, createdAt: existing?.createdAt || now }
//   if (existing) Object.assign(existing, record); else index.documents.unshift(record)
//   await fs.writeFile(path.join(dataDir(), filePath), JSON.stringify({ content }, null, 2), 'utf8'); await writeIndex(index); return record
// })
// ipcMain.handle('notes:create-folder', async (_, folder) => { const index = await readIndex(); const record = { id: `folder-${Date.now()}`, name: folder.name, parentId: folder.parentId || null }; index.folders.push(record); await writeIndex(index); return record })
// ipcMain.handle('notes:delete-tag', async (_, tag) => {
//   const index = await readIndex()
//   index.documents.forEach(document => { document.tags = (document.tags || []).filter(item => item !== tag) })
//   await writeIndex(index)
//   return index.documents
// })
// async function collectAssetRefs(index) {
//   const refs = new Set()
//   for (const document of index.documents) {
//     if (!document.filePath) continue
//     try {
//       const content = await fs.readFile(path.join(dataDir(), document.filePath), 'utf8')
//       for (const match of content.matchAll(/localnote:\/\/asset\/([^\s"')]+)/g)) refs.add(match[1])
//     } catch { /* 文件缺失时忽略 */ }
//   }
//   return refs
// }

// ipcMain.handle('notes:delete', async (_, id) => {
//   const index = await readIndex()
//   const documentIndex = index.documents.findIndex(document => document.id === id)
//   if (documentIndex === -1) return index.documents
//   const [document] = index.documents.splice(documentIndex, 1)
//   const assetNames = []
//   if (document.filePath) {
//     const file = path.join(dataDir(), document.filePath)
//     try {
//       const content = await fs.readFile(file, 'utf8')
//       for (const match of content.matchAll(/localnote:\/\/asset\/([^\s"')]+)/g)) assetNames.push(match[1])
//       await fs.rm(file, { force: true })
//     } catch { /* 文件缺失时忽略 */ }
//   }
//   if (assetNames.length) {
//     const used = await collectAssetRefs(index)
//     for (const name of assetNames) {
//       if (!used.has(name)) await fs.rm(path.join(dataDir(), 'assets', name), { force: true })
//     }
//   }
//   await writeIndex(index)
//   return index.documents
// })
// ipcMain.handle('notes:pick-image', async () => { const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }] }); if (result.canceled) return null; const ext = path.extname(result.filePaths[0]); const fileName = `${Date.now()}${ext}`; const target = path.join(dataDir(), 'assets', fileName); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.copyFile(result.filePaths[0], target); return `localnote://asset/${fileName}` })
// ipcMain.handle('notes:save-drawing', async (_, dataUrl) => {
//   const match = typeof dataUrl === 'string' && dataUrl.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/)
//   if (!match) throw new Error('无效的手写图片数据')
//   const image = Buffer.from(match[1], 'base64')
//   if (!image.length || image.length > 10 * 1024 * 1024) throw new Error('手写图片大小超出限制')
//   const fileName = `drawing-${Date.now()}.png`
//   const target = path.join(dataDir(), 'assets', fileName)
//   await fs.mkdir(path.dirname(target), { recursive: true })
//   await fs.writeFile(target, image)
//   return `localnote://asset/${fileName}`
// })
