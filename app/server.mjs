import { createServer } from 'node:http'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const port = 5173
const host = '127.0.0.1'
const appDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(appDir, '..')
const distDir = path.join(appDir, 'dist')
const workspaceDir = path.join(rootDir, 'workspace')
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon']
])

const sendJson = (response, status, payload) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

const readBody = async (request) => {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

const saveCode = async (request, response) => {
  try {
    const body = JSON.parse(await readBody(request))
    const language = ['java', 'react'].includes(body.language) ? body.language : 'csharp'
    const code = typeof body.code === 'string' ? body.code : ''

    if (!code.trim()) {
      sendJson(response, 400, { ok: false, error: 'No generated code to save' })
      return
    }

    const extension = language === 'react' ? 'tsx' : language === 'java' ? 'java' : 'cs'
    const directory = path.join(workspaceDir, language)
    const fileName = `generated-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`
    const filePath = path.join(directory, fileName)

    await fs.mkdir(directory, { recursive: true })
    await fs.writeFile(filePath, code.endsWith('\n') ? code : `${code}\n`, 'utf8')
    sendJson(response, 200, { ok: true, fileName, path: `workspace/${language}/${fileName}` })
  } catch {
    sendJson(response, 500, { ok: false, error: 'Unable to save generated code' })
  }
}

const serveStatic = async (request, response) => {
  if (!existsSync(distDir)) {
    sendJson(response, 500, { ok: false, error: 'Build the app first with npm run build inside the app directory' })
    return
  }

  const url = new URL(request.url || '/', `http://${host}:${port}`)
  const requestedPath = decodeURIComponent(url.pathname)
  const safePath = requestedPath === '/' ? '/index.html' : requestedPath
  const filePath = path.normalize(path.join(distDir, safePath))

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  const finalPath = existsSync(filePath) ? filePath : path.join(distDir, 'index.html')
  const extension = path.extname(finalPath)
  const contentType = contentTypes.get(extension) || 'application/octet-stream'

  try {
    const content = await fs.readFile(finalPath)
    response.writeHead(200, { 'Content-Type': contentType })
    response.end(content)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', `http://${host}:${port}`)
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.url === '/api/save' && request.method === 'POST') {
    await saveCode(request, response)
    return
  }

  await serveStatic(request, response)
})

server.listen(port, host, () => {
  console.log(`Portable Code Assistant running at http://${host}:${port}`)
})
