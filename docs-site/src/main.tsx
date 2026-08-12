import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { DEFAULT_LANG, docsHref, routerBasename, splitLangPath } from './config'
import { loadRegistries } from './lib/registry'
import './styles/docs.css'

// The URL decides the language: `/docs/guide/keys` is zh, `/docs/en/guide/keys`
// is English. Deriving it here (rather than from localStorage) is what lets the
// prerendered HTML and the first client render agree.
const { lang, path, prefixed } = splitLangPath(window.location.pathname)

if (lang === DEFAULT_LANG && prefixed) {
  // `/docs/zh/…` is a spelling nobody should link to (nginx 301s it away in
  // production). Normalizing it here keeps dev and any un-updated proxy on the
  // canonical URL, and cannot loop: the target carries no language prefix.
  window.location.replace(docsHref(path) + window.location.search + window.location.hash)
} else {
  const tree = (
    <StrictMode>
      <BrowserRouter basename={routerBasename(lang)}>
        <App lang={lang} />
      </BrowserRouter>
    </StrictMode>
  )

  // Mount only once the content registry is in memory. Prerendered pages ship
  // the article markup in the HTML, so React must be able to render that same
  // article on its first pass — mounting earlier would hydrate a loading
  // spinner over real content and force React to throw the tree away.
  // Hydration is also conditional on the markup belonging to this exact route:
  // anything else (the SPA fallback shell, a server that serves one HTML file
  // for every URL) is client-rendered from scratch instead.
  const mount = () => {
    const el = document.getElementById('root')!
    if (el.dataset.ssr === `${lang}:${path}`) hydrateRoot(el, tree)
    else createRoot(el).render(tree)
  }
  loadRegistries(lang).then(mount, mount)
}
