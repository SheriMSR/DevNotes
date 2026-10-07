import React, { useRef } from 'react';
import type { Block, BlockType, LanguageId, AppLanguage } from '../../types';
import { ExecutableCodeBlock } from './ExecutableCodeBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { TableBlock } from './TableBlock';
import { RichEditableText, type RichEditableTextRef } from './RichEditableText';
import { 
  Check, 
  Trash2, 
  Lightbulb, 
  AlertTriangle, 
  Info, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ListTree,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

interface BlockItemProps {
  block: Block;
  indexInGroup?: number;
  isSlashActive?: boolean;
  isFocused?: boolean;
  lang?: AppLanguage;
  onUpdateBlock: (updated: Block) => void;
  onDeleteBlock: (id: string) => void;
  onTurnBlockInto?: (blockId: string, newType: BlockType) => void;
  onOpenBlockMenu?: (blockId: string, anchorEl: HTMLElement) => void;
  onSendToStudio?: (code: string, language: LanguageId) => void;
  onTriggerSlash?: (blockId: string, query: string, rect: DOMRect) => void;
  onCloseSlash?: () => void;
  onSlashKeyDown?: (e: React.KeyboardEvent) => boolean;
  onEnterNextBlock?: (currentBlockId: string, type: BlockType, initialContent?: string) => void;
  onPasteMultipleBlocks?: (currentBlockId: string, lines: string[]) => void;
  onSplitBlock?: (currentBlockId: string) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  indexInGroup = 1,
  isSlashActive = false,
  isFocused = false,
  lang = 'vi',
  onUpdateBlock,
  onDeleteBlock,
  onTurnBlockInto,
  onOpenBlockMenu,
  onSendToStudio,
  onTriggerSlash,
  onCloseSlash,
  onSlashKeyDown,
  onEnterNextBlock,
  onPasteMultipleBlocks,
  onSplitBlock,
}) => {
  const [showFlashcardAnswer, setShowFlashcardAnswer] = React.useState(false);
  const isEn = lang === 'en';
  const richRef = useRef<RichEditableTextRef>(null);

  const getCalloutIcon = (variant?: string) => {
    switch (variant) {
      case 'tip':
        return <Lightbulb size={18} color="#10b981" />;
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'concept':
        return <BookOpen size={18} color="#6366f1" />;
      case 'info':
      default:
        return <Info size={18} color="#0ea5e9" />;
    }
  };

  const handleContentChange = (newHtml: string) => {
    onUpdateBlock({ ...block, content: newHtml });
  };

  const handleConvertToBlock = (type: string) => {
    if (onTurnBlockInto) {
      onTurnBlockInto(block.id, type as BlockType);
    } else {
      onUpdateBlock({ ...block, type: type as BlockType });
    }
  };

  const handleSlashKeyDown = (e: React.KeyboardEvent): boolean => {
    if (isSlashActive && onSlashKeyDown) {
      return onSlashKeyDown(e);
    }
    return false;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteText = e.clipboardData.getData('text');
    if (!pasteText) return;
    const rawLines = pasteText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length > 1 && onPasteMultipleBlocks) {
      e.preventDefault();
      onPasteMultipleBlocks(block.id, rawLines);
    }
  };

  const renderBlockActions = () => (
    <div className="block-actions-right">
      {onOpenBlockMenu && (
        <button
          type="button"
          className="icon-btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBlockMenu(block.id, e.currentTarget);
          }}
          title={isEn ? "Turn into / Options" : "Chuyển đổi / Tùy chọn"}
        >
          <MoreHorizontal size={13} />
        </button>
      )}
      {block.type === 'text' && block.content.includes('\n') && onSplitBlock && (
        <button
          type="button"
          className="icon-btn-ghost"
          onClick={() => onSplitBlock(block.id)}
          title={isEn ? "Split into separate blocks" : "Tách thành các khối riêng"}
          style={{ color: 'var(--primary)' }}
        >
          <ListTree size={13} />
        </button>
      )}
      <button
        type="button"
        className="icon-btn-ghost"
        onClick={() => onDeleteBlock(block.id)}
        title={isEn ? "Delete" : "Xóa"}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );

  switch (block.type) {
    case 'heading1':
      return (
        <div className="block-row" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <RichEditableText
            ref={richRef}
            className="block-h1"
            content={block.content}
            placeholder={isEn ? "Heading 1 (Type / for block menu)..." : "Tiêu đề 1 lớn (Gõ / để chọn block khác)..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => onEnterNextBlock?.(block.id, 'text')}
            onBackspaceEmpty={() => onDeleteBlock(block.id)}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );

    case 'heading2':
      return (
        <div className="block-row" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <RichEditableText
            ref={richRef}
            className="block-h2"
            content={block.content}
            placeholder={isEn ? "Heading 2..." : "Tiêu đề 2 vừa..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => onEnterNextBlock?.(block.id, 'text')}
            onBackspaceEmpty={() => onDeleteBlock(block.id)}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );

    case 'heading3':
      return (
        <div className="block-row" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <RichEditableText
            ref={richRef}
            className="block-h3"
            content={block.content}
            placeholder={isEn ? "Heading 3..." : "Tiêu đề 3 nhỏ..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => onEnterNextBlock?.(block.id, 'text')}
            onBackspaceEmpty={() => onDeleteBlock(block.id)}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );

    case 'bullet':
      return (
        <div className="block-row block-bullet-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, position: 'relative' }}>
          <div className="bullet-disc" aria-hidden="true">•</div>
          <RichEditableText
            ref={richRef}
            className="block-bullet-text"
            content={block.content}
            placeholder={isEn ? "List item..." : "Mục danh sách..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => {
              if (!block.content.trim()) {
                onUpdateBlock({ ...block, type: 'text', content: '' });
              } else {
                onEnterNextBlock?.(block.id, 'bullet');
              }
            }}
            onBackspaceEmpty={() => onUpdateBlock({ ...block, type: 'text', content: '' })}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );

    case 'numbered':
      return (
        <div className="block-row block-numbered-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, position: 'relative' }}>
          <span className="numbered-index">{indexInGroup}.</span>
          <RichEditableText
            ref={richRef}
            className="block-numbered-text"
            content={block.content}
            placeholder={isEn ? "Numbered step..." : "Mục danh sách đánh số..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => {
              if (!block.content.trim()) {
                onUpdateBlock({ ...block, type: 'text', content: '' });
              } else {
                onEnterNextBlock?.(block.id, 'numbered');
              }
            }}
            onBackspaceEmpty={() => onUpdateBlock({ ...block, type: 'text', content: '' })}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );

    case 'todo':
      return (
        <div className="block-row" style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div 
            className={`block-todo ${block.checked ? 'checked' : ''}`}
            onClick={() => onUpdateBlock({ ...block, checked: !block.checked })}
            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <div className="checkbox-custom">
              {block.checked && <Check size={12} strokeWidth={3} />}
            </div>
            <div 
              style={{ flex: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <RichEditableText
                ref={richRef}
                style={{
                  textDecoration: block.checked ? 'line-through' : 'none',
                  color: block.checked ? 'var(--text-muted)' : 'inherit',
                }}
                content={block.content}
                placeholder={isEn ? "Task to complete..." : "Nhiệm vụ cần hoàn thành..."}
                isFocused={isFocused}
                lang={lang}
                onChange={handleContentChange}
                onEnter={() => {
                  if (!block.content.trim()) {
                    onUpdateBlock({ ...block, type: 'text', content: '' });
                  } else {
                    onEnterNextBlock?.(block.id, 'todo');
                  }
                }}
                onBackspaceEmpty={() => onUpdateBlock({ ...block, type: 'text', content: '' })}
                onConvertToBlock={handleConvertToBlock}
                onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
                onCloseSlash={onCloseSlash}
                onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
              />
            </div>
          </div>
          {renderBlockActions()}
        </div>
      );

    case 'callout': {
      const variant = block.calloutMeta?.variant || 'info';
      return (
        <div className={`block-callout callout-${variant}`} style={{ position: 'relative' }}>
          <div className="callout-icon">{getCalloutIcon(variant)}</div>
          <div className="callout-content" style={{ flex: 1 }}>
            {block.calloutMeta?.title && (
              <input
                className="callout-title"
                value={block.calloutMeta.title}
                onChange={(e) =>
                  onUpdateBlock({
                    ...block,
                    calloutMeta: { ...block.calloutMeta!, title: e.target.value },
                  })
                }
                style={{ width: '100%', background: 'transparent' }}
              />
            )}
            <RichEditableText
              ref={richRef}
              className="callout-body"
              content={block.content}
              placeholder={isEn ? "Write callout note..." : "Nội dung ghi chú..."}
              isFocused={isFocused}
              lang={lang}
              onChange={handleContentChange}
              onEnter={() => onEnterNextBlock?.(block.id, 'text')}
              onBackspaceEmpty={() => onDeleteBlock(block.id)}
              onConvertToBlock={handleConvertToBlock}
              onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
              onCloseSlash={onCloseSlash}
              onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
            />
          </div>
          {renderBlockActions()}
        </div>
      );
    }

    case 'flashcard': {
      const defaultQ = isEn ? 'What concept needs to be reviewed?' : 'Câu hỏi ôn tập kiến thức...';
      const defaultA = isEn ? 'Detailed explanation and answer...' : 'Câu trả lời chi tiết...';
      const meta = block.flashcardMeta || {
        question: block.content || defaultQ,
        answer: defaultA,
      };

      return (
        <div className="block-flashcard-card">
          <div className="flashcard-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={15} color="#ec4899" />
              <span className="flashcard-badge">{isEn ? 'FLASHCARD REVIEW' : 'FLASHCARD ÔN TẬP'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button 
                className="btn-flashcard-toggle"
                onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
              >
                {showFlashcardAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>
                  {showFlashcardAnswer 
                    ? (isEn ? 'Hide answer' : 'Ẩn đáp án') 
                    : (isEn ? 'Show answer' : 'Xem đáp án')}
                </span>
              </button>
              {renderBlockActions()}
            </div>
          </div>

          <div className="flashcard-body">
            <div className="flashcard-q-row">
              <span className="flashcard-q-label">Q:</span>
              <input
                className="flashcard-q-input"
                value={meta.question}
                placeholder={isEn ? "Enter review question..." : "Nhập câu hỏi ôn tập..."}
                onChange={(e) => {
                  const updatedMeta = { ...meta, question: e.target.value };
                  onUpdateBlock({ ...block, content: e.target.value, flashcardMeta: updatedMeta });
                }}
              />
            </div>

            {showFlashcardAnswer ? (
              <div className="flashcard-a-row">
                <span className="flashcard-a-label">A:</span>
                <textarea
                  className="flashcard-a-input"
                  value={meta.answer}
                  placeholder={isEn ? "Enter detailed answer..." : "Nhập đáp án..."}
                  rows={2}
                  onChange={(e) => {
                    const updatedMeta = { ...meta, answer: e.target.value };
                    onUpdateBlock({ ...block, flashcardMeta: updatedMeta });
                  }}
                />
              </div>
            ) : (
              <div 
                className="flashcard-hidden-hint"
                onClick={() => setShowFlashcardAnswer(true)}
              >
                <HelpCircle size={14} />
                <span>
                  {isEn 
                    ? 'Click here or button above to reveal answer' 
                    : 'Bấm vào đây hoặc nút trên để lật xem đáp án'}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'code':
      return (
        <ExecutableCodeBlock
          id={block.id}
          initialCode={block.content}
          initialLanguage={block.language || 'javascript'}
          initialOutput={block.codeOutput}
          onCodeChange={(newCode) => onUpdateBlock({ ...block, content: newCode })}
          onLanguageChange={(newLang) => onUpdateBlock({ ...block, language: newLang })}
          onOutputChange={(newOutput) => onUpdateBlock({ ...block, codeOutput: newOutput || undefined })}
          onSendToStudio={onSendToStudio}
          onDeleteBlock={() => onDeleteBlock(block.id)}
        />
      );

    case 'columns':
      return (
        <ColumnsBlock
          block={block}
          lang={lang}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onSendToStudio={onSendToStudio}
        />
      );

    case 'table':
      return (
        <TableBlock
          block={block}
          lang={lang}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={() => onDeleteBlock(block.id)}
        />
      );

    case 'divider':
      return (
        <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
          {renderBlockActions()}
        </div>
      );

    case 'toggle': {
      const isOpen = block.toggleMeta?.isOpen ?? true;
      const lines = block.content.split('\n');
      const toggleTitle = lines[0] || '';
      const toggleBody = lines.slice(1).join('\n');

      const handleToggleTitleChange = (newTitle: string) => {
        const newContent = toggleBody ? `${newTitle}\n${toggleBody}` : newTitle;
        onUpdateBlock({ ...block, content: newContent });
      };

      const handleToggleBodyChange = (newBody: string) => {
        const newContent = `${toggleTitle}\n${newBody}`;
        onUpdateBlock({ ...block, content: newContent });
      };

      return (
        <div className="block-toggle-container" style={{ position: 'relative' }}>
          <div className="block-toggle-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className={`toggle-caret-btn ${isOpen ? 'open' : ''}`}
              onClick={() => onUpdateBlock({ ...block, toggleMeta: { isOpen: !isOpen } })}
              title={isOpen ? (isEn ? "Collapse" : "Thu gọn") : (isEn ? "Expand" : "Mở rộng")}
            >
              <ChevronRight size={14} className="toggle-caret-icon" />
            </button>
            <div style={{ flex: 1 }}>
              <RichEditableText
                ref={richRef}
                className="block-toggle-title"
                content={toggleTitle}
                placeholder={isEn ? "Toggle list title..." : "Tiêu đề khối thu gọn..."}
                isFocused={isFocused}
                lang={lang}
                onChange={handleToggleTitleChange}
                onEnter={() => onEnterNextBlock?.(block.id, 'text')}
                onBackspaceEmpty={() => onDeleteBlock(block.id)}
                onConvertToBlock={handleConvertToBlock}
                onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
                onCloseSlash={onCloseSlash}
                onSlashKeyDown={handleSlashKeyDown}
                onPaste={handlePaste}
              />
            </div>
            {renderBlockActions()}
          </div>

          {isOpen && (
            <div className="block-toggle-body">
              <RichEditableText
                className="block-toggle-content-text"
                content={toggleBody}
                placeholder={isEn ? "Empty toggle. Type sub-items here..." : "Khối trống. Gõ các mục con hoặc ghi chú tại đây..."}
                lang={lang}
                onChange={handleToggleBodyChange}
                onEnter={() => {}}
                onPaste={handlePaste}
              />
            </div>
          )}
        </div>
      );
    }

    case 'text':
    default:
      return (
        <div className="block-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, position: 'relative' }}>
          <RichEditableText
            ref={richRef}
            className="block-text"
            content={block.content}
            placeholder={isEn ? "Type '/' for block menu or write notes..." : "Gõ '/' để chọn block hoặc viết ghi chú..."}
            isFocused={isFocused}
            lang={lang}
            onChange={handleContentChange}
            onEnter={() => onEnterNextBlock?.(block.id, 'text')}
            onBackspaceEmpty={() => onDeleteBlock(block.id)}
            onConvertToBlock={handleConvertToBlock}
            onTriggerSlash={(q, r) => onTriggerSlash?.(block.id, q, r)}
            onCloseSlash={onCloseSlash}
            onSlashKeyDown={handleSlashKeyDown}
            onPaste={handlePaste}
          />
          {renderBlockActions()}
        </div>
      );
  }
};
