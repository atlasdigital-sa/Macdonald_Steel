import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = process.cwd()
const publicDir = join(root, 'dist')
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon' }

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const file = pathname === '/' ? join(publicDir, 'index.html') : join(publicDir, normalize(pathname).replace(/^[/\\]+/, ''))
  try {
    const data = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
    response.end(data)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('Not found')
  }
})

const firstPort = Number(process.env.PORT || 5173)
const startServer = (port) => {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < firstPort + 10) {
      console.warn(`Port ${port} is busy — trying ${port + 1}.`)
      startServer(port + 1)
      return
    }
    throw error
  })
  server.listen(port, '127.0.0.1', () => console.log(`Macdonald Steel is running at http://127.0.0.1:${port}`))
}

startServer(firstPort)
