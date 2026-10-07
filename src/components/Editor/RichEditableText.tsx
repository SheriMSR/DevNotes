import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { markdownToHtml } from './richTextUtils';
import { FormattingBubble, type FormatType } from './FormattingBubble';
import type { AppLanguage } from '../../types';

interface RichEditableTextProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  isFocused?: boolean;
  lang?: AppLanguage;
  onChange: (newHtml: string) => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  onConvertToBlock?: (type: string) => void;
  onTriggerSlash?: (query: string, rect: DOMRect) => void;
  onCloseSlash?: () => void;
  onSlashKeyDown?: (e: React.KeyboardEvent) => boolean;
  onPaste?: (e: React.ClipboardEvent) => void;
}

export interface RichEditableTextRef {
  focus: () => void;
  applyFormat: (format: FormatType | string) => void;
}

export const RichEditableText = forwardRef<RichEditableTextRef, RichEditableTextProps>(({
  content,
  className = '',
  style,
  placeholder = '',
  isFocused = false,
  lang = 'vi',
  onChange,
  onEnter,
  onBackspaceEmpty,
  onConvertToBlock,
  onTriggerSlash,
  onCloseSlash,
  onSlashKeyDown,
  onPaste,
}, ref) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
  const isTypingRef = useRef(false);

  // Expose focus and format commands to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      elRef.current?.focus();
    },
    applyFormat: (format: FormatType | string) => {
      applyFormat(format);
    },
  }));

  // Initial load and external content update synchronization
  useEffect(() => {
    if (!elRef.current) return;

    // Convert markdown to rich HTML if needed
    const htmlToDisplay = markdownToHtml(content);

    // Only update innerHTML if it doesn't match and user is not currently actively typing in this element
    if (document.activeElement !== elRef.current) {
      if (elRef.current.innerHTML !== htmlToDisplay) {
        elRef.current.innerHTML = htmlToDisplay;
      }
    } else if (!isTypingRef.current && elRef.current.innerHTML !== htmlToDisplay) {
      elRef.current.innerHTML = htmlToDisplay;
    }
  }, [content]);

  // Focus management
  useEffect(() => {
    if (isFocused && elRef.current) {
      elRef.current.focus();
      // Move caret to end of text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(elRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFocused]);

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim()) {
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setBubblePos({
          top: Math.max(10, rect.top - 8),
          left: Math.max(140, rect.left + rect.width / 2),
        });
      } catch (err) {
        setBubblePos(null);
      }
    } else {
      setBubblePos(null);
    }
  };

  const applyFormat = (formatType: FormatType | string) => {
    elRef.current?.focus();

    if (formatType === 'bold') {
      document.execCommand('bold', false);
    } else if (formatType === 'italic') {
      document.execCommand('italic', false);
    } else if (formatType === 'underline') {
      document.execCommand('underline', false);
    } else if (formatType === 'strike') {
      document.execCommand('strikeThrough', false);
    } else if (formatType === 'code') {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedContent = range.extractContents();
        const codeEl = document.createElement('code');
        codeEl.className = 'inline-code';
        codeEl.appendChild(selectedContent);
        range.insertNode(codeEl);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(codeEl);
        sel.addRange(newRange);
      }
    } else if (formatType.startsWith('hl-') || formatType === 'highlight') {
      const colorClass = formatType.startsWith('hl-') ? formatType : 'hl-yellow';
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedContent = range.extractContents();
        const markEl = document.createElement('mark');
        markEl.className = `inline-highlight ${colorClass}`;
        markEl.appendChild(selectedContent);
        range.insertNode(markEl);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(markEl);
        sel.addRange(newRange);
      }
    }

    if (elRef.current) {
      isTypingRef.current = true;
      onChange(elRef.current.innerHTML);
      setTimeout(() => {
        isTypingRef.current = false;
      }, 50);
    }
    handleSelection();
  };

  const handleInput = () => {
    if (!elRef.current) return;
    const currentHtml = elRef.current.innerHTML;
    const currentText = elRef.current.textContent || '';

    isTypingRef.current = true;
    onChange(currentHtml);
    setTimeout(() => {
      isTypingRef.current = false;
    }, 50);

    // Smart Markdown conversions at start of empty block
    if (onConvertToBlock) {
      if (currentText === '* ' || currentText === '- ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('bullet');
        return;
      }
      if (currentText === '1. ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('numbered');
        return;
      }
      if (currentText === '[] ' || currentText === '[ ] ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('todo');
        return;
      }
      if (currentText === '# ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('heading1');
        return;
      }
      if (currentText === '## ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('heading2');
        return;
      }
      if (currentText === '### ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('heading3');
        return;
      }
      if (currentText === '> ') {
        elRef.current.innerHTML = '';
        onConvertToBlock('callout');
        return;
      }
    }

    // Slash command trigger detection
    if (onTriggerSlash) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const text = sel.anchorNode.textContent || '';
        const offset = sel.anchorOffset;
        const textBeforeCursor = text.slice(0, offset);
        const match = textBeforeCursor.match(/(?:^|\s)\/([^\s/]*)$/);
        if (match) {
          const query = match[1];
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          onTriggerSlash(query, rect);
        } else {
          onCloseSlash?.();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if slash menu handles key
    if (onSlashKeyDown && onSlashKeyDown(e)) {
      return;
    }

    // Keyboard shortcuts for formatting (Cmd on Mac, Ctrl on Win/Linux)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isMod = isMac ? e.metaKey : e.ctrlKey;

    if (isMod) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        applyFormat('bold');
        return;
      }
      if (key === 'i') {
        e.preventDefault();
        applyFormat('italic');
        return;
      }
      if (key === 'u') {
        e.preventDefault();
        applyFormat('underline');
        return;
      }
      if (key === 'e') {
        e.preventDefault();
        applyFormat('code');
        return;
      }
      if ((key === 'x' && e.shiftKey) || (key === 's' && e.shiftKey)) {
        e.preventDefault();
        applyFormat('strike');
        return;
      }
      if (key === 'h' && e.shiftKey) {
        e.preventDefault();
        applyFormat('hl-yellow');
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
      return;
    }

    if (e.key === 'Backspace') {
      const text = elRef.current?.textContent || '';
      if (!text.trim()) {
        e.preventDefault();
        onBackspaceEmpty?.();
        return;
      }
    }
  };

  const handleInternalPaste = (e: React.ClipboardEvent) => {
    if (onPaste) {
      onPaste(e);
      if (e.defaultPrevented) return;
    }

    // Clean single-line paste: Prevent foreign inline styles (e.g. font-size: 14px, font-weight: normal)
    // from overriding block typography (e.g. H1/H2/H3/callout).
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    if (!plainText) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(plainText);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (elRef.current) {
      elRef.current.textContent = (elRef.current.textContent || '') + plainText;
    }

    if (elRef.current) {
      isTypingRef.current = true;
      onChange(elRef.current.innerHTML);
      setTimeout(() => {
        isTypingRef.current = false;
      }, 50);
    }
  };

  return (
    <>
      <div
        ref={elRef}
        contentEditable
        suppressContentEditableWarning
        className={`rich-editable-area ${className}`}
        style={style}
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handleInternalPaste}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        onBlur={() => {
          setTimeout(() => setBubblePos(null), 150);
        }}
      />
      {bubblePos && (
        <FormattingBubble
          position={bubblePos}
          lang={lang}
          onApplyFormat={applyFormat}
        />
      )}
    </>
  );
});
