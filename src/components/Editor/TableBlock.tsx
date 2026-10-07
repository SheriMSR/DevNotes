import React, { useState, useRef, useEffect } from 'react';
import type { Block, TableMeta, TableColumn, TableRow, AppLanguage } from '../../types';
import { 
  Plus, 
  Trash2, 
  Search, 
  ChevronDown, 
  FileText, 
  Tag as TagIcon, 
  CircleDot, 
  Check
} from 'lucide-react';

interface TableBlockProps {
  block: Block;
  lang?: AppLanguage;
  onUpdateBlock: (updated: Block) => void;
  onDeleteBlock: (id: string) => void;
}

export const NOTION_STATUS_CONFIG = {
  'Done': { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.16)', dot: '#10b981' },
  'In progress': { label: 'In progress', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.16)', dot: '#38bdf8' },
  'Frequent update': { label: 'Frequent update', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.16)', dot: '#f59e0b' },
  'Done except code': { label: 'Done except code', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.16)', dot: '#c084fc' },
  'To do': { label: 'To do', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.16)', dot: '#94a3b8' },
} as const;

export type NotionStatus = keyof typeof NOTION_STATUS_CONFIG;

// Preset Notion-like tag colors for clean aesthetics
export function getNotionTagStyle(tag: string) {
  const lower = tag.toLowerCase();
  if (lower.includes('sec') || lower.includes('auth')) {
    return { bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
  }
  if (lower.includes('db') || lower.includes('sql')) {
    return { bg: 'rgba(217, 119, 6, 0.18)', color: '#fbbf24', border: 'rgba(217, 119, 6, 0.3)' };
  }
  if (lower.includes('ef') || lower.includes('orm')) {
    return { bg: 'rgba(236, 72, 153, 0.18)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
  }
  if (lower.includes('devops') || lower.includes('ci')) {
    return { bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
  }
  if (lower.includes('daily') || lower.includes('basic')) {
    return { bg: 'rgba(100, 116, 139, 0.22)', color: '#cbd5e1', border: 'rgba(100, 116, 139, 0.35)' };
  }
  if (lower.includes('di') || lower.includes('arch')) {
    return { bg: 'rgba(99, 102, 241, 0.18)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
  }
  if (lower.includes('cach') || lower.includes('redis')) {
    return { bg: 'rgba(6, 182, 212, 0.18)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
  }
  if (lower.includes('micro') || lower.includes('kafka')) {
    return { bg: 'rgba(139, 92, 246, 0.18)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
  }

  // Consistent hash color for any custom tag
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return {
    bg: `hsla(${hue}, 65%, 55%, 0.18)`,
    color: `hsl(${hue}, 85%, 75%)`,
    border: `hsla(${hue}, 65%, 55%, 0.3)`
  };
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  lang = 'vi',
  onUpdateBlock,
  onDeleteBlock,
}) => {
  const isEn = lang === 'en';

  const defaultMeta: TableMeta = {
    title: 'My knowledge',
    columns: [
      { id: 'col-page', name: 'Page', type: 'text', width: 260 },
      { id: 'col-tags', name: 'Tags', type: 'tags', width: 180 },
      { id: 'col-status', name: 'Status', type: 'status', width: 170 },
    ],
    rows: [
      { id: 'row-1', cells: { 'col-page': 'Authentication, Authorization', 'col-tags': 'Security', 'col-status': 'Done' } },
      { id: 'row-2', cells: { 'col-page': 'Back-up DB', 'col-tags': 'DB - fundamentals', 'col-status': 'Done' } },
      { id: 'row-3', cells: { 'col-page': 'Change Tracking', 'col-tags': 'EF core', 'col-status': 'Done' } },
      { id: 'row-4', cells: { 'col-page': 'CI/CD', 'col-tags': 'DevOps', 'col-status': 'In progress' } },
      { id: 'row-5', cells: { 'col-page': 'Custom Validation Attribute', 'col-tags': 'Daily', 'col-status': 'Done' } },
      { id: 'row-6', cells: { 'col-page': 'Dapper', 'col-tags': 'ORM', 'col-status': 'In progress' } },
      { id: 'row-7', cells: { 'col-page': 'Data Structures', 'col-tags': 'Basic', 'col-status': 'Frequent update' } },
      { id: 'row-8', cells: { 'col-page': 'Dependency Injection', 'col-tags': 'DI', 'col-status': 'Done' } },
      { id: 'row-9', cells: { 'col-page': 'EF Cache', 'col-tags': 'Caching', 'col-status': 'Done except code' } },
      { id: 'row-10', cells: { 'col-page': 'Kafka', 'col-tags': 'Microservice', 'col-status': 'Done except code' } },
    ],
  };

  const meta = block.tableMeta || defaultMeta;
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [activeStatusMenu, setActiveStatusMenu] = useState<{ rowId: string; colId: string } | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setActiveStatusMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMeta = (newMeta: TableMeta) => {
    onUpdateBlock({
      ...block,
      content: newMeta.title || 'My knowledge',
      tableMeta: newMeta,
    });
  };

  const handleTitleChange = (val: string) => {
    updateMeta({ ...meta, title: val });
  };

  const handleCellChange = (rowId: string, colId: string, value: string) => {
    const updatedRows = meta.rows.map((r) =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r
    );
    updateMeta({ ...meta, rows: updatedRows });
  };

  const handleAddRow = (atTop = false) => {
    const newId = 'row-' + Math.random().toString(36).substring(2, 9);
    const newRow: TableRow = {
      id: newId,
      cells: {
        'col-page': isEn ? 'Untitled Item' : 'Chủ đề mới',
        'col-tags': '',
        'col-status': 'To do',
      },
    };
    const nextRows = atTop ? [newRow, ...meta.rows] : [...meta.rows, newRow];
    updateMeta({ ...meta, rows: nextRows });
    setEditingCell({ rowId: newId, colId: 'col-page' });
  };

  const handleDeleteRow = (rowId: string) => {
    const nextRows = meta.rows.filter((r) => r.id !== rowId);
    updateMeta({ ...meta, rows: nextRows });
  };

  const handleAddColumn = () => {
    const colName = prompt(isEn ? 'Enter column name:' : 'Nhập tên cột mới:', isEn ? 'Property' : 'Cột mới');
    if (!colName || !colName.trim()) return;
    const newColId = 'col-' + Math.random().toString(36).substring(2, 9);
    const newCol: TableColumn = {
      id: newColId,
      name: colName.trim(),
      type: 'text',
      width: 160,
    };
    updateMeta({
      ...meta,
      columns: [...meta.columns, newCol],
    });
  };

  const handleDeleteColumn = (colId: string) => {
    if (meta.columns.length <= 1) return;
    const nextCols = meta.columns.filter((c) => c.id !== colId);
    updateMeta({ ...meta, columns: nextCols });
  };

  const filteredRows = meta.rows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r.cells).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="notion-database-table-block">
      {/* Table Database Top Bar */}
      <div className="notion-table-topbar">
        <div className="notion-table-title-area">
          <span className="notion-table-icon" role="img" aria-label="database">
            📖
          </span>
          <input
            className="notion-table-title-input"
            value={meta.title || 'My knowledge'}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={isEn ? 'Table title...' : 'Tiêu đề bảng...'}
          />
        </div>

        <div className="notion-table-controls">
          <div className="notion-table-search-wrap">
            <Search size={13} color="var(--text-muted)" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Filter in table...' : 'Tìm kiếm trong bảng...'}
              className="notion-table-search-input"
            />
          </div>

          <button
            className="notion-table-btn-new"
            onClick={() => handleAddRow(true)}
            title={isEn ? 'Add new item to table' : 'Thêm mục mới vào bảng'}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New</span>
          </button>

          <button
            className="icon-btn-ghost"
            onClick={() => onDeleteBlock(block.id)}
            title={isEn ? 'Delete table block' : 'Xóa khối bảng'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Table Grid Wrapper */}
      <div className="notion-table-scroll-container">
        <table className="notion-table">
          <thead>
            <tr>
              {meta.columns.map((col) => (
                <th key={col.id} style={{ width: col.width || 'auto' }}>
                  <div className="notion-th-content">
                    {col.id === 'col-page' ? (
                      <span className="notion-col-type-icon">Aa</span>
                    ) : col.type === 'tags' ? (
                      <TagIcon size={12} className="notion-col-type-icon" />
                    ) : col.type === 'status' ? (
                      <CircleDot size={12} className="notion-col-type-icon" />
                    ) : (
                      <FileText size={12} className="notion-col-type-icon" />
                    )}
                    <span>{col.name}</span>
                    {col.id !== 'col-page' && (
                      <button
                        className="notion-col-del-btn"
                        onClick={() => handleDeleteColumn(col.id)}
                        title={isEn ? 'Delete column' : 'Xóa cột'}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ width: 40 }} className="notion-th-add-col">
                <button
                  className="notion-add-col-btn"
                  onClick={handleAddColumn}
                  title={isEn ? 'Add Column' : 'Thêm cột'}
                >
                  <Plus size={13} />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="notion-table-row">
                {meta.columns.map((col) => {
                  const val = row.cells[col.id] || '';
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;

                  if (col.type === 'status') {
                    const statusKey = (val in NOTION_STATUS_CONFIG ? val : 'To do') as NotionStatus;
                    const statusConfig = NOTION_STATUS_CONFIG[statusKey] || NOTION_STATUS_CONFIG['To do'];
                    const isMenuOpen = activeStatusMenu?.rowId === row.id && activeStatusMenu?.colId === col.id;

                    return (
                      <td key={col.id} className="notion-td notion-td-status" style={{ position: 'relative' }}>
                        <div
                          className="notion-status-badge"
                          style={{
                            background: statusConfig.bg,
                            color: statusConfig.color,
                          }}
                          onClick={() => setActiveStatusMenu({ rowId: row.id, colId: col.id })}
                        >
                          <span
                            className="notion-status-dot"
                            style={{ backgroundColor: statusConfig.dot }}
                          />
                          <span className="notion-status-text">{statusConfig.label}</span>
                          <ChevronDown size={11} style={{ opacity: 0.6, marginLeft: 2 }} />
                        </div>

                        {/* Status Dropdown Picker */}
                        {isMenuOpen && (
                          <div className="notion-status-picker-dropdown" ref={statusMenuRef}>
                            <div className="notion-status-picker-header">Chọn trạng thái</div>
                            {Object.entries(NOTION_STATUS_CONFIG).map(([key, item]) => (
                              <button
                                key={key}
                                className={`notion-status-picker-item ${key === statusKey ? 'active' : ''}`}
                                onClick={() => {
                                  handleCellChange(row.id, col.id, key);
                                  setActiveStatusMenu(null);
                                }}
                              >
                                <span className="notion-status-dot" style={{ backgroundColor: item.dot }} />
                                <span>{item.label}</span>
                                {key === statusKey && <Check size={12} style={{ marginLeft: 'auto' }} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  }

                  if (col.type === 'tags') {
                    const tagsArray = val
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);

                    return (
                      <td
                        key={col.id}
                        className="notion-td notion-td-tags"
                        onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            className="notion-cell-input"
                            value={val}
                            onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                            placeholder="Tags cách nhau bởi dấu phẩy..."
                          />
                        ) : tagsArray.length > 0 ? (
                          <div className="notion-tags-cell-row">
                            {tagsArray.map((t) => {
                              const s = getNotionTagStyle(t);
                              return (
                                <span
                                  key={t}
                                  className="notion-tag-pill"
                                  style={{
                                    backgroundColor: s.bg,
                                    color: s.color,
                                    border: `1px solid ${s.border}`,
                                  }}
                                >
                                  {t}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="notion-placeholder-text">Nhấp để thêm tag...</span>
                        )}
                      </td>
                    );
                  }

                  // Default Text / Page column
                  const isPageCol = col.id === 'col-page';
                  return (
                    <td
                      key={col.id}
                      className="notion-td notion-td-text"
                      onClick={() => setEditingCell({ rowId: row.id, colId: col.id })}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="notion-cell-input"
                          value={val}
                          onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                        />
                      ) : (
                        <div className="notion-page-cell-content">
                          {isPageCol && <FileText size={14} className="notion-page-icon" />}
                          <span className="notion-cell-text-value">
                            {val || <span className="notion-placeholder-text">Không có tiêu đề</span>}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Row Action Actions */}
                <td className="notion-td-actions">
                  <button
                    className="notion-row-del-btn"
                    onClick={() => handleDeleteRow(row.id)}
                    title={isEn ? 'Delete row' : 'Xóa hàng'}
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Add Row Footer */}
      <div className="notion-table-footer">
        <button className="notion-table-btn-add-row" onClick={() => handleAddRow(false)}>
          <Plus size={13} />
          <span>{isEn ? 'New page / row' : 'Thêm hàng mới (+ New)'}</span>
        </button>
        <div className="notion-table-row-count">
          {filteredRows.length} {isEn ? 'items' : 'mục'}
        </div>
      </div>
    </div>
  );
};
