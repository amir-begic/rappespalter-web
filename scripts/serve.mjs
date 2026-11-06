// Serves dist/ for a local look, like the host does: folders serve their index.html,
// anything missing gets 404.html, pages get the Content Security Policy.
//
//   pnpm dev        (builds first)   or   node scripts/serve.mjs [port]

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist")
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173)
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4",
}

const isFile = p => stat(p).then(s => s.isFile(), () => false)

// The Content Security Policy the host will send (dist/.htaccess), so a local look
// shows anything it would block, in the browser console.
const csp = await readFile(path.join(DIST, ".htaccess"), "utf8")
  .then(text => text.match(/Content-Security-Policy "([^"]+)"/)?.[1], () => undefined)

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost")
  let file = path.join(DIST, decodeURIComponent(url.pathname))
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return }
  if (!(await isFile(file))) file = path.join(file, "index.html")
  let status = 200
  if (!(await isFile(file))) { file = path.join(DIST, "404.html"); status = 404 }
  const body = await readFile(file)
  const type = TYPES[path.extname(file)] ?? "application/octet-stream"

  // Videos need byte ranges for seeking (and Safari won't play them without).
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/)
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : 0
    const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${body.length}`, "Accept-Ranges": "bytes" })
    res.end(body.subarray(start, end + 1))
    return
  }
  res.writeHead(status, { "Content-Type": type, "Accept-Ranges": "bytes", ...(csp && { "Content-Security-Policy": csp }) })
  res.end(body)
}).listen(PORT, () => console.log(`http://localhost:${PORT}`))
