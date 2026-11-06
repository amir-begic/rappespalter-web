// The page, as plain functions returning HTML. scripts/build.mjs calls page() once per
// language. `t(key)` returns that language's text (trusted HTML from src/locales);
// anything else that goes into the markup passes through esc().

import { REPO, LOCALES, DOWNLOADS, FEATURES, MORE, STACK, SITE_URL, OWNER, EMAIL, HOST, LEGAL_UPDATED } from "./site.mjs"

const tagOf = lang => LOCALES.find(l => l.lang === lang).tag

export const esc = s => String(s)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;")

// Text for an attribute: the translation without tags, escaped.
const attr = html => esc(html.replace(/<br>/g, " ").replace(/<[^>]+>/g, ""))

// Where a language's home page lives, relative to the site root.
export const langPath = lang => (lang === LOCALES[0].lang ? "" : `${lang}/`)

// Pages besides the home page, by the path after the language: "privacy/", "imprint/".
// ctx.sub is the current page's ("" on the home page); the header's section links lead
// back to the home page from there, and its language switch stays on the same page.
const home = ctx => (ctx.sub ? `${ctx.root}${langPath(ctx.lang)}` : "")

// ---------------------------------------------------------------------------------
// Ink blobs, the same shapes as the app's page decoration (src/lib/blob.ts and
// components/blobs.tsx there): seeded, so every build draws the same outlines, and
// four variants per blob that SVG <animate> morphs between.

function random(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function blobPath(seed, points = 8, radius = 70, wobble = 14) {
  const rnd = random(seed)
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2
    const r = radius + (rnd() * 2 - 1) * wobble
    return [Math.cos(a) * r, Math.sin(a) * r]
  })
  const p = i => pts[(i + points) % points]
  const f = n => n.toFixed(1)
  let d = `M${f(p(0)[0])},${f(p(0)[1])}`
  for (let i = 0; i < points; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d + "Z"
}

export function blob(seed, className, morph = "20s") {
  const VARIANTS = 4
  const shapes = Array.from({ length: VARIANTS }, (_, v) => blobPath(seed * 100 + v))
  const times = Array.from({ length: VARIANTS + 1 }, (_, i) => +(i / VARIANTS).toFixed(3)).join(";")
  const splines = Array(VARIANTS).fill("0.45 0 0.55 1").join(";")
  return `<svg class="blob ${className}" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">` +
    `<path d="${shapes[0]}"><animate attributeName="d" dur="${morph}" repeatCount="indefinite" ` +
    `values="${[...shapes, shapes[0]].join(";")}" keyTimes="${times}" calcMode="spline" keySplines="${splines}"/></path></svg>`
}

// ---------------------------------------------------------------------------------
// Icons: 24×24, drawn with the current colour.

const svg = (body, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`

const ICONS = {
  windows: svg(`<path fill="currentColor" d="M3 5.5 10.5 4.5v7H3zM11.5 4.4 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z"/>`),
  mac: svg(`<rect x="4" y="4.5" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 19h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`),
  linux: svg(`<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7 9 3 3-3 3M12.5 15H17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  github: svg(`<path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2"/>`),
  check: svg(`<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`),
  arrow: svg(`<path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>`),
  pause: svg(`<path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>`, "icon icon-pause"),
  play: svg(`<path fill="currentColor" d="M7 4.5v15L19.5 12z"/>`, "icon icon-play"),
}

const logo = `<svg class="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">` +
  `<path fill="var(--pop-blue)" d="M14.5 3a12.5 12.5 0 0 0 0 25z"/><path fill="var(--pop-yellow)" d="M17.5 4.5a12 12 0 0 1 0 24z"/></svg>`

// ---------------------------------------------------------------------------------

function header(ctx) {
  const { t, lang, root } = ctx
  const langs = LOCALES.map(l => {
    const current = l.lang === lang
    return `<li><a href="${root}${langPath(l.lang)}${ctx.sub ?? ""}" hreflang="${l.tag}" lang="${l.tag}" data-lang="${l.lang}"` +
      `${current ? ` aria-current="page"` : ""} title="${l.name}"><abbr title="${l.name}">${l.short}</abbr></a></li>`
  }).join("")
  return `
<a class="skip" href="#main">${t("nav.skip")}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${root}${langPath(lang)}">${logo}<span>Rappespalter</span></a>
    <nav class="nav" aria-label="Rappespalter">
      <a href="${home(ctx)}#features">${t("nav.features")}</a>
      <a href="${home(ctx)}#privacy">${t("nav.privacy")}</a>
      <a href="${home(ctx)}#download">${t("nav.download")}</a>
      <a href="${home(ctx)}#contribute">${t("nav.contribute")}</a>
    </nav>
    <nav aria-label="${attr(t("nav.language"))}"><ul class="langs">${langs}</ul></nav>
    <a class="icon-link" href="${REPO}" aria-label="GitHub">${ICONS.github}</a>
  </div>
</header>`
}

function hero(ctx) {
  const { t, root, version } = ctx
  const badge = version ? t("hero.badgeVersion", { version }) : t("hero.badge")
  // Without JS, or on a phone, the button goes to the download section. main.js points
  // it at the visitor's installer when it can tell the system.
  const osData = DOWNLOADS.map(d => {
    const key = `hero.download${d.os[0].toUpperCase()}${d.os.slice(1)}`
    return `data-href-${d.os}="${esc(d.href)}" data-label-${d.os}="${attr(t(key))}"`
  }).join(" ")
  return `
<section class="hero">
  <div class="wrap">
    <p class="badge"><span class="dot"></span>${badge}</p>
    <h1>${t("hero.title")}</h1>
    <p class="lead">${t("hero.lead")}</p>
    <div class="actions">
      <a class="btn btn-primary" href="#download" data-download ${osData}>${ICONS.arrow}<span>${t("hero.download")}</span></a>
      <a class="btn btn-ghost" href="${REPO}">${ICONS.github}<span>${t("hero.source")}</span></a>
    </div>
    <p class="meta">${t("hero.meta")}</p>
  </div>
  <div class="wrap wrap-wide">
    <figure class="video-frame">
      <video autoplay muted loop playsinline preload="metadata" poster="${root}assets/video/poster-16x9.webp"
        aria-label="${attr(t("hero.video"))}" width="1280" height="720">
        <source src="${root}assets/video/promo-9x16.mp4" type="video/mp4" media="(max-width: 640px) and (orientation: portrait)">
        <source src="${root}assets/video/promo-16x9.mp4" type="video/mp4">
      </video>
      <button class="video-toggle" type="button" data-video-toggle
        data-label-pause="${attr(t("hero.pause"))}" data-label-play="${attr(t("hero.play"))}" aria-label="${attr(t("hero.pause"))}">
        ${ICONS.pause}${ICONS.play}
      </button>
    </figure>
  </div>
</section>`
}

function tiles(ctx) {
  const { t } = ctx
  const tile = (color, value, key) =>
    `<li class="tile tile-${color}"><span class="tile-value">${value}</span><span class="tile-label">${t(key)}</span></li>`
  return `
<section class="wrap" aria-label="${attr(t("tiles.label"))}">
  <ul class="tiles">
    ${tile("green", "0", "tiles.cloud")}
    ${tile("red", "3", "tiles.systems")}
    ${tile("blue", "4", "tiles.languages")}
    ${tile("yellow", t("tiles.free"), "tiles.price")}
  </ul>
</section>`
}

function features(ctx) {
  const { t, root } = ctx
  const rows = FEATURES.map(({ id, shot, size, stage }, i) => `
  <article class="feature${i % 2 ? " feature-flip" : ""} reveal">
    <div class="feature-text">
      <p class="kicker">${t(`f.${id}.kicker`)}</p>
      <h3>${t(`f.${id}.title`)}</h3>
      <p>${t(`f.${id}.text`)}</p>
    </div>
    <div class="stage stage-${stage}">
      <img src="${root}assets/shots/${shot}.webp" width="${size[0]}" height="${size[1]}" loading="lazy" decoding="async"
        alt="${attr(t(`f.${id}.alt`))}">
    </div>
  </article>`).join("")
  const more = MORE.map(id => `
    <li class="reveal"><h4>${t(`more.${id}.title`)}</h4><p>${t(`more.${id}.text`)}</p></li>`).join("")
  return `
<section id="features" class="section">
  <div class="wrap">
    <header class="section-head reveal">
      <p class="kicker">${t("features.kicker")}</p>
      <h2>${t("features.title")}</h2>
      <p class="lead">${t("features.lead")}</p>
    </header>
    ${rows}
    <h3 class="more-title reveal">${t("more.title")}</h3>
    <ul class="more">${more}
    </ul>
  </div>
</section>`
}

function swiss(ctx) {
  const { t } = ctx
  const items = ["pillars", "banks", "tax"]
    .map(k => `<li>${ICONS.check}<span>${t(`swiss.${k}`)}</span></li>`).join("")
  return `
<section class="section">
  <div class="wrap split reveal">
    <div>
      <p class="kicker">${t("swiss.kicker")}</p>
      <h2>${t("swiss.title")}</h2>
      <p class="lead">${t("swiss.lead")}</p>
    </div>
    <ul class="checks">${items}</ul>
  </div>
</section>`
}

function privacy(ctx) {
  const { t } = ctx
  const pills = ["account", "sync", "tracking"].map(k => `<li>${ICONS.check}${t(`privacy.${k}`)}</li>`).join("")
  const rows = ["portfolio", "tax", "updates"].map(k =>
    `<tr><th scope="row">${t(`privacy.online.${k}`)}</th><td>${t(`privacy.online.${k}Sends`)}</td></tr>`).join("")
  return `
<section id="privacy" class="section section-block block-blue">
  <div class="wrap">
    <header class="section-head reveal">
      <p class="kicker">${t("privacy.kicker")}</p>
      <h2>${t("privacy.title")}</h2>
      <p class="lead">${t("privacy.lead")}</p>
    </header>
    <ul class="pills reveal">${pills}</ul>
    <div class="online reveal">
      <h3>${t("privacy.online.title")}</h3>
      <table>
        <thead><tr><th scope="col">${t("privacy.online.feature")}</th><th scope="col">${t("privacy.online.sends")}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p>${t("privacy.online.note")}</p>
    </div>
  </div>
</section>`
}

function download(ctx) {
  const { t, version } = ctx
  const cards = DOWNLOADS.map(d => `
    <li class="card download-card reveal" data-os="${d.os}">
      <span class="yours">${t("download.yours")}</span>
      ${ICONS[d.os].replace('class="icon"', 'class="icon icon-lg"')}
      <h3>${d.name}</h3>
      <p class="file">${t(`download.${d.os}.file`)}</p>
      <a class="btn btn-primary" href="${esc(d.href)}">${ICONS.arrow}<span>${t("download.button")}</span><span class="sr-only"> (${d.name})</span></a>
      <p class="note">${t(`download.${d.os}.note`)}</p>
    </li>`).join("")
  return `
<section id="download" class="section">
  <div class="wrap">
    <header class="section-head reveal">
      <p class="kicker">${t("download.kicker")}</p>
      <h2>${t("download.title")}</h2>
      <p class="lead">${t("download.lead")}</p>
      ${version ? `<p class="version">${t("download.version", { version })}</p>` : ""}
    </header>
    <ul class="downloads">${cards}
    </ul>
    <p class="beta-note reveal">${t("download.beta")} <a href="${REPO}/issues/new">${t("contribute.newIssue")}</a></p>
    <p class="center"><a class="text-link" href="${REPO}/releases">${t("download.releases")}</a></p>
  </div>
</section>`
}

function contribute(ctx) {
  const { t } = ctx
  const stack = STACK.map(s => `<li>${s}</li>`).join("")
  const help = [
    ["banks", `${REPO}/blob/main/src/lib/camt.ts`],
    ["translate", `${REPO}/blob/main/docs/I18N.md`],
    ["assets", `${REPO}/blob/main/docs/ASSETS.md`],
    ["issues", `${REPO}/issues`],
  ].map(([k, href]) => `
      <li class="reveal"><a href="${href}"><h4>${t(`contribute.${k}.title`)}</h4><p>${t(`contribute.${k}.text`)}</p></a></li>`).join("")
  return `
<section id="contribute" class="section section-block block-ink">
  <div class="wrap">
    <header class="section-head reveal">
      <p class="kicker">${t("contribute.kicker")}</p>
      <h2>${t("contribute.title")}</h2>
      <p class="lead">${t("contribute.lead")}</p>
    </header>
    <div class="split reveal">
      <div>
        <h3>${t("contribute.run")}</h3>
        <pre class="code"><code>git clone ${REPO}.git
cd rappespalter
pnpm install
cp .env.example .env
pnpm exec prisma migrate dev
pnpm dev</code></pre>
        <p class="note">${t("contribute.runNote")}</p>
      </div>
      <div>
        <h3>${t("contribute.stack")}</h3>
        <ul class="stack">${stack}</ul>
      </div>
    </div>
    <h3 class="help-title reveal">${t("contribute.help")}</h3>
    <ul class="help">${help}
    </ul>
    <div class="actions center reveal">
      <a class="btn btn-light" href="${REPO}">${ICONS.github}<span>${t("contribute.repo")}</span></a>
      <a class="btn btn-ghost-light" href="${REPO}/issues/new">${t("contribute.newIssue")}</a>
    </div>
  </div>
</section>`
}

function nameStory(ctx) {
  const { t } = ctx
  return `
<section class="section">
  <div class="wrap name reveal">
    <h2>${t("name.title")}</h2>
    <p class="lead">${t("name.text")}</p>
  </div>
</section>`
}

function footer(ctx) {
  const { t, root, lang } = ctx
  return `
<footer class="site-footer">
  <div class="wrap footer-inner">
    <a class="brand" href="${root}${langPath(lang)}">${logo}<span>Rappespalter</span></a>
    <div>
      <p>${t("footer.license")} <a href="${REPO}">GitHub</a> · <a href="${REPO}/blob/main/LICENSE">MIT</a></p>
      <p>${t("footer.disclaimer")}</p>
      <p>${t("footer.site")}</p>
      <p><a href="${root}${langPath(lang)}privacy/">${t("footer.privacy")}</a> · <a href="${root}${langPath(lang)}imprint/">${t("footer.imprint")}</a></p>
    </div>
  </div>
</footer>`
}

// ---------------------------------------------------------------------------------

function head(ctx, { title, description, canonical, alternates = true, noindex = false }) {
  const { lang, root } = ctx
  const sub = ctx.sub ?? ""
  const links = alternates
    ? LOCALES.map(l => `<link rel="alternate" hreflang="${l.tag}" href="${SITE_URL}/${langPath(l.lang)}${sub}">`).join("\n  ") +
      `\n  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/${sub}">`
    : ""
  return `<!DOCTYPE html>
<html lang="${tagOf(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${attr(title)}</title>
  <meta name="description" content="${attr(description)}">
  ${noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${canonical}">`}
  ${links}
  <meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#171a2b" media="(prefers-color-scheme: dark)">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Rappespalter">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/assets/video/poster-16x9.webp">
  <meta property="og:locale" content="${tagOf(lang).replace("-", "_")}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${root}assets/icon.png" type="image/png">
  <link rel="apple-touch-icon" href="${root}assets/icon.png">
  <link rel="preload" href="${root}assets/fonts/bricolage-grotesque-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${root}assets/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${root}assets/styles.css">
  <script>document.documentElement.classList.add("js")</script>${ctx.headScript ?? ""}
  <script src="${root}assets/main.js" defer></script>
</head>`
}

const decoration = `
<div class="blobs" aria-hidden="true">
  ${blob(11, "blob-yellow", "19s")}
  ${blob(23, "blob-pink", "23s")}
  ${blob(37, "blob-blue", "17s")}
</div>`

export function page(ctx) {
  const { t, lang } = ctx
  return `${head(ctx, {
    title: t("meta.title"),
    description: t("meta.description"),
    canonical: `${SITE_URL}/${langPath(lang)}`,
  })}
<body>${decoration}
${header(ctx)}
<main id="main">
${hero(ctx)}
${tiles(ctx)}
${features(ctx)}
${swiss(ctx)}
${privacy(ctx)}
${download(ctx)}
${contribute(ctx)}
${nameStory(ctx)}
</main>
${footer(ctx)}
</body>
</html>
`
}

// The server answers any missing path with /404.html (.htaccess, ErrorDocument), from
// any depth, so it links with absolute paths (root "/") and offers every language.
export function notFound(ctx) {
  const { t } = ctx
  const homes = LOCALES.map(l =>
    `<li><a href="/${langPath(l.lang)}" hreflang="${l.tag}" lang="${l.tag}">${l.name}</a></li>`).join("")
  return `${head(ctx, { title: `${t("notfound.title")} · Rappespalter`, description: t("meta.description"), alternates: false, noindex: true })}
<body>${decoration}
<main id="main" class="notfound">
  <div class="wrap">
    <a class="brand" href="/">${logo}<span>Rappespalter</span></a>
    <h1>${t("notfound.title")}</h1>
    <p class="lead">${t("notfound.text")}</p>
    <p><a class="btn btn-primary" href="/">${t("notfound.home")}</a></p>
    <ul class="langs">${homes}</ul>
  </div>
</main>
</body>
</html>
`
}

// ---------------------------------------------------------------------------------
// The imprint and the privacy notice (Swiss FADP): one page each per language, at
// <lang>/imprint/ and <lang>/privacy/. Who and where come from site.mjs.

function legal(ctx, { title, body }) {
  const { t, lang } = ctx
  const date = new Intl.DateTimeFormat(tagOf(lang), { dateStyle: "long", timeZone: "UTC" })
    .format(new Date(`${LEGAL_UPDATED}T12:00:00Z`))
  return `${head(ctx, { title: `${t(title)} · Rappespalter`, description: t("meta.description"), canonical: `${SITE_URL}/${langPath(lang)}${ctx.sub}` })}
<body>${decoration}
${header(ctx)}
<main id="main" class="legal">
  <div class="wrap">
    <h1>${t(title)}</h1>
    <p class="updated">${t("legal.updated", { date })}</p>
    ${body}
    <p><a class="text-link" href="${home(ctx)}">${t("legal.back")}</a></p>
  </div>
</main>
${footer(ctx)}
</body>
</html>
`
}

function person() {
  return `<p>${esc(OWNER)}<br><a href="mailto:${esc(EMAIL)}">${esc(EMAIL)}</a></p>`
}

export function imprintPage(ctx) {
  const { t } = ctx
  return legal({ ...ctx, sub: "imprint/" }, {
    title: "imprint.title",
    body: `
    <h2>${t("imprint.responsible")}</h2>
    ${person()}
    <p>${t("imprint.project")} <a href="${REPO}">${esc(REPO.replace("https://", ""))}</a></p>
    <h2>${t("imprint.hosting")}</h2>
    <p><a href="${HOST.url}">${esc(HOST.name)}</a>, ${esc(HOST.place)}</p>
    <h2>${t("imprint.liability.title")}</h2>
    <p>${t("imprint.liability.text")}</p>`,
  })
}

export function privacyPage(ctx) {
  const { t } = ctx
  const host = HOST.name
  const section = (key, vars) => `
    <h2>${t(`dp.${key}.title`)}</h2>
    <p>${t(`dp.${key}.text`, vars)}</p>`
  const homeLink = `${ctx.root}${langPath(ctx.lang)}#privacy`
  return legal({ ...ctx, sub: "privacy/" }, {
    title: "dp.title",
    body: `
    <p class="lead">${t("dp.intro")}</p>
    <h2>${t("dp.controller")}</h2>
    ${person()}
    ${section("hosting", { host })}
    ${section("none")}
    ${section("links")}
    ${section("email")}
    ${section("app", { link: homeLink })}
    ${section("rights")}`,
  })
}
