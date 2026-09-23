import hljs from 'highlight.js';

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

const COMMON_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'html',
  'xml',
  'css',
  'scss',
  'json',
  'yaml',
  'bash',
  'shell',
  'sql',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'markdown',
];

/**
 * Parses raw HTML, detects any <pre><code> blocks, and injects
 * syntax highlighting tokens with highlight.js for rich, colorful code display.
 */
export function highlightCodeBlocks(html: string): string {
  if (!html) return html;

  return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi, (match, attrs, code) => {
    // If already highlighted, return original
    if (code.includes('class="hljs-') || code.includes("class='hljs-")) return match;

    const langMatch = attrs.match(/class=["'](?:language-)?([a-zA-Z0-9_-]+)["']/);
    const lang = langMatch ? langMatch[1] : undefined;
    const rawCode = decodeHtml(code);

    let highlighted = '';
    let detectedLang = lang || '';

    try {
      if (lang && hljs.getLanguage(lang)) {
        highlighted = hljs.highlight(rawCode, { language: lang, ignoreIllegals: true }).value;
      } else {
        const auto = hljs.highlightAuto(rawCode, COMMON_LANGUAGES);
        highlighted = auto.value;
        detectedLang = auto.language || '';
      }
    } catch {
      highlighted = code;
    }

    const langClass = detectedLang ? ` language-${detectedLang}` : '';
    // Preserve existing attributes and append hljs class
    const cleanAttrs = attrs.replace(/class=["'][^"']*["']/, '');
    return `<pre><code${cleanAttrs} class="hljs${langClass}">${highlighted}</code></pre>`;
  });
}
