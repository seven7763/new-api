import type { HighlighterCore } from 'shiki/core'

/**
 * Lazy single-instance Shiki highlighter with only the languages used in docs
 * so the JS engine bundle stays small (no WASM download). Shiki core + the JS
 * regex engine are themselves dynamically imported on first use, so they land
 * in their own chunk (loaded when a code block first renders) instead of riding
 * along in the shared content chunk. Code blocks show a plain <pre> until then.
 */
let corePromise: Promise<HighlighterCore> | null = null

const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  shell: 'bash',
  sh: 'bash',
  curl: 'bash',
  // header-style snippets colorize well as yaml; full http grammar is ~400 kB
  http: 'yaml',
}

function getCore() {
  if (!corePromise) {
    corePromise = (async () => {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
        import('shiki/core'),
        import('shiki/engine/javascript'),
      ])
      return createHighlighterCore({
        themes: [import('@shikijs/themes/one-dark-pro')],
        langs: [
          import('@shikijs/langs/bash'),
          import('@shikijs/langs/json'),
          import('@shikijs/langs/python'),
          import('@shikijs/langs/javascript'),
          import('@shikijs/langs/typescript'),
          import('@shikijs/langs/yaml'),
          import('@shikijs/langs/toml'),
        ],
        engine: createJavaScriptRegexEngine({ forgiving: true }),
      })
    })()
  }
  return corePromise
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const core = await getCore()
  const resolved = LANG_ALIASES[lang] || lang
  const loaded = core.getLoadedLanguages()
  const useLang = loaded.includes(resolved) ? resolved : 'bash'
  return core.codeToHtml(code, {
    lang: useLang,
    theme: 'one-dark-pro',
  })
}
