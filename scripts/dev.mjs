import { spawn } from 'node:child_process'
import { createServer as createNetServer } from 'node:net'
import electronPath from 'electron'
import { createServer as createViteServer } from 'vite'

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const probe = createNetServer()
    probe.unref()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      const port = typeof address === 'object' && address ? address.port : null
      probe.close(error => error ? reject(error) : resolve(port))
    })
  })
}

const port = await getAvailablePort()
const vite = await createViteServer({
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true
  }
})

await vite.listen()
const devServerUrl = vite.resolvedUrls?.local?.[0] || `http://127.0.0.1:${port}/`
console.log(`\nLocalNote 开发服务：${devServerUrl}`)

const electron = spawn(electronPath, ['.'], {
  cwd: process.cwd(),
  env: { ...process.env, VITE_DEV_SERVER_URL: devServerUrl },
  stdio: 'inherit'
})

let closing = false
async function shutdown(exitCode = 0) {
  if (closing) return
  closing = true
  if (!electron.killed) electron.kill()
  await vite.close()
  process.exit(exitCode)
}

electron.once('error', async error => {
  console.error('Electron 启动失败：', error)
  await shutdown(1)
})
electron.once('exit', code => shutdown(code ?? 0))
process.once('SIGINT', () => shutdown(0))
process.once('SIGTERM', () => shutdown(0))
