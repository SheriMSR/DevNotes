import React, { useEffect, useRef } from 'react';
import type { BlockType, AppLanguage } from '../../types';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Lightbulb,
  Code2,
  Layers,
  Table as TableIcon,
  Minus,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  ChevronRight,
  CornerUpLeft,
} from 'lucide-react';

export interface BlockActionMenuProps {
  currentType: BlockType;
  position: { top: number; left: number };
  lang?: AppLanguage;
  onTurnInto: (newType: BlockType) => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUnnest?: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface TurnOption {
  type: BlockType;
  labelEn: string;
  labelVi: string;
  icon: React.ReactNode;
  badge?: string;
}

const TURN_OPTIONS: TurnOption[] = [
  {
    type: 'text',
    labelEn: 'Text',
    labelVi: 'Văn bản thường',
    icon: <Type size={16} color="#94a3b8" />,
  },
  {
    type: 'heading1',
    labelEn: 'Heading 1',
    labelVi: 'Tiêu đề 1 (Lớn)',
    icon: <Heading1 size={16} color="#6366f1" />,
    badge: 'H1',
  },
  {
    type: 'heading2',
    labelEn: 'Heading 2',
    labelVi: 'Tiêu đề 2 (Vừa)',
    icon: <Heading2 size={16} color="#38bdf8" />,
    badge: 'H2',
  },
  {
    type: 'heading3',
    labelEn: 'Heading 3',
    labelVi: 'Tiêu đề 3 (Nhỏ)',
    icon: <Heading3 size={16} color="#a855f7" />,
    badge: 'H3',
  },
  {
    type: 'bullet',
    labelEn: 'Bullet List',
    labelVi: 'Danh sách chấm',
    icon: <List size={16} color="#f59e0b" />,
    badge: '•',
  },
  {
    type: 'numbered',
    labelEn: 'Numbered List',
    labelVi: 'Danh sách số',
    icon: <ListOrdered size={16} color="#10b981" />,
    badge: '1.',
  },
  {
    type: 'todo',
    labelEn: 'To-do List',
    labelVi: 'Việc cần làm',
    icon: <CheckSquare size={16} color="#06b6d4" />,
    badge: '☑',
  },
  {
    type: 'callout',
    labelEn: 'Callout Box',
    labelVi: 'Hộp ghi chú nổi bật',
    icon: <Lightbulb size={16} color="#eab308" />,
  },
  {
    type: 'code',
    labelEn: 'Code Block',
    labelVi: 'Khối mã Code',
    icon: <Code2 size={16} color="#ec4899" />,
  },
  {
    type: 'flashcard',
    labelEn: 'Flashcard Quiz',
    labelVi: 'Thẻ ghi nhớ (Flashcard)',
    icon: <Layers size={16} color="#8b5cf6" />,
  },
  {
    type: 'table',
    labelEn: 'Table (Database)',
    labelVi: 'Bảng dữ liệu (Table)',
    icon: <TableIcon size={16} color="#6366f1" />,
  },
  {
    type: 'divider',
    labelEn: 'Divider Line',
    labelVi: 'Đường phân cách',
    icon: <Minus size={16} color="#64748b" />,
  },
  {
    type: 'toggle',
    labelEn: 'Toggle List',
    labelVi: 'Khối thu gọn (Toggle)',
    icon: <ChevronRight size={16} color="#f59e0b" />,
    badge: '▶',
  },
];

export const BlockActionMenu: React.FC<BlockActionMenuProps> = ({
  currentType,
  position,
  lang = 'vi',
  onTurnInto,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onUnnest,
  onDelete,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isEn = lang === 'en';

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position so it doesn't overflow screen
  const menuWidth = 260;
  const menuHeight = 440;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  const left = Math.min(position.left, screenW - menuWidth - 16);
  let top = position.top;
  if (top + menuHeight > screenH) {
    top = Math.max(16, screenH - menuHeight - 16);
  }

  return (
    <div
      ref={menuRef}
      className="block-action-menu-container"
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Turn into section */}
      <div className="block-action-section-title">
        {isEn ? 'TURN INTO' : 'CHUYỂN ĐỔI THÀNH'}
      </div>

      <div className="block-action-turn-scroll">
        {TURN_OPTIONS.map((opt) => {
          const isActive = currentType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              className={`block-action-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onTurnInto(opt.type);
                onClose();
              }}
            >
              <span className="block-action-icon">{opt.icon}</span>
              <span className="block-action-label">
                {isEn ? opt.labelEn : opt.labelVi}
              </span>
              {opt.badge && <span className="block-action-badge">{opt.badge}</span>}
              {isActive && <Check size={14} className="block-action-active-check" />}
            </button>
          );
        })}
      </div>

      <div className="block-action-divider" />

      {/* Actions section */}
      <div className="block-action-section-title">
        {isEn ? 'ACTIONS' : 'THAO TÁC'}
      </div>

      <div className="block-action-list">
        {onUnnest && (
          <button
            type="button"
            className="block-action-item"
            style={{ color: '#38bdf8' }}
            onClick={() => {
              onUnnest();
              onClose();
            }}
          >
            <span className="block-action-icon">
              <CornerUpLeft size={15} color="#38bdf8" />
            </span>
            <span className="block-action-label" style={{ fontWeight: 600 }}>
              {isEn ? 'Move outside (Un-nest)' : 'Đưa ra ngoài khối cha'}
            </span>
          </button>
        )}

        <button
          type="button"
          className="block-action-item"
          onClick={() => {
            onDuplicate();
            onClose();
          }}
        >
          <span className="block-action-icon">
            <Copy size={15} color="#38bdf8" />
          </span>
          <span className="block-action-label">
            {isEn ? 'Duplicate' : 'Nhân bản block'}
          </span>
        </button>

        {onMoveUp && (
          <button
            type="button"
            className="block-action-item"
            onClick={() => {
              onMoveUp();
              onClose();
            }}
          >
            <span className="block-action-icon">
              <ArrowUp size={15} color="#94a3b8" />
            </span>
            <span className="block-action-label">
              {isEn ? 'Move up' : 'Di chuyển lên'}
            </span>
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            className="block-action-item"
            onClick={() => {
              onMoveDown();
              onClose();
            }}
          >
            <span className="block-action-icon">
              <ArrowDown size={15} color="#94a3b8" />
            </span>
            <span className="block-action-label">
              {isEn ? 'Move down' : 'Di chuyển xuống'}
            </span>
          </button>
        )}

        <button
          type="button"
          className="block-action-item danger"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          <span className="block-action-icon">
            <Trash2 size={15} color="#ef4444" />
          </span>
          <span className="block-action-label">
            {isEn ? 'Delete block' : 'Xóa block'}
          </span>
        </button>
      </div>
    </div>
  );
};
