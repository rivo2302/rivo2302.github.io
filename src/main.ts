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

initMotion()
