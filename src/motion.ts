// Interactive layer. Everything here is an enhancement: the page is complete without it.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

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
      const duration = 900
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
  const links = new Map<string, HTMLAnchorElement[]>()
  document.querySelectorAll<HTMLAnchorElement>('.nav__links > a[href^="#"], .rail a').forEach((a) => {
    const id = a.hash.slice(1)
    links.set(id, [...(links.get(id) ?? []), a])
  })
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      links.forEach((group) => group.forEach((a) => a.removeAttribute('aria-current')))
      links.get(entry.target.id)?.forEach((a) => a.setAttribute('aria-current', 'true'))
    }
  }, { rootMargin: '-45% 0px -50% 0px' })
  links.forEach((_, id) => {
    const section = document.getElementById(id)
    if (section) io.observe(section)
  })
}

/** Split "a → b → c" flows into steps so they can light up in order. */
function flows() {
  document.querySelectorAll<HTMLElement>('.flow').forEach((el) => {
    const parts = (el.textContent ?? '').split(' → ')
    el.replaceChildren()
    parts.forEach((part, i) => {
      if (i) {
        const arrow = document.createElement('span')
        arrow.className = 'flow__arrow'
        arrow.setAttribute('aria-hidden', 'true')
        arrow.style.setProperty('--i', String(i))
        arrow.textContent = '→'
        el.append(' ', arrow, ' ')
      }
      const step = document.createElement('span')
      step.className = 'flow__step'
      step.style.setProperty('--i', String(i))
      step.textContent = part
      el.append(step)
    })
  })
}

/** Mark sequences as "in" once they are on screen; CSS plays the stagger. */
function sequences() {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-in')
      io.unobserve(entry.target)
    }
  }, { threshold: 0.6 })
  document.querySelectorAll('.flow, .process').forEach((el) => io.observe(el))
}

export function initMotion() {
  scrollSpy()
  if (reducedMotion) return
  document.documentElement.classList.add('motion')
  flows()
  sequences()
  countUp()
}
