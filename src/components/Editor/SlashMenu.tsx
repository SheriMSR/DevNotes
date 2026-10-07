import React, { useEffect, useRef } from 'react';
import type { BlockType, LanguageId, AppLanguage } from '../../types';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Code2,
  Lightbulb,
  AlertTriangle,
  Info,
  BookOpen,
  Layers,
  Columns,
  Table as TableIcon,
  ChevronRight
} from 'lucide-react';

export interface SlashMenuItem {
  id: string;
  type: BlockType;
  title: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
  badge?: string;
  category: 'basic' | 'advanced';
  calloutVariant?: 'tip' | 'warning' | 'info' | 'concept';
  defaultLanguage?: LanguageId;
}

export function getSlashMenuItems(lang: AppLanguage = 'vi'): SlashMenuItem[] {
  const isEn = lang === 'en';

  return [
    // Basic Blocks
    {
      id: 'text',
      type: 'text',
      title: isEn ? 'Text' : 'Văn bản (Text)',
      description: isEn ? 'Plain text paragraph notes' : 'Đoạn văn bản ghi chú thông thường',
      keywords: ['text', 'p', 'paragraph', 'van ban', 'chu', 'turn', 'chuyen', 'doi'],
      icon: <Type size={18} color="#94a3b8" />,
      category: 'basic',
    },
    {
      id: 'heading1',
      type: 'heading1',
      title: isEn ? 'Heading 1 (H1)' : 'Tiêu đề lớn (H1)',
      description: isEn ? 'Large main section heading' : 'Tiêu đề phân mục chính lớn nhất',
      keywords: ['heading1', 'h1', 'tieu de 1', 'header1', 'title', 'turn', 'chuyen', 'doi'],
      icon: <Heading1 size={18} color="#6366f1" />,
      badge: 'H1',
      category: 'basic',
    },
    {
      id: 'heading2',
      type: 'heading2',
      title: isEn ? 'Heading 2 (H2)' : 'Tiêu đề vừa (H2)',
      description: isEn ? 'Medium section heading' : 'Tiêu đề phần mục phụ trung bình',
      keywords: ['heading2', 'h2', 'tieu de 2', 'header2', 'turn', 'chuyen', 'doi'],
      icon: <Heading2 size={18} color="#38bdf8" />,
      badge: 'H2',
      category: 'basic',
    },
    {
      id: 'heading3',
      type: 'heading3',
      title: isEn ? 'Heading 3 (H3)' : 'Tiêu đề nhỏ (H3)',
      description: isEn ? 'Small subsection header' : 'Tiêu đề chi tiết nhóm nhỏ',
      keywords: ['heading3', 'h3', 'tieu de 3', 'header3', 'turn', 'chuyen', 'doi'],
      icon: <Heading3 size={18} color="#a855f7" />,
      badge: 'H3',
      category: 'basic',
    },
    {
      id: 'bullet',
      type: 'bullet',
      title: isEn ? 'Bullet List' : 'Danh sách chấm (Bullet List)',
      description: isEn ? 'Unordered bulleted list' : 'Ghi chú dạng gạch đầu dòng chấm tròn',
      keywords: ['bullet', 'list', 'ul', 'danh sach', 'cham', 'turn', 'chuyen', 'doi'],
      icon: <List size={18} color="#f59e0b" />,
      badge: '•',
      category: 'basic',
    },
    {
      id: 'numbered',
      type: 'numbered',
      title: isEn ? 'Numbered List' : 'Danh sách số (Numbered List)',
      description: isEn ? 'Ordered steps 1, 2, 3...' : 'Danh sách theo các bước thứ tự 1, 2, 3...',
      keywords: ['numbered', 'number', 'ol', 'so', 'thu tu', 'step', 'turn', 'chuyen', 'doi'],
      icon: <ListOrdered size={18} color="#10b981" />,
      badge: '1.',
      category: 'basic',
    },
    {
      id: 'todo',
      type: 'todo',
      title: isEn ? 'To-do List' : 'Việc cần làm (To-do List)',
      description: isEn ? 'Interactive checklist task' : 'Hộp kiểm theo dõi nhiệm vụ cần hoàn thành',
      keywords: ['todo', 'check', 'task', 'checklist', 'cong viec', 'nhiem vu', 'turn', 'chuyen', 'doi'],
      icon: <CheckSquare size={18} color="#06b6d4" />,
      badge: '☑',
      category: 'basic',
    },
    {
      id: 'divider',
      type: 'divider',
      title: isEn ? 'Divider' : 'Đường kẻ phân cách (Divider)',
      description: isEn ? 'Visual separator line' : 'Đường ngăn cách trực quan giữa các phần',
      keywords: ['divider', 'hr', 'line', 'ke', 'ngan cach', 'duong', 'turn', 'chuyen', 'doi'],
      icon: <Minus size={18} color="#64748b" />,
      category: 'basic',
    },
    {
      id: 'toggle',
      type: 'toggle',
      title: isEn ? 'Toggle List' : 'Khối Thu Gọn (Toggle List)',
      description: isEn ? 'Collapsible block with expandable sub-items' : 'Khối thu gọn mở rộng chứa các mục con bên trong',
      keywords: ['toggle', 'collapse', 'thu gon', 'mo rong', 'nhom', 'gop', 'turn', 'chuyen', 'doi'],
      icon: <ChevronRight size={18} color="#f59e0b" />,
      badge: '▶',
      category: 'basic',
    },

    // Advanced & Interactive Blocks
    {
      id: 'columns',
      type: 'columns',
      title: isEn ? '2 Columns (Side by Side)' : 'Chia 2 Cột (Song song)',
      description: isEn ? 'Create 2 adjustable resizable columns' : 'Chia ghi chú thành 2 cột và điều chỉnh độ rộng',
      keywords: ['columns', 'column', '2col', 'cot', 'chia 2', 'chia cot', 'split'],
      icon: <Columns size={18} color="#0ea5e9" />,
      badge: '2 Col',
      category: 'advanced',
    },
    {
      id: 'code-js',
      type: 'code',
      title: isEn ? 'Code Runner (JavaScript)' : 'Code Runner (JavaScript)',
      description: isEn ? 'Live executable JS block with console output' : 'Khối code thực thi JS trực tiếp & xem console output',
      keywords: ['code', 'runner', 'js', 'javascript', 'lap trinh', 'turn', 'chuyen', 'doi'],
      icon: <Code2 size={18} color="#eab308" />,
      badge: 'JS',
      category: 'advanced',
      defaultLanguage: 'javascript',
    },
    {
      id: 'table',
      type: 'table',
      title: isEn ? 'Table (Database)' : 'Bảng dữ liệu (Table / Database)',
      description: isEn ? 'Notion-style database table with tags & status' : 'Bảng cơ sở dữ liệu phong cách Notion (cột Page, Tags, Status)',
      keywords: ['table', 'bang', 'database', 'grid', 'csdl', 'hang', 'cot', 'turn', 'chuyen', 'doi'],
      icon: <TableIcon size={18} color="#a855f7" />,
      badge: 'Table',
      category: 'advanced',
    },
    {
      id: 'code-cs',
      type: 'code',
      title: isEn ? 'Code Runner (C# .NET)' : 'Code Runner (C# .NET)',
      description: isEn ? 'Live C# code simulation and execution' : 'Thực thi và thử nghiệm code C# Console',
      keywords: ['csharp', 'c#', 'dotnet', 'code', 'runner', 'turn', 'chuyen', 'doi'],
      icon: <Code2 size={18} color="#a855f7" />,
      badge: 'C#',
      category: 'advanced',
      defaultLanguage: 'csharp',
    },
    {
      id: 'code-bash',
      type: 'code',
      title: isEn ? 'Code Runner (Bash / Shell)' : 'Code Runner (Bash / Shell)',
      description: isEn ? 'Simulated terminal shell script execution' : 'Thực thi script lệnh terminal macOS / Linux',
      keywords: ['bash', 'sh', 'shell', 'terminal', 'code', 'runner', 'turn', 'chuyen', 'doi'],
      icon: <Code2 size={18} color="#f59e0b" />,
      badge: 'SH',
      category: 'advanced',
      defaultLanguage: 'bash',
    },
    {
      id: 'code-sql',
      type: 'code',
      title: isEn ? 'Code Runner (SQL)' : 'Code Runner (SQL)',
      description: isEn ? 'Query in-memory SQLite database tables' : 'Truy vấn cơ sở dữ liệu SQLite in-memory',
      keywords: ['sql', 'query', 'database', 'csdl', 'turn', 'chuyen', 'doi'],
      icon: <Code2 size={18} color="#06b6d4" />,
      badge: 'SQL',
      category: 'advanced',
      defaultLanguage: 'sql',
    },
    {
      id: 'callout-tip',
      type: 'callout',
      title: isEn ? 'Callout Tip' : 'Callout Mẹo Hay (Tip)',
      description: isEn ? 'Highlight key tips and best practices' : 'Khung lưu ý kinh nghiệm, mẹo hữu ích nổi bật',
      keywords: ['tip', 'meo', 'callout', 'hint', 'note', 'turn', 'chuyen', 'doi'],
      icon: <Lightbulb size={18} color="#10b981" />,
      badge: isEn ? 'Tip' : 'Mẹo',
      category: 'advanced',
      calloutVariant: 'tip',
    },
    {
      id: 'callout-warning',
      type: 'callout',
      title: isEn ? 'Callout Warning' : 'Callout Cảnh Báo (Warning)',
      description: isEn ? 'Alert pitfalls, traps or common bugs' : 'Hộp cảnh báo lỗi phổ biến hoặc cạm bẫy',
      keywords: ['warning', 'warn', 'canh bao', 'danger', 'alert', 'callout', 'turn', 'chuyen', 'doi'],
      icon: <AlertTriangle size={18} color="#f59e0b" />,
      badge: isEn ? 'Warning' : 'Cảnh báo',
      category: 'advanced',
      calloutVariant: 'warning',
    },
    {
      id: 'callout-info',
      type: 'callout',
      title: isEn ? 'Callout Info' : 'Callout Thông Tin (Info)',
      description: isEn ? 'Extra background information and notes' : 'Khung thông tin bổ sung và giải thích thêm',
      keywords: ['info', 'thong tin', 'note', 'callout', 'turn', 'chuyen', 'doi'],
      icon: <Info size={18} color="#0ea5e9" />,
      badge: isEn ? 'Info' : 'Thông tin',
      category: 'advanced',
      calloutVariant: 'info',
    },
    {
      id: 'callout-concept',
      type: 'callout',
      title: isEn ? 'Callout Concept' : 'Callout Khái Niệm (Concept)',
      description: isEn ? 'Theoretical definitions and core rules' : 'Hộp ghi nhớ định nghĩa kiến trúc hoặc lý thuyết',
      keywords: ['concept', 'khai niem', 'theory', 'dinh nghia', 'turn', 'chuyen', 'doi'],
      icon: <BookOpen size={18} color="#8b5cf6" />,
      badge: isEn ? 'Concept' : 'Khái niệm',
      category: 'advanced',
      calloutVariant: 'concept',
    },
    {
      id: 'flashcard',
      type: 'flashcard',
      title: isEn ? 'Flashcard Quiz' : 'Flashcard Mini (Ôn tập)',
      description: isEn ? 'Flippable question & answer study card' : 'Thẻ câu hỏi & câu trả lời lật mở để tự kiểm tra',
      keywords: ['flashcard', 'card', 'quiz', 'on tap', 'the', 'turn', 'chuyen', 'doi'],
      icon: <Layers size={18} color="#ec4899" />,
      badge: 'Quiz',
      category: 'advanced',
    },
  ];
}

interface SlashMenuProps {
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  lang?: AppLanguage;
  onSelect: (item: SlashMenuItem) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  query,
  position,
  selectedIndex,
  lang = 'vi',
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isEn = lang === 'en';

  const items = getSlashMenuItems(lang);

  // Normalize query
  const cleanQuery = query.toLowerCase().trim();

  // Filter items
  const filteredItems = items.filter((item) => {
    if (!cleanQuery) return true;
    if (item.title.toLowerCase().includes(cleanQuery)) return true;
    if (item.description.toLowerCase().includes(cleanQuery)) return true;
    return item.keywords.some((k) => k.toLowerCase().includes(cleanQuery));
  });

  // Ensure active element is scrolled into view
  useEffect(() => {
    if (!menuRef.current) return;
    const activeEl = menuRef.current.querySelector('.slash-menu-item.active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredItems.length === 0) {
    return (
      <div
        ref={menuRef}
        className="slash-menu-container"
        style={{ top: position.top, left: position.left }}
      >
        <div className="slash-menu-header">
          <span className="slash-menu-title">
            {isEn ? `Block suggestions (${query ? `/${query}` : '/'})` : `Gợi ý blocks (${query ? `/${query}` : '/'})`}
          </span>
        </div>
        <div className="slash-menu-empty">
          <span>{isEn ? 'No matching blocks found' : 'Không tìm thấy block nào phù hợp'}</span>
        </div>
      </div>
    );
  }

  // Group items by category
  const basicItems = filteredItems.filter((item) => item.category === 'basic');
  const advancedItems = filteredItems.filter((item) => item.category === 'advanced');

  let currentIndexCounter = 0;

  return (
    <div
      ref={menuRef}
      className="slash-menu-container"
      style={{ top: position.top, left: position.left }}
    >
      <div className="slash-menu-header">
        <span className="slash-menu-title">{isEn ? 'SELECT A BLOCK' : 'CHỌN LOẠI BLOCK'}</span>
        {query && <span className="slash-menu-filter-badge">/{query}</span>}
      </div>

      <div className="slash-menu-scroll">
        {basicItems.length > 0 && (
          <div className="slash-menu-group">
            <div className="slash-menu-group-label">{isEn ? 'Basic Blocks' : 'Cơ bản (Basic Blocks)'}</div>
            {basicItems.map((item) => {
              const itemIndex = currentIndexCounter++;
              const isSelected = itemIndex === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`slash-menu-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <div className="slash-menu-item-icon">{item.icon}</div>
                  <div className="slash-menu-item-content">
                    <div className="slash-menu-item-title-row">
                      <span className="slash-menu-item-title">{item.title}</span>
                      {item.badge && <span className="slash-badge">{item.badge}</span>}
                    </div>
                    <span className="slash-menu-item-desc">{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {advancedItems.length > 0 && (
          <div className="slash-menu-group">
            <div className="slash-menu-group-label">{isEn ? 'Advanced & Interactive' : 'Nâng cao & Học tập (Interactive)'}</div>
            {advancedItems.map((item) => {
              const itemIndex = currentIndexCounter++;
              const isSelected = itemIndex === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`slash-menu-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <div className="slash-menu-item-icon">{item.icon}</div>
                  <div className="slash-menu-item-content">
                    <div className="slash-menu-item-title-row">
                      <span className="slash-menu-item-title">{item.title}</span>
                      {item.badge && <span className="slash-badge">{item.badge}</span>}
                    </div>
                    <span className="slash-menu-item-desc">{item.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="slash-menu-footer">
        <span>{isEn ? '↑↓ to navigate' : '↑↓ để di chuyển'}</span>
        <span>{isEn ? '↵ to select' : '↵ để chọn'}</span>
        <span>{isEn ? 'Esc to dismiss' : 'Esc để huỷ'}</span>
      </div>
    </div>
  );
};
