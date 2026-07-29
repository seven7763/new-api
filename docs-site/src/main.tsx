import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { loadRegistries } from './lib/registry'
import './styles/docs.css'

// Warm the base content registry (zh) in parallel with React mounting. zh is
// always needed — it is the fallback base every language resolves through (it
// holds the client guides + live-data pages), so its chunk should download
// alongside the entry bundle instead of only after the first effect runs.
void loadRegistries('zh')

// Router basename derives from the Vite base ('/docs/' in prod, '/' in dev), so
// the same build works whether mounted at the site root or under /docs.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
