// Everything about the site that isn't words: where it lives, its languages, the app's
// repository and release files. The words are in src/locales/<lang>.json.

export const SITE_URL = "https://rappespalter.dev"
export const REPO = "https://github.com/amir-begic/rappespalter"

// Who runs the site, for the imprint and the privacy notice (src/legal.mjs). Change
// LEGAL_UPDATED whenever the privacy notice's content changes.
export const OWNER = "Amir Begic"
export const EMAIL = "amir@begic.eu"
export const HOST = { name: "Hostpoint AG", place: "Rapperswil-Jona", url: "https://www.hostpoint.ch" }
export const LEGAL_UPDATED = "2026-11-05"

// First is the default: it's served at the root, the others at /<lang>/. `tag` is the
// Swiss locale (as in the app) for <html lang>, hreflang and og:locale, so screen
// readers, hyphenation and search engines treat the pages as Swiss.
export const LOCALES = [
  { lang: "en", tag: "en-CH", name: "English", short: "EN" },
  { lang: "de", tag: "de-CH", name: "Deutsch", short: "DE" },
  { lang: "fr", tag: "fr-CH", name: "Français", short: "FR" },
  { lang: "it", tag: "it-CH", name: "Italiano", short: "IT" },
]

// The app's promote.yml makes a release the repository's *latest*; these links always
// point at that release's files, so the site needs no change per release. The names
// are the ones release.yml builds (matrix.files).
const latest = name => `${REPO}/releases/latest/download/${name}`
export const DOWNLOADS = [
  { os: "windows", name: "Windows", href: latest("Rappespalter-Setup.exe") },
  { os: "mac", name: "macOS", href: latest("Rappespalter-mac-arm64.dmg") },
  { os: "linux", name: "Linux", href: latest("Rappespalter-linux-x64.AppImage") },
]

// The six feature sections with a screenshot (src/assets/shots/<shot>.webp, its size
// in pixels), each on a stage in one of the app's colours. The shots come from the
// app repository: promo/shots (current look), and docs/screenshots for import.
export const FEATURES = [
  { id: "dashboard", shot: "dashboard", size: [1440, 900], stage: "blue" },
  { id: "import", shot: "import", size: [1440, 1000], stage: "yellow" },
  { id: "budgets", shot: "budgets", size: [1440, 900], stage: "green" },
  { id: "networth", shot: "networth", size: [1440, 900], stage: "pink" },
  { id: "portfolio", shot: "portfolio", size: [1440, 900], stage: "red" },
  { id: "projections", shot: "projections", size: [1440, 900], stage: "ink" },
]

export const MORE = ["goals", "rules", "trends", "tax", "data", "backup", "updates", "theme"]

export const STACK = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "SQLite", "Electron"]
