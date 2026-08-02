const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('localNote', {
  loadIndex: () => ipcRenderer.invoke('notes:load-index'), readNote: id => ipcRenderer.invoke('notes:read', id),
  saveNote: (document, content) => ipcRenderer.invoke('notes:save', document, content), createFolder: folder => ipcRenderer.invoke('notes:create-folder', folder), deleteTag: tag => ipcRenderer.invoke('notes:delete-tag', tag), deleteNote: id => ipcRenderer.invoke('notes:delete', id), pickImage: () => ipcRenderer.invoke('notes:pick-image'),
  saveDrawing: dataUrl => ipcRenderer.invoke('notes:save-drawing', dataUrl),
  onFlushRequest: callback => ipcRenderer.on('notes:flush-request', () => callback()),
  confirmClose: () => ipcRenderer.send('notes:flush-done')
})
