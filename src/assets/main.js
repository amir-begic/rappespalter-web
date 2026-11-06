// Small touches on top of a page that works without it: the download button for the
// visitor's system, the video's pause button, reduced motion, sections fading in, and
// remembering a language picked in the header.

(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)")

  // The language picked in the header, so the root page stops redirecting
  // (scripts/build.mjs, languageRedirect).
  document.querySelectorAll("a[data-lang]").forEach(a =>
    a.addEventListener("click", () => {
      try { localStorage.setItem("lang", a.dataset.lang) } catch { /* private mode */ }
    }))

  // Which installer fits. Phones and tablets get none: the button keeps pointing at the
  // download section. (iPads say "Mac" but have a touch screen.)
  const platform = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase()
  const mobile = navigator.userAgentData?.mobile || /android|iphone|ipad/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1 && platform.includes("mac")
  const os = mobile ? null
    : platform.includes("win") ? "windows"
    : platform.includes("mac") ? "mac"
    : /linux|x11/.test(platform) ? "linux"
    : null
  if (os) {
    const button = document.querySelector("[data-download]")
    if (button) {
      button.href = button.dataset[`href${os[0].toUpperCase()}${os.slice(1)}`]
      button.querySelector("span").textContent = button.dataset[`label${os[0].toUpperCase()}${os.slice(1)}`]
    }
    document.querySelector(`.download-card[data-os="${os}"]`)?.classList.add("is-yours")
  }

  // The hero video: a pause button (it loops), and paused from the start for anyone who
  // asked their system for less motion.
  const video = document.querySelector(".video-frame video")
  const toggle = document.querySelector("[data-video-toggle]")
  if (video && toggle) {
    const sync = () => {
      toggle.classList.toggle("is-paused", video.paused)
      toggle.setAttribute("aria-label", video.paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause)
    }
    toggle.addEventListener("click", () => (video.paused ? video.play() : video.pause()))
    video.addEventListener("play", sync)
    video.addEventListener("pause", sync)
    if (reduceMotion.matches) {
      video.removeAttribute("autoplay")
      video.pause()
    }
    sync()
  }

  // CSS stops the blobs drifting; their shape-changing <animate> only stops from here.
  const blobs = () => document.querySelectorAll(".blob").forEach(svg =>
    reduceMotion.matches ? svg.pauseAnimations() : svg.unpauseAnimations())
  blobs()
  reduceMotion.addEventListener("change", blobs)

  // Sections fade up as they scroll in (styles.css, .reveal).
  const items = document.querySelectorAll(".reveal")
  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    items.forEach(el => el.classList.add("in"))
    return
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add("in")
      observer.unobserve(entry.target)
    }
  }, { rootMargin: "0px 0px -8% 0px" })
  items.forEach(el => observer.observe(el))
})()
