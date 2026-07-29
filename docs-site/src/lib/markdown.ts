/**
 * Minimal Markdown → HTML for rendering notice/announcement strings.
 * Handles: headings, bold, italic, links, line breaks, paragraphs.
 * NOT a full parser — just enough for system notices.
 */
export function simpleMarkdownToHtml(md: string): string {
  if (!md) return ''
  // Detect if input is already HTML (starts with a tag)
  if (/^\s*<[a-z][\s>]/i.test(md)) return md

  let html = md
    // Escape HTML entities in source (preserve existing tags if already HTML)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headings (# to ######)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Bold **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic *text* or _text_ (not inside links/bold)
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Auto-link bare URLs (not already inside href="")
  html = html.replace(
    /(?<!href="|">)(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Line breaks: two trailing spaces or explicit \n\n → paragraph
  // Split by double newline into paragraphs
  const paragraphs = html.split(/\n{2,}/)
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim()
      if (!trimmed) return ''
      // Don't wrap headings in <p>
      if (/^<h[1-6]>/.test(trimmed)) return trimmed
      // Convert single newlines to <br>
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}
