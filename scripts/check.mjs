// Checks the texts and the built site. Run after the build (CI does both):
//
//   node scripts/build.mjs && node scripts/check.mjs
//
// Texts: every language has exactly English's keys, none empty, and each keeps
// English's {placeholders} and <tags> (like the app's `pnpm i18n:check`).
// Built pages: every local link, image, video and script points at a file that
// exists, every #anchor at an id on the page, no {placeholder} is left over, and the
// structured data parses.

import { readdir, readFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { LOCALES } from "../src/site.mjs"
import { loadMessages } from "./build.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DIST = path.join(ROOT, "dist")
const problems = []

// --- texts ------------------------------------------------------------------------

const placeholders = s => (s.match(/\{\w+\}/g) ?? []).sort().join(" ")
const tags = s => (s.match(/<\/?[a-z]+/g) ?? []).sort().join(" ")

const [source, ...others] = LOCALES.map(l => l.lang)
const english = await loadMessages(source)
for (const [key, text] of Object.entries(english)) {
  if (!text.trim()) problems.push(`${source}: "${key}" is empty`)
}
for (const lang of others) {
  const messages = await loadMessages(lang)
  for (const key of Object.keys(english)) {
    const text = messages[key]
    if (text === undefined) { problems.push(`${lang}: "${key}" is missing`); continue }
    if (!text.trim()) problems.push(`${lang}: "${key}" is empty`)
    if (placeholders(text) !== placeholders(english[key])) {
      problems.push(`${lang}: "${key}" has placeholders "${placeholders(text)}", English has "${placeholders(english[key])}"`)
    }
    if (tags(text) !== tags(english[key])) {
      problems.push(`${lang}: "${key}" has tags "${tags(text)}", English has "${tags(english[key])}"`)
    }
  }
  for (const key of Object.keys(messages)) {
    if (!(key in english)) problems.push(`${lang}: "${key}" isn't in English (left over?)`)
  }
}

// --- built pages ------------------------------------------------------------------

const exists = p => stat(p).then(() => true, () => false)

if (!(await exists(DIST))) {
  problems.push("dist/ doesn't exist; run `node scripts/build.mjs` first")
} else {
  const pages = (await readdir(DIST, { recursive: true })).filter(f => f.endsWith(".html"))
  for (const file of pages) {
    const html = await readFile(path.join(DIST, file), "utf8")
    const dir = path.dirname(path.join(DIST, file))
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))

    if (!/<html lang="[a-z]{2}-CH">/.test(html)) problems.push(`${file}: <html> has no lang`)
    const leftover = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").match(/\{\w+\}/)
    if (leftover) problems.push(`${file}: placeholder ${leftover[0]} left in the page`)

    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(json) } catch { problems.push(`${file}: the structured data isn't valid JSON`) }
    }

    for (const [, url] of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url)) continue
      if (url.startsWith("#")) {
        if (url.length > 1 && !ids.has(url.slice(1))) problems.push(`${file}: no id for ${url}`)
        continue
      }
      const clean = url.split(/[?#]/)[0]
      // 404.html links from the site root; the other pages relative to themselves.
      let target = clean.startsWith("/") ? path.join(DIST, clean) : path.join(dir, clean)
      if (clean === "" || clean.endsWith("/")) target = path.join(target, "index.html")
      if (!(await exists(target))) problems.push(`${file}: ${url} doesn't exist`)
    }
  }
  console.log(`Checked ${LOCALES.length} languages and ${pages.length} pages`)
}

if (problems.length) {
  for (const p of problems) console.error(`::error::${p}`)
  process.exit(1)
}
console.log("All good")
