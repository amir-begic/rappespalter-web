# rappespalter.dev

The website for [Rappespalter](https://github.com/amir-begic/rappespalter), the
local-first, open-source personal finance app for Switzerland. One page, in English,
German, French and Italian.

Plain HTML, CSS and a little JavaScript. No framework and no dependencies: a small Node
script fills one page template with each language's texts.

## Working on it

Needs Node.js 22 or newer.

```bash
npm run dev      # build, then serve dist/ at http://localhost:4173
npm run build    # build into dist/
npm run check    # check texts and links (after a build)
```

`RAPPESPALTER_VERSION=1.5.1 npm run build` shows a version on the page, as CI does.

## Layout

```
src/
  page.mjs          # the home page, the privacy notice, the imprint and the 404 page
  site.mjs          # URLs, languages, owner and host, download files, features and screenshots
  locales/          # the texts: en.json (the source), de.json, fr.json, it.json
  assets/
    styles.css      # all styling; colours and fonts follow the app
    main.js         # download button for the visitor's system, video pause, fade-ins
    fonts/          # Bricolage Grotesque and Space Grotesk (OFL), self-hosted
    shots/          # app screenshots (WebP)
    video/          # the promo video, 16:9 and 9:16, with posters
scripts/
  build.mjs         # src → dist/ (pages, 404, sitemap, robots.txt, .htaccess, assets)
  check.mjs         # texts match English; every link and file exists
  serve.mjs         # local preview, like the host (with its Content Security Policy)
```

English is served at `/`, the others at `/de/`, `/fr/` and `/it/`; each language has
its privacy notice at `privacy/` and its imprint at `imprint/`. A first visit to `/`
moves to the browser's language if it's one of ours; picking a language in the header
is remembered.

## Texts

`src/locales/en.json` is the source. A text may hold `<br>`, `<code>` and `{placeholders}`;
every translation has the same keys, placeholders and tags (the check fails otherwise,
like the app's `pnpm i18n:check`). The wording follows the app: informal *du* / *tu*,
Swiss German spelling (*ss*, «guillemets»), and the terms in the app's glossary
([docs/I18N.md](https://github.com/amir-begic/rappespalter/blob/main/docs/I18N.md)).
French gets its no-break spaces before `: ; ? !` at build time.

The German, French and Italian texts haven't been reviewed by a native speaker yet.

## Screenshots and video

From the app repository, always made from the demo database (made-up data):

- `shots/`: `promo/shots/*.png` (current look) scaled to 1440 px wide, and
  `docs/screenshots/import.png` (no promo shot of Import). Converted with
  `ffmpeg -i in.png -vf scale=1440:-2 -c:v libwebp -quality 82 out.webp`.
- `video/`: `promo/videos/*.mp4` re-encoded to 720p, 30 fps, H.264, no audio:
  `ffmpeg -i in.mp4 -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an out.mp4`
  (`scale=720:-2` for the vertical one). Posters are the frame at 7.5 s.

## Deploying

The site is hosted by Hostpoint in Switzerland.
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and checks every
push and pull request, and publishes `main` by copying `dist/` to the web folder over
SSH with `rsync` (files no longer in the build are removed). It also runs daily, so the
version on the page follows the app's latest promoted release.

The build writes `dist/.htaccess`, which Hostpoint's Apache reads: HTTPS only, `www.`
to the bare domain, the 404 page, security headers (a strict Content Security Policy
that allows only the site's own files and its two inline scripts, by hash) and caching.
After each upload the workflow checks the live site and warns if those headers are
missing.

### Once, at Hostpoint

1. **Domain:** add `rappespalter.dev` to the hosting and point the domain at Hostpoint
   (its nameservers, or the `A`/`AAAA` records the Control Panel shows). Note the web
   folder it uses (for example `~/www/rappespalter.dev`).
2. **HTTPS:** turn on the free Let's Encrypt certificate for the domain. `.dev` domains
   only open over HTTPS (the whole TLD is on the browsers' HSTS preload list), so the
   site is unreachable until the certificate is issued.
3. **SSH:** enable SSH access and add a key made only for deploying:
   ```bash
   ssh-keygen -t ed25519 -f rappespalter-deploy -N "" -C "rappespalter.dev deploy"
   ```
   Add `rappespalter-deploy.pub` to the account's authorized SSH keys. Then record the
   server's host key, and compare its fingerprint with the one Hostpoint shows:
   ```bash
   ssh-keyscan -p 22 <ssh host> > known_hosts
   ssh-keygen -lf known_hosts
   ```
   Log in once by hand (`ssh -i rappespalter-deploy <user>@<ssh host>`) and check that
   `rsync --version` works there.

### Once, in this GitHub repository

**Settings → Secrets and variables → Actions:**

| Kind     | Name                    | Value                                                     |
| -------- | ----------------------- | --------------------------------------------------------- |
| Variable | `HOSTPOINT_HOST`        | the SSH host from the Control Panel                       |
| Variable | `HOSTPOINT_USER`        | the SSH user                                              |
| Variable | `HOSTPOINT_PATH`        | the domain's web folder, e.g. `www/rappespalter.dev`      |
| Variable | `HOSTPOINT_PORT`        | only if SSH isn't on port 22                              |
| Secret   | `HOSTPOINT_SSH_KEY`     | the contents of `rappespalter-deploy` (the private key)   |
| Secret   | `HOSTPOINT_KNOWN_HOSTS` | the contents of `known_hosts`                             |

`HOSTPOINT_PATH` must be the domain's own folder: the upload empties it of everything
that isn't part of the build (only `.well-known/` is left alone). The workflow refuses
`/`, `~` and paths with `..`.

The site assumes it lives at the root of the domain: the 404 page links with absolute
paths.

The download buttons point at `github.com/amir-begic/rappespalter/releases/latest/download/…`,
so the app repository has to be public and have a promoted (latest) release.

## Privacy and legal

The site sets no cookies, has no analytics and loads nothing from other servers: fonts,
images and video are served from Hostpoint in Switzerland. Links to GitHub are plain
links. The only personal data processed is Hostpoint's server log.

The privacy notice (Swiss FADP) and the imprint are in every language. Who runs the
site, the host and the notice's date are in `src/site.mjs`; change `LEGAL_UPDATED`
whenever the notice's content changes. They aren't legal advice: have them checked if
the project becomes commercial or starts collecting data.

## License

[MIT](LICENSE). The fonts are under the SIL Open Font License (`src/assets/fonts/`).
