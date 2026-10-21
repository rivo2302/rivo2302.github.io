// Interactive motion layer. Everything here is an enhancement: the page is complete without it.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches

/** Count stats up from 0 when they scroll into view. */
function countUp() {
  const items = document.querySelectorAll<HTMLElement>('[data-count]')
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      io.unobserve(entry.target)
      const el = entry.target as HTMLElement
      const target = Number(el.dataset.count)
      const start = performance.now()
      const duration = 1400
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        el.textContent = String(Math.round(target * (1 - (1 - t) ** 3))) // ease-out cubic
        if (t < 1) requestAnimationFrame(tick)
      }
      el.textContent = '0'
      requestAnimationFrame(tick)
    }
  }, { threshold: 0.6 })
  items.forEach((el) => io.observe(el))
}

/** Highlight the nav link of the section currently on screen. */
function scrollSpy() {
  const links = new Map<string, HTMLAnchorElement>()
  document.querySelectorAll<HTMLAnchorElement>('.nav__links > a[href^="#"]').forEach((a) => links.set(a.hash.slice(1), a))
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      links.forEach((a) => a.removeAttribute('aria-current'))
      links.get(entry.target.id)?.setAttribute('aria-current', 'true')
    }
  }, { rootMargin: '-45% 0px -50% 0px' })
  links.forEach((_, id) => {
    const section = document.getElementById(id)
    if (section) io.observe(section)
  })
}

/** Cursor-following glow on cards (reads --mx / --my in CSS). */
function spotlight() {
  document.addEventListener('pointermove', (event) => {
    const card = (event.target as Element).closest<HTMLElement>('.spot')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    card.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, { passive: true })
}

/** 3D tilt + light glare on the portrait card. */
function tilt(card: HTMLElement, maxDeg = 7) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * maxDeg}deg) rotateY(${(x - 0.5) * maxDeg}deg)`
    card.style.setProperty('--gx', `${x * 100}%`)
    card.style.setProperty('--gy', `${y * 100}%`)
  })
  card.addEventListener('pointerleave', () => { card.style.transform = '' })
}

/** Buttons drift slightly towards the cursor. */
function magnetic(button: HTMLElement, strength = 0.2) {
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect()
    const dx = (event.clientX - rect.left - rect.width / 2) * strength
    const dy = (event.clientY - rect.top - rect.height / 2) * strength
    button.style.translate = `${dx}px ${dy}px`
  })
  button.addEventListener('pointerleave', () => { button.style.translate = '' })
}

export function initMotion() {
  scrollSpy()
  if (reducedMotion) return
  countUp()
  if (!finePointer) return
  spotlight()
  document.querySelectorAll<HTMLElement>('.idcard').forEach((card) => tilt(card))
  document.querySelectorAll<HTMLElement>('.btn:not(.idcard__cv)').forEach((btn) => magnetic(btn))
}
