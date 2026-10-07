/**
 * richTextUtils: Helper utilities for converting between Markdown and HTML
 * for live contentEditable Notion-style blocks.
 */

export function markdownToHtml(md: string): string {
  if (!md) return '';

  let html = md;

  // Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

  // Mark highlight: ==text==
  html = html.replace(/==([^=\n]+)==/g, '<mark class="inline-highlight hl-yellow">$1</mark>');

  // Underline tag: <u>text</u> (ensure class is applied)
  html = html.replace(/<u>([\s\S]*?)<\/u>/gi, '<u class="inline-underline">$1</u>');

  // Markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="inline-link">$1</a>');

  // Italic: *text* or _text_ (after bold has been parsed)
  html = html.replace(/(?:^|\s)\*([^*\s\n][^*\n]*?)\*(?=\s|$|[.,!?;:])/g, ' <em>$1</em>');
  html = html.replace(/(?:^|\s)_([^_\s\n][^_\n]*?)_(?=\s|$|[.,!?;:])/g, ' <em>$1</em>');

  return html;
}

export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Replace newlines / break tags
  md = md.replace(/<div><br\s*\/?><\/div>/gi, '\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<\/div><div>/gi, '\n');
  md = md.replace(/<div>/gi, '\n');
  md = md.replace(/<\/div>/gi, '');

  // Bold: <strong>, <b>, or style="font-weight: bold"
  md = md.replace(/<(?:strong|b)(?:\s+[^>]*)?>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');

  // Italic: <em>, <i>
  md = md.replace(/<(?:em|i)(?:\s+[^>]*)?>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // Underline: <u>
  md = md.replace(/<u(?:\s+[^>]*)?>([\s\S]*?)<\/u>/gi, '<u>$1</u>');

  // Strikethrough: <del>, <s>, <strike>
  md = md.replace(/<(?:del|s|strike)(?:\s+[^>]*)?>([\s\S]*?)<\/(?:del|s|strike)>/gi, '~~$1~~');

  // Inline code: <code>
  md = md.replace(/<code(?:\s+[^>]*)?>([\s\S]*?)<\/code>/gi, '`$1`');

  // Links: <a href="url">text</a>
  md = md.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Clean empty formatting tags
  md = md.replace(/\*\*\s*\*\*/g, '');

  return md;
}
