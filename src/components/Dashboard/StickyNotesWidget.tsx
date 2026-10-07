import React, { useState, useEffect } from 'react';
import type { StickyNote, AppLanguage } from '../../types';
import { loadStickyNotes, saveStickyNotes } from '../../services/storage';
import { 
  StickyNote as StickyIcon, 
  Plus, 
  Trash2, 
  Pin 
} from 'lucide-react';

interface StickyNotesWidgetProps {
  lang: AppLanguage;
}

const COLOR_CONFIGS: Record<StickyNote['color'], {
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textColorLight: string;
  textColorDark: string;
  accent: string;
  label: string;
}> = {
  yellow: {
    bgLight: '#fef9c3',
    bgDark: 'rgba(234, 179, 8, 0.14)',
    borderLight: '#fde047',
    borderDark: 'rgba(234, 179, 8, 0.35)',
    textColorLight: '#713f12',
    textColorDark: '#fef08a',
    accent: '#eab308',
    label: 'Vàng',
  },
  blue: {
    bgLight: '#e0f2fe',
    bgDark: 'rgba(14, 165, 233, 0.14)',
    borderLight: '#bae6fd',
    borderDark: 'rgba(14, 165, 233, 0.35)',
    textColorLight: '#075985',
    textColorDark: '#bae6fd',
    accent: '#0ea5e9',
    label: 'Xanh dương',
  },
  green: {
    bgLight: '#dcfce7',
    bgDark: 'rgba(16, 185, 129, 0.14)',
    borderLight: '#bbf7d0',
    borderDark: 'rgba(16, 185, 129, 0.35)',
    textColorLight: '#14532d',
    textColorDark: '#bbf7d0',
    accent: '#10b981',
    label: 'Xanh lá',
  },
  purple: {
    bgLight: '#f3e8ff',
    bgDark: 'rgba(168, 85, 247, 0.14)',
    borderLight: '#e9d5ff',
    borderDark: 'rgba(168, 85, 247, 0.35)',
    textColorLight: '#581c87',
    textColorDark: '#e9d5ff',
    accent: '#a855f7',
    label: 'Tím',
  },
  pink: {
    bgLight: '#ffe4e6',
    bgDark: 'rgba(244, 63, 94, 0.14)',
    borderLight: '#fecdd3',
    borderDark: 'rgba(244, 63, 94, 0.35)',
    textColorLight: '#881337',
    textColorDark: '#fecdd3',
    accent: '#f43f5e',
    label: 'Hồng',
  },
  orange: {
    bgLight: '#ffedd5',
    bgDark: 'rgba(249, 115, 22, 0.14)',
    borderLight: '#fed7aa',
    borderDark: 'rgba(249, 115, 22, 0.35)',
    textColorLight: '#7c2d12',
    textColorDark: '#fed7aa',
    accent: '#f97316',
    label: 'Cam',
  },
};

const COLOR_KEYS: StickyNote['color'][] = ['yellow', 'blue', 'green', 'purple', 'pink', 'orange'];

export const StickyNotesWidget: React.FC<StickyNotesWidgetProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [stickies, setStickies] = useState<StickyNote[]>(() => loadStickyNotes());
  const [colorPickerOpenId, setColorPickerOpenId] = useState<string | null>(null);

  useEffect(() => {
    saveStickyNotes(stickies);
  }, [stickies]);

  const handleAddSticky = (color: StickyNote['color'] = 'yellow') => {
    const newNote: StickyNote = {
      id: 'sn-' + Math.random().toString(36).substring(2, 9),
      title: isEn ? 'New Note' : 'Ghi chú mới',
      content: isEn ? 'Write your thoughts or quick reminders here...' : 'Viết nhanh ghi chú hoặc ý tưởng cần nhớ tại đây...',
      color,
      isPinned: false,
      createdAt: Date.now(),
    };
    setStickies((prev) => [newNote, ...prev]);
  };

  const handleUpdateSticky = (id: string, updates: Partial<StickyNote>) => {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleDeleteSticky = (id: string) => {
    setStickies((prev) => prev.filter((s) => s.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Sort notes: pinned first, then by createdAt desc
  const sortedStickies = [...stickies].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="dashboard-stickies-widget">
      {/* Widget Header */}
      <div className="stickies-widget-header">
        <div className="stickies-widget-title-group">
          <div className="stickies-widget-icon-box">
            <StickyIcon size={18} color="#f59e0b" />
          </div>
          <div>
            <h3 className="stickies-widget-title">
              {isEn ? 'Sticky Notes' : 'Giấy Nhớ Nhanh (Sticky Notes)'}
            </h3>
            <span className="stickies-widget-subtitle">
              {isEn 
                ? `${stickies.length} notes pinned & saved` 
                : `${stickies.length} giấy nhớ đã lưu`}
            </span>
          </div>
        </div>

        {/* Add Note Button */}
        <button
          type="button"
          className="stickies-add-btn"
          onClick={() => handleAddSticky('yellow')}
          title={isEn ? "Add new sticky note" : "Thêm giấy nhớ mới"}
        >
          <Plus size={16} />
          <span>{isEn ? 'Add Note' : 'Thêm giấy nhớ'}</span>
        </button>
      </div>

      {/* Sticky Notes Cards Grid */}
      <div className="stickies-cards-container custom-scrollbar">
        {sortedStickies.length === 0 ? (
          <div className="stickies-empty-state">
            <StickyIcon size={28} className="stickies-empty-icon" />
            <p>{isEn ? 'No sticky notes yet. Click "+ Add Note" to create one!' : 'Chưa có giấy nhớ nào. Nhấn "+ Thêm giấy nhớ" để tạo ngay!'}</p>
          </div>
        ) : (
          sortedStickies.map((note) => {
            const conf = COLOR_CONFIGS[note.color] || COLOR_CONFIGS.yellow;
            const isColorPickerOpen = colorPickerOpenId === note.id;

            return (
              <div
                key={note.id}
                className={`sticky-note-card color-${note.color} ${note.isPinned ? 'pinned' : ''}`}
              >
                {/* Card Top Actions Bar */}
                <div className="sticky-card-topbar">
                  <button
                    type="button"
                    className={`sticky-pin-btn ${note.isPinned ? 'active' : ''}`}
                    onClick={() => handleTogglePin(note.id)}
                    title={note.isPinned ? (isEn ? "Unpin note" : "Bỏ ghim") : (isEn ? "Pin to top" : "Ghim lên đầu")}
                  >
                    <Pin size={13} className={note.isPinned ? 'pin-active' : ''} />
                  </button>

                  <div className="sticky-card-right-tools">
                    {/* Color Swatch Button */}
                    <div className="sticky-color-picker-wrapper">
                      <button
                        type="button"
                        className="sticky-tool-btn"
                        onClick={() => setColorPickerOpenId(isColorPickerOpen ? null : note.id)}
                        title={isEn ? "Change color" : "Đổi màu giấy nhớ"}
                      >
                        <span 
                          className="sticky-current-color-dot" 
                          style={{ backgroundColor: conf.accent }}
                        />
                      </button>

                      {isColorPickerOpen && (
                        <div className="sticky-color-dropdown">
                          {COLOR_KEYS.map((cKey) => (
                            <button
                              key={cKey}
                              type="button"
                              className={`sticky-color-choice-btn ${note.color === cKey ? 'active' : ''}`}
                              style={{ backgroundColor: COLOR_CONFIGS[cKey].accent }}
                              onClick={() => {
                                handleUpdateSticky(note.id, { color: cKey });
                                setColorPickerOpenId(null);
                              }}
                              title={COLOR_CONFIGS[cKey].label}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Note Button */}
                    <button
                      type="button"
                      className="sticky-tool-btn danger"
                      onClick={() => handleDeleteSticky(note.id)}
                      title={isEn ? "Delete note" : "Xóa giấy nhớ"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Editable Title */}
                <input
                  type="text"
                  className="sticky-card-title-input"
                  value={note.title}
                  onChange={(e) => handleUpdateSticky(note.id, { title: e.target.value })}
                  placeholder={isEn ? "Note title..." : "Tiêu đề ghi chú..."}
                />

                {/* Editable Content */}
                <textarea
                  className="sticky-card-content-input custom-scrollbar"
                  value={note.content}
                  onChange={(e) => handleUpdateSticky(note.id, { content: e.target.value })}
                  placeholder={isEn ? "Note content..." : "Nội dung ghi nhớ..."}
                  rows={4}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
