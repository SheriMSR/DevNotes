import React from 'react';

/**
 * FormattedText: Parses inline markdown and HTML formatting tags:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * - <u>underline</u> -> <u>
 * - ~~strikethrough~~ -> <del>
 * - `inline code` -> <code className="inline-code">
 * - <mark class="...">highlight</mark> or ==highlight== -> <mark className="...">
 * - [link text](url) -> <a>
 * - \n -> <br />
 */

interface FormattedTextProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // Patterns ordered by specificity
  const patterns: {
    type: 'code' | 'markClass' | 'markPlain' | 'markEq' | 'underline' | 'del' | 'bold' | 'italic' | 'link';
    regex: RegExp;
  }[] = [
    { type: 'code', regex: /^`([^`\n]+)`/ },
    { type: 'markClass', regex: /^<mark class="([^"]*)">([\s\S]*?)<\/mark>/i },
    { type: 'markPlain', regex: /^<mark>([\s\S]*?)<\/mark>/i },
    { type: 'markEq', regex: /^==([^=\n]+)==/ },
    { type: 'underline', regex: /^<u>([\s\S]*?)<\/u>/i },
    { type: 'del', regex: /^~~([^~\n]+)~~/ },
    { type: 'bold', regex: /^(?:\*\*([^*\n]+)\*\*|__([^_\n]+)__)/ },
    { type: 'italic', regex: /^(?:\*([^*\n]+)\*|_([^_\n]+)_)/ },
    { type: 'link', regex: /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/ },
  ];

  while (remaining.length > 0) {
    let matched = false;

    // Check each pattern at the start of remaining string
    for (const { type, regex } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        matched = true;
        const matchedLength = match[0].length;
        const key = `fmt-${keyCounter++}`;

        switch (type) {
          case 'code':
            nodes.push(
              <code key={key} className="inline-code">
                {match[1]}
              </code>
            );
            break;

          case 'markClass':
            nodes.push(
              <mark key={key} className={`inline-highlight ${match[1] || 'hl-yellow'}`}>
                {parseInlineMarkdown(match[2])}
              </mark>
            );
            break;

          case 'markPlain':
            nodes.push(
              <mark key={key} className="inline-highlight hl-yellow">
                {parseInlineMarkdown(match[1])}
              </mark>
            );
            break;

          case 'markEq':
            nodes.push(
              <mark key={key} className="inline-highlight hl-yellow">
                {parseInlineMarkdown(match[1])}
              </mark>
            );
            break;

          case 'underline':
            nodes.push(
              <u key={key} className="inline-underline">
                {parseInlineMarkdown(match[1])}
              </u>
            );
            break;

          case 'del':
            nodes.push(
              <del key={key} className="inline-del">
                {parseInlineMarkdown(match[1])}
              </del>
            );
            break;

          case 'bold': {
            const inner = match[1] || match[2];
            nodes.push(
              <strong key={key} className="inline-bold">
                {parseInlineMarkdown(inner)}
              </strong>
            );
            break;
          }

          case 'italic': {
            const inner = match[1] || match[2];
            nodes.push(
              <em key={key} className="inline-italic">
                {parseInlineMarkdown(inner)}
              </em>
            );
            break;
          }

          case 'link':
            nodes.push(
              <a
                key={key}
                href={match[2]}
                target="_blank"
                rel="noreferrer"
                className="inline-link"
                onClick={(e) => e.stopPropagation()}
              >
                {match[1]}
              </a>
            );
            break;
        }

        remaining = remaining.slice(matchedLength);
        break;
      }
    }

    if (!matched) {
      // Find index of next potential special character: `, <, =, ~, *, _, [, \n
      const nextSpecial = remaining.slice(1).search(/[`<=~*_\[\n]/);
      if (nextSpecial === -1) {
        // No more special characters, push the rest
        if (remaining.includes('\n')) {
          const lines = remaining.split('\n');
          lines.forEach((line, idx) => {
            if (idx > 0) nodes.push(<br key={`br-${keyCounter++}`} />);
            if (line) nodes.push(line);
          });
        } else {
          nodes.push(remaining);
        }
        break;
      } else {
        const plainSlice = remaining.slice(0, nextSpecial + 1);
        if (plainSlice.includes('\n')) {
          const lines = plainSlice.split('\n');
          lines.forEach((line, idx) => {
            if (idx > 0) nodes.push(<br key={`br-${keyCounter++}`} />);
            if (line) nodes.push(line);
          });
        } else {
          nodes.push(plainSlice);
        }
        remaining = remaining.slice(nextSpecial + 1);
      }
    }
  }

  return nodes;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  content,
  className,
  style,
  placeholder,
}) => {
  if (!content) {
    if (placeholder) {
      return (
        <span className={className} style={{ ...style, color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.7 }}>
          {placeholder}
        </span>
      );
    }
    return null;
  }

  return (
    <span className={className} style={style}>
      {parseInlineMarkdown(content)}
    </span>
  );
};
