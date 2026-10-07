import React, { useState, useRef, useEffect } from 'react';
import type { Block, BlockType, LanguageId, AppLanguage } from '../../types';
import { BlockItem } from './BlockItem';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Type, 
  Heading2, 
  List, 
  Code2, 
  CheckSquare, 
  MessageSquare,
  Columns
} from 'lucide-react';

interface ColumnsBlockProps {
  block: Block;
  lang?: AppLanguage;
  onUpdateBlock: (updated: Block) => void;
  onDeleteBlock: (id: string) => void;
  onSendToStudio?: (code: string, language: LanguageId) => void;
}

export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({
  block,
  lang = 'vi',
  onUpdateBlock,
  onDeleteBlock,
  onSendToStudio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const columnsMeta = block.columnsMeta || {
    leftRatio: 50,
    leftBlocks: [],
    rightBlocks: [],
  };

  const [activeRatio, setActiveRatio] = useState<number>(columnsMeta.leftRatio ?? 50);
  const [showAddLeftMenu, setShowAddLeftMenu] = useState(false);
  const [showAddRightMenu, setShowAddRightMenu] = useState(false);

  useEffect(() => {
    setActiveRatio(columnsMeta.leftRatio ?? 50);
  }, [columnsMeta.leftRatio]);

  // Handle Dragging to adjust the width of the 2 columns
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const initialRatio = activeRatio;
    let latestRatio = initialRatio;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX;
      const deltaX = currentX - startX;
      const deltaPercent = (deltaX / rect.width) * 100;
      const newRatio = Math.min(80, Math.max(20, Math.round(initialRatio + deltaPercent)));
      latestRatio = newRatio;
      setActiveRatio(newRatio);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      onUpdateBlock({
        ...block,
        columnsMeta: {
          ...columnsMeta,
          leftRatio: latestRatio,
        },
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Helper to create a new sub-block
  const createSubBlock = (type: BlockType): Block => {
    const newId = 'block-' + Math.random().toString(36).substring(2, 9);
    switch (type) {
      case 'heading2':
        return { id: newId, type: 'heading2', content: lang === 'vi' ? 'Tiêu đề cột' : 'Column Heading' };
      case 'bullet':
        return { id: newId, type: 'bullet', content: lang === 'vi' ? 'Nội dung danh sách' : 'List item' };
      case 'code':
        return { id: newId, type: 'code', language: 'javascript', content: '// Code demo\nconsole.log("Column code");' };
      case 'callout':
        return { 
          id: newId, 
          type: 'callout', 
          content: lang === 'vi' ? 'Ghi chú quan trọng...' : 'Important note...',
          calloutMeta: { variant: 'tip', title: lang === 'vi' ? 'Mẹo hay' : 'Tip' }
        };
      case 'todo':
        return { id: newId, type: 'todo', content: lang === 'vi' ? 'Nhiệm vụ cần làm' : 'Task to do', checked: false };
      case 'text':
      default:
        return { id: newId, type: 'text', content: '' };
    }
  };

  // Left Column Actions
  const handleUpdateLeftBlock = (updated: Block) => {
    const nextLeft = columnsMeta.leftBlocks.map((b) => (b.id === updated.id ? updated : b));
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        leftBlocks: nextLeft,
      },
    });
  };

  const handleDeleteLeftBlock = (id: string) => {
    const nextLeft = columnsMeta.leftBlocks.filter((b) => b.id !== id);
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        leftBlocks: nextLeft,
      },
    });
  };

  const handleAddLeftBlock = (type: BlockType) => {
    const newSub = createSubBlock(type);
    const nextLeft = [...columnsMeta.leftBlocks, newSub];
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        leftBlocks: nextLeft,
      },
    });
    setShowAddLeftMenu(false);
  };

  // Right Column Actions
  const handleUpdateRightBlock = (updated: Block) => {
    const nextRight = columnsMeta.rightBlocks.map((b) => (b.id === updated.id ? updated : b));
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        rightBlocks: nextRight,
      },
    });
  };

  const handleDeleteRightBlock = (id: string) => {
    const nextRight = columnsMeta.rightBlocks.filter((b) => b.id !== id);
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        rightBlocks: nextRight,
      },
    });
  };

  const handleAddRightBlock = (type: BlockType) => {
    const newSub = createSubBlock(type);
    const nextRight = [...columnsMeta.rightBlocks, newSub];
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        rightBlocks: nextRight,
      },
    });
    setShowAddRightMenu(false);
  };

  const setPresetRatio = (ratio: number) => {
    setActiveRatio(ratio);
    onUpdateBlock({
      ...block,
      columnsMeta: {
        ...columnsMeta,
        leftRatio: ratio,
      },
    });
  };

  const leftPercent = activeRatio;
  const rightPercent = 100 - activeRatio;

  return (
    <div className="notion-columns-wrapper" ref={containerRef}>
      {/* Columns Control Bar (Appears on hover) */}
      <div className="columns-header-bar">
        <div className="columns-badge">
          <Columns size={12} color="var(--primary)" />
          <span>2 Cột ({leftPercent}% : {rightPercent}%)</span>
        </div>

        <div className="columns-presets">
          <button 
            className={`preset-ratio-btn ${leftPercent === 50 ? 'active' : ''}`}
            onClick={() => setPresetRatio(50)}
            title="Chia đều 50% - 50%"
          >
            50:50
          </button>
          <button 
            className={`preset-ratio-btn ${leftPercent === 33 ? 'active' : ''}`}
            onClick={() => setPresetRatio(33)}
            title="Cột trái nhỏ 33% - 67%"
          >
            33:67
          </button>
          <button 
            className={`preset-ratio-btn ${leftPercent === 67 ? 'active' : ''}`}
            onClick={() => setPresetRatio(67)}
            title="Cột trái lớn 67% - 33%"
          >
            67:33
          </button>
          <button 
            className={`preset-ratio-btn ${leftPercent === 40 ? 'active' : ''}`}
            onClick={() => setPresetRatio(40)}
            title="Cột trái 40% - 60%"
          >
            40:60
          </button>
          <button 
            className="icon-btn-ghost"
            onClick={() => onDeleteBlock(block.id)}
            title="Xóa cả khối 2 cột này"
            style={{ marginLeft: 6, color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Content */}
      <div className="notion-columns-body">
        {/* Left Column */}
        <div 
          className="notion-column-pane left"
          style={{ width: `calc(${leftPercent}% - 8px)` }}
        >
          <div className="column-blocks-list">
            {columnsMeta.leftBlocks.map((b, idx) => (
              <BlockItem
                key={b.id}
                block={b}
                indexInGroup={idx + 1}
                lang={lang}
                onUpdateBlock={handleUpdateLeftBlock}
                onDeleteBlock={handleDeleteLeftBlock}
                onSendToStudio={onSendToStudio}
              />
            ))}

            {columnsMeta.leftBlocks.length === 0 && (
              <div 
                className="empty-column-placeholder"
                onClick={() => handleAddLeftBlock('text')}
              >
                + Bấm để nhập cột trái...
              </div>
            )}
          </div>

          {/* Add block button in left column */}
          <div className="column-add-footer">
            <button 
              className="column-add-btn" 
              onClick={() => setShowAddLeftMenu(!showAddLeftMenu)}
              title="Thêm block vào cột trái"
            >
              <Plus size={11} />
              <span>Thêm</span>
            </button>

            {showAddLeftMenu && (
              <div className="column-quick-add-menu">
                <button onClick={() => handleAddLeftBlock('text')}>
                  <Type size={12} /> <span>Văn bản</span>
                </button>
                <button onClick={() => handleAddLeftBlock('heading2')}>
                  <Heading2 size={12} /> <span>Tiêu đề</span>
                </button>
                <button onClick={() => handleAddLeftBlock('bullet')}>
                  <List size={12} /> <span>Gạch đầu dòng</span>
                </button>
                <button onClick={() => handleAddLeftBlock('code')}>
                  <Code2 size={12} /> <span>Code Runner</span>
                </button>
                <button onClick={() => handleAddLeftBlock('callout')}>
                  <MessageSquare size={12} /> <span>Callout Mẹo</span>
                </button>
                <button onClick={() => handleAddLeftBlock('todo')}>
                  <CheckSquare size={12} /> <span>To-do</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resizer Divider Bar between columns */}
        <div 
          className={`notion-columns-resizer ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          title="Kéo sang trái hoặc phải để điều chỉnh tỷ lệ 2 cột"
        >
          <div className="resizer-handle-pill">
            <GripVertical size={13} />
          </div>
          {isDragging && (
            <div className="resizer-tooltip-badge">
              {leftPercent}% : {rightPercent}%
            </div>
          )}
        </div>

        {/* Right Column */}
        <div 
          className="notion-column-pane right"
          style={{ width: `calc(${rightPercent}% - 8px)` }}
        >
          <div className="column-blocks-list">
            {columnsMeta.rightBlocks.map((b, idx) => (
              <BlockItem
                key={b.id}
                block={b}
                indexInGroup={idx + 1}
                lang={lang}
                onUpdateBlock={handleUpdateRightBlock}
                onDeleteBlock={handleDeleteRightBlock}
                onSendToStudio={onSendToStudio}
              />
            ))}

            {columnsMeta.rightBlocks.length === 0 && (
              <div 
                className="empty-column-placeholder"
                onClick={() => handleAddRightBlock('text')}
              >
                + Bấm để nhập cột phải...
              </div>
            )}
          </div>

          {/* Add block button in right column */}
          <div className="column-add-footer">
            <button 
              className="column-add-btn" 
              onClick={() => setShowAddRightMenu(!showAddRightMenu)}
              title="Thêm block vào cột phải"
            >
              <Plus size={11} />
              <span>Thêm</span>
            </button>

            {showAddRightMenu && (
              <div className="column-quick-add-menu">
                <button onClick={() => handleAddRightBlock('text')}>
                  <Type size={12} /> <span>Văn bản</span>
                </button>
                <button onClick={() => handleAddRightBlock('heading2')}>
                  <Heading2 size={12} /> <span>Tiêu đề</span>
                </button>
                <button onClick={() => handleAddRightBlock('bullet')}>
                  <List size={12} /> <span>Gạch đầu dòng</span>
                </button>
                <button onClick={() => handleAddRightBlock('code')}>
                  <Code2 size={12} /> <span>Code Runner</span>
                </button>
                <button onClick={() => handleAddRightBlock('callout')}>
                  <MessageSquare size={12} /> <span>Callout Mẹo</span>
                </button>
                <button onClick={() => handleAddRightBlock('todo')}>
                  <CheckSquare size={12} /> <span>To-do</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
