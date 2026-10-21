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

/** Cursor-following glow on cards (reads --mx / --my in CSS). */
function spotlight() {
  document.addEventListener('pointermove', (event) => {
    const card = (event.target as Element).closest<HTMLElement>('.spot, .btn--ghost')
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

/** Custom cursor: precise dot + lagging ring that reacts to what it hovers. */
function cursor() {
  const root = document.createElement('div')
  root.className = 'cursor'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = '<span class="cursor__ring"><span class="cursor__label"></span></span><span class="cursor__dot"></span>'
  document.body.append(root)
  document.documentElement.classList.add('has-cursor')

  const ring = root.querySelector<HTMLElement>('.cursor__ring')!
  const dot = root.querySelector<HTMLElement>('.cursor__dot')!
  const label = root.querySelector<HTMLElement>('.cursor__label')!
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y
  let running = false

  // The ring eases towards the pointer; the loop stops once it has caught up.
  const follow = () => {
    rx += (x - rx) * 0.18
    ry += (y - ry) * 0.18
    ring.style.transform = `translate(${rx}px, ${ry}px)`
    running = Math.abs(x - rx) + Math.abs(y - ry) > 0.2
    if (running) requestAnimationFrame(follow)
  }

  document.addEventListener('pointermove', (event) => {
    x = event.clientX
    y = event.clientY
    dot.style.transform = `translate(${x}px, ${y}px)`
    root.classList.remove('is-hidden')
    if (!running) { running = true; requestAnimationFrame(follow) }

    const target = event.target as Element
    const link = target.closest('a, button, summary, [popovertarget]')
    const external = link?.matches('a[target="_blank"]') ?? false
    root.classList.toggle('is-link', !!link)
    root.classList.toggle('is-text', !!target.closest('input, textarea, select'))
    root.classList.toggle('is-dark', !!target.closest('.projets, .rdv, .marquee, .idcard__sign, .socle, .btn--primary'))
    label.textContent = external ? '↗' : ''
  }, { passive: true })
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'))
  document.addEventListener('pointerdown', () => root.classList.add('is-down'))
  document.addEventListener('pointerup', () => root.classList.remove('is-down'))
}

/** Expanding ring where the user clicks. */
function clickRipple() {
  document.addEventListener('pointerdown', (event) => {
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${event.clientX}px`
    ripple.style.top = `${event.clientY}px`
    document.body.append(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  })
}

/** Shared backdrop drifts slightly against the mouse. */
function backdropParallax() {
  const stage = document.querySelector<HTMLElement>('.stage')
  if (!stage) return
  document.addEventListener('pointermove', (event) => {
    stage.style.setProperty('--px', String(event.clientX / innerWidth - 0.5))
    stage.style.setProperty('--py', String(event.clientY / innerHeight - 0.5))
  }, { passive: true })
}

/** Tech band speeds up and leans with scroll velocity. */
function marqueeVelocity() {
  const track = document.querySelector<HTMLElement>('.marquee__track')
  const animation = track?.getAnimations()[0]
  if (!track || !animation) return
  let lastY = scrollY, speed = 0, running = false
  // Runs only while scrolling, then settles back to the resting speed.
  const loop = () => {
    const velocity = scrollY - lastY
    lastY = scrollY
    speed += (velocity - speed) * 0.1
    animation.playbackRate = 1 + Math.min(Math.abs(speed) / 6, 4)
    track.style.setProperty('--skew', `${Math.max(-8, Math.min(8, -speed / 3))}deg`)
    running = Math.abs(speed) > 0.05 || velocity !== 0
    if (running) requestAnimationFrame(loop)
    else { animation.playbackRate = 1; track.style.setProperty('--skew', '0deg') }
  }
  addEventListener('scroll', () => {
    if (!running) { running = true; lastY = scrollY; requestAnimationFrame(loop) }
  }, { passive: true })
}

export function initMotion() {
  scrollSpy()
  if (reducedMotion) return
  countUp()
  marqueeVelocity()
  if (!finePointer) return
  cursor()
  clickRipple()
  backdropParallax()
  spotlight()
  document.querySelectorAll<HTMLElement>('.idcard').forEach((card) => tilt(card))
  document.querySelectorAll<HTMLElement>('.oss__card, .cert, .mity__shot').forEach((card) => tilt(card, 4))
  document.querySelectorAll<HTMLElement>('.btn:not(.idcard__cv)').forEach((btn) => magnetic(btn))
}
