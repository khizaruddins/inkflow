export function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n");
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, p1) => {
    return p1.replace(/<li>(.*?)<\/li>/gi, "- $1\n") + "\n";
  });
  md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, p1) => {
    let index = 1;
    return p1.replace(/<li>(.*?)<\/li>/gi, () => `${index++}. $1\n`) + "\n";
  });
  md = md.replace(/<hr\s*\/?>/gi, "---\n\n");
  return md.trim();
}

export function markdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/^\s*\-\s+(.*$)/gim, "<ul><li>$1</li></ul>");
  html = html.replace(/\n\n/g, "</p><p>");
  return `<p>${html}</p>`.replace(/<p><\/p>/g, "");
}
