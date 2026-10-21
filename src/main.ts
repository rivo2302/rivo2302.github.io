// Self-hosted fonts: no third-party request, no render-blocking stylesheet.
import '@fontsource-variable/inter'
import '@fontsource/nunito-sans/latin-600.css'
import '@fontsource/nunito-sans/latin-700.css'
import './style.css'
import { initMotion } from './motion'

const CONTACT_EMAIL = 'rivo2302@gmail.com'

// Mobile menu (native popover): close it once a section link is chosen.
const menu = document.querySelector<HTMLElement>('#menu')
menu?.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a') && menu.matches(':popover-open')) menu.hidePopover()
})

// GitHub Pages is static: the form opens the visitor's mail client with the message pre-filled.
const form = document.querySelector<HTMLFormElement>('#contact-form')

form?.addEventListener('submit', (event) => {
  event.preventDefault()
  const data = new FormData(form)
  const field = (name: string) => String(data.get(name) ?? '').trim()

  const body = `${field('message')}\n\n— ${field('name')} <${field('email')}>`
  const params = new URLSearchParams({ subject: field('subject'), body })
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString().replaceAll('+', '%20')}`
})

// "Prendre rendez-vous" opens the booking agenda in a modal instead of leaving the site.
const modal = document.querySelector<HTMLDialogElement>('#booking-modal')
const frame = modal?.querySelector<HTMLIFrameElement>('iframe')

document.querySelectorAll<HTMLAnchorElement>('[data-booking]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!modal || !frame || event.metaKey || event.ctrlKey || event.shiftKey) return // let modified clicks open a tab
    event.preventDefault()
    frame.src ||= frame.dataset.src ?? '' // load the agenda on first open only
    modal.showModal()
  })
})
modal?.querySelector('.modal__close')?.addEventListener('click', () => modal.close())
// Click on the backdrop closes the modal.
modal?.addEventListener('click', (event) => { if (event.target === modal) modal.close() })

initMotion()
