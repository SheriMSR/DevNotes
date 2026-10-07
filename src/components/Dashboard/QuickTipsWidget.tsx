import React, { useState, useEffect, useMemo } from 'react';
import type { QuickTip, QuickTipColor, AppLanguage } from '../../types';
import { loadQuickTips, saveQuickTips } from '../../services/storage';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Command, 
  Terminal, 
  Code, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  X,
  Apple,
  GitBranch,
  Layers
} from 'lucide-react';

interface QuickTipsWidgetProps {
  lang: AppLanguage;
}

const CATEGORY_META: Record<string, { labelVi: string; labelEn: string; icon: React.ReactNode; color: string }> = {
  mac: {
    labelVi: 'macOS',
    labelEn: 'macOS',
    icon: <Apple size={14} />,
    color: '#38bdf8',
  },
  code: {
    labelVi: 'Code & Dev',
    labelEn: 'Code & Dev',
    icon: <Code size={14} />,
    color: '#10b981',
  },
  git: {
    labelVi: 'Git & CLI',
    labelEn: 'Git & CLI',
    icon: <GitBranch size={14} />,
    color: '#f59e0b',
  },
  devnotes: {
    labelVi: 'DevNotes',
    labelEn: 'DevNotes',
    icon: <Layers size={14} />,
    color: '#a855f7',
  },
  other: {
    labelVi: 'Mẹo vặt',
    labelEn: 'General',
    icon: <Lightbulb size={14} />,
    color: '#ec4899',
  },
};

const COLOR_ACCENTS: Record<QuickTipColor, { border: string; glow: string; badgeBg: string; text: string }> = {
  sky: {
    border: 'rgba(56, 189, 248, 0.35)',
    glow: 'rgba(56, 189, 248, 0.08)',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    text: '#38bdf8',
  },
  indigo: {
    border: 'rgba(99, 102, 241, 0.35)',
    glow: 'rgba(99, 102, 241, 0.08)',
    badgeBg: 'rgba(99, 102, 241, 0.14)',
    text: '#818cf8',
  },
  emerald: {
    border: 'rgba(16, 185, 129, 0.35)',
    glow: 'rgba(16, 185, 129, 0.08)',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    text: '#34d399',
  },
  amber: {
    border: 'rgba(245, 158, 11, 0.35)',
    glow: 'rgba(245, 158, 11, 0.08)',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    text: '#fbbf24',
  },
  rose: {
    border: 'rgba(244, 63, 94, 0.35)',
    glow: 'rgba(244, 63, 94, 0.08)',
    badgeBg: 'rgba(244, 63, 94, 0.14)',
    text: '#fb7185',
  },
  purple: {
    border: 'rgba(168, 85, 247, 0.35)',
    glow: 'rgba(168, 85, 247, 0.08)',
    badgeBg: 'rgba(168, 85, 247, 0.14)',
    text: '#c084fc',
  },
};

export const QuickTipsWidget: React.FC<QuickTipsWidgetProps> = ({ lang }) => {
  const isEn = lang === 'en';
  const [tips, setTips] = useState<QuickTip[]>(() => loadQuickTips());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('devnotes_quick_tips_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('mac');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formShortcut, setFormShortcut] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState<QuickTipColor>('sky');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    saveQuickTips(tips);
  }, [tips]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('devnotes_quick_tips_collapsed', String(next));
    } catch {
      // ignore
    }
  };

  // Derive unique categories present in tips
  const categoriesList = useMemo(() => {
    const set = new Set<string>(['mac', 'code', 'git', 'devnotes']);
    tips.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [tips]);

  // Filtered & Sorted Tips (Pinned always first, then by createdAt desc)
  const filteredTips = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tips
      .filter((t) => {
        // Category filter
        if (selectedCategory === 'pinned' && !t.isPinned) return false;
        if (selectedCategory !== 'all' && selectedCategory !== 'pinned' && t.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.shortcut && t.shortcut.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [tips, searchQuery, selectedCategory]);

  const handleCopyShortcut = (tip: QuickTip) => {
    const textToCopy = tip.shortcut || tip.title;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(tip.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === tip.id ? null : prev));
    }, 1600);
  };

  const handleTogglePin = (id: string) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
  };

  const handleDeleteTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAddModal = () => {
    setEditingTipId(null);
    setFormTitle('');
    setFormCategory('mac');
    setFormCustomCategory('');
    setFormShortcut('');
    setFormDescription('');
    setFormColor('sky');
    setFormIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tip: QuickTip) => {
    setEditingTipId(tip.id);
    setFormTitle(tip.title);
    if (['mac', 'code', 'git', 'devnotes', 'other'].includes(tip.category)) {
      setFormCategory(tip.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('custom');
      setFormCustomCategory(tip.category);
    }
    setFormShortcut(tip.shortcut || '');
    setFormDescription(tip.description);
    setFormColor(tip.color || 'sky');
    setFormIsPinned(Boolean(tip.isPinned));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const finalCategory =
      formCategory === 'custom'
        ? formCustomCategory.trim().toLowerCase() || 'other'
        : formCategory;

    if (editingTipId) {
      setTips((prev) =>
        prev.map((t) =>
          t.id === editingTipId
            ? {
                ...t,
                title: formTitle.trim(),
                category: finalCategory,
                shortcut: formShortcut.trim(),
                description: formDescription.trim(),
                color: formColor,
                isPinned: formIsPinned,
              }
            : t
        )
      );
    } else {
      const newTip: QuickTip = {
        id: 'tip-' + Math.random().toString(36).substring(2, 9),
        title: formTitle.trim(),
        category: finalCategory,
        shortcut: formShortcut.trim(),
        description: formDescription.trim(),
        color: formColor,
        isPinned: formIsPinned,
        createdAt: Date.now(),
      };
      setTips((prev) => [newTip, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Render individual keys or code badge
  const renderShortcutDisplay = (shortcut: string) => {
    if (!shortcut) return null;

    // Check if it's key combinations (contains + or has modifier symbols)
    const hasKeys = shortcut.includes('+') || /[⌘⌥⇧⌃]/.test(shortcut);

    if (hasKeys) {
      const keys = shortcut.split('+').map((k) => k.trim());
      return (
        <div className="quick-tip-keycaps">
          {keys.map((k, idx) => (
            <React.Fragment key={idx}>
              <kbd className="quick-tip-kbd">{k}</kbd>
              {idx < keys.length - 1 && <span className="quick-tip-key-plus">+</span>}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Code command / CLI / syntax snippet
    const isCommand = shortcut.startsWith('git') || shortcut.startsWith('npm') || shortcut.startsWith('docker') || shortcut.includes('(');

    return (
      <div className="quick-tip-command-badge">
        {isCommand && <Terminal size={12} className="command-terminal-icon" />}
        <code>{shortcut}</code>
      </div>
    );
  };

  const getCategoryInfo = (catKey: string) => {
    if (CATEGORY_META[catKey]) {
      return CATEGORY_META[catKey];
    }
    return {
      labelVi: catKey.toUpperCase(),
      labelEn: catKey.toUpperCase(),
      icon: <Lightbulb size={14} />,
      color: '#a855f7',
    };
  };

  return (
    <div className="quick-tips-section">
      {/* Widget Header Banner */}
      <div className="quick-tips-header">
        <div className="quick-tips-header-left">
          <div className="quick-tips-icon-wrapper">
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div>
            <div className="quick-tips-title-row">
              <h2 className="quick-tips-title">
                {isEn ? "Quick Tips & Shortcuts Deck" : "Kho Mẹo Nhanh & Phím Tắt"}
              </h2>
              <span className="quick-tips-count-badge">
                {tips.length} {isEn ? "tips" : "mẹo"}
              </span>
            </div>
            <p className="quick-tips-desc">
              {isEn 
                ? "Instant cheatsheets for macOS shortcuts, code snippets & dev tricks at your fingertips."
                : "Phím tắt macOS, lệnh code & mẹo vặt ghi nhớ nhanh để tra cứu tức thì bất cứ lúc nào."}
            </p>
          </div>
        </div>

        <div className="quick-tips-header-actions">
          <button
            type="button"
            className="btn-add-quick-tip"
            onClick={handleOpenAddModal}
            title={isEn ? "Add Quick Tip" : "Thêm mẹo mới"}
          >
            <Plus size={14} />
            <span>{isEn ? "Add Tip" : "Thêm Mẹo"}</span>
          </button>

          <button
            type="button"
            className="icon-btn-ghost quick-tips-collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? (isEn ? "Expand" : "Mở rộng") : (isEn ? "Collapse" : "Thu gọn")}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {!isCollapsed && (
        <div className="quick-tips-body">
          {/* Controls Bar: Search & Category Filter Pills */}
          <div className="quick-tips-controls-bar">
            {/* Search Input */}
            <div className="quick-tips-search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder={isEn ? "Search tips, shortcuts, commands..." : "Tìm phím tắt, lệnh code, mẹo vặt..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="quick-tips-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title={isEn ? "Clear search" : "Xóa tìm kiếm"}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="quick-tips-category-pills">
              <button
                type="button"
                className={`quick-category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>{isEn ? "All" : "Tất cả"}</span>
                <span className="pill-badge">{tips.length}</span>
              </button>

              <button
                type="button"
                className={`quick-category-pill ${selectedCategory === 'pinned' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('pinned')}
              >
                <Pin size={12} style={{ color: '#f59e0b' }} />
                <span>{isEn ? "Pinned" : "Đã ghim"}</span>
                <span className="pill-badge">{tips.filter((t) => t.isPinned).length}</span>
              </button>

              {categoriesList.map((catKey) => {
                const info = getCategoryInfo(catKey);
                const count = tips.filter((t) => t.category === catKey).length;
                const isActive = selectedCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    className={`quick-category-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(catKey)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: info.color }}>
                      {info.icon}
                    </span>
                    <span>{isEn ? info.labelEn : info.labelVi}</span>
                    <span className="pill-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredTips.length > 0 ? (
            <div className="quick-tips-grid">
              {filteredTips.map((tip) => {
                const catInfo = getCategoryInfo(tip.category);
                const colorConfig = COLOR_ACCENTS[tip.color || 'sky'] || COLOR_ACCENTS.sky;
                const isCopied = copiedId === tip.id;

                return (
                  <div
                    key={tip.id}
                    className={`quick-tip-card ${tip.isPinned ? 'is-pinned' : ''}`}
                    style={{
                      borderColor: colorConfig.border,
                      boxShadow: tip.isPinned
                        ? `0 6px 20px ${colorConfig.glow}, 0 0 0 1px ${colorConfig.border}`
                        : `0 3px 12px ${colorConfig.glow}`,
                    }}
                  >
                    {/* Top Row: Category Badge & Card Actions */}
                    <div className="quick-tip-card-header">
                      <div
                        className="quick-tip-cat-badge"
                        style={{
                          background: colorConfig.badgeBg,
                          color: colorConfig.text,
                        }}
                      >
                        {catInfo.icon}
                        <span>{isEn ? catInfo.labelEn : catInfo.labelVi}</span>
                      </div>

                      <div className="quick-tip-card-actions">
                        <button
                          type="button"
                          className={`icon-btn-card-action ${tip.isPinned ? 'active-pin' : ''}`}
                          onClick={() => handleTogglePin(tip.id)}
                          title={tip.isPinned ? (isEn ? "Unpin tip" : "Bỏ ghim") : (isEn ? "Pin to top" : "Ghim lên đầu")}
                        >
                          <Pin size={13} />
                        </button>

                        <button
                          type="button"
                          className="icon-btn-card-action"
                          onClick={() => handleOpenEditModal(tip)}
                          title={isEn ? "Edit tip" : "Chỉnh sửa"}
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          type="button"
                          className="icon-btn-card-action danger"
                          onClick={() => handleDeleteTip(tip.id)}
                          title={isEn ? "Delete tip" : "Xóa mẹo"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="quick-tip-card-title">{tip.title}</h3>

                    {/* Shortcut / Code Display Box */}
                    {tip.shortcut && (
                      <div className="quick-tip-shortcut-container">
                        <div className="quick-tip-shortcut-content">
                          {renderShortcutDisplay(tip.shortcut)}
                        </div>

                        <button
                          type="button"
                          className={`btn-copy-shortcut ${isCopied ? 'copied' : ''}`}
                          onClick={() => handleCopyShortcut(tip)}
                          title={isEn ? "Copy shortcut / command" : "Sao chép phím tắt / lệnh"}
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} strokeWidth={3} />
                              <span>{isEn ? "Copied" : "Đã chép"}</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>{isEn ? "Copy" : "Sao chép"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Description */}
                    {tip.description && (
                      <p className="quick-tip-card-desc">{tip.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="quick-tips-empty-state">
              <Command size={32} style={{ opacity: 0.35, marginBottom: 8 }} />
              <p className="empty-title">
                {isEn ? "No quick tips match your filter" : "Không tìm thấy mẹo nào phù hợp"}
              </p>
              <p className="empty-subtitle">
                {isEn 
                  ? "Try adjusting your search terms or create a new quick tip!"
                  : "Thử tìm kiếm với từ khóa khác hoặc nhấn '+ Thêm Mẹo' để tạo ghi nhớ mới!"}
              </p>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 12 }}
                onClick={handleOpenAddModal}
              >
                <Plus size={14} />
                <span>{isEn ? "Add New Tip" : "Thêm Mẹo Mới"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Tip Modal */}
      {isModalOpen && (
        <div className="quick-tip-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="quick-tip-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quick-tip-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="quick-tips-icon-wrapper" style={{ width: 32, height: 32 }}>
                  <Sparkles size={16} color="#f59e0b" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingTipId 
                    ? (isEn ? "Edit Quick Tip" : "Chỉnh Sửa Mẹo Nhanh")
                    : (isEn ? "New Quick Tip & Shortcut" : "Tạo Mẹo Nhanh & Phím Tắt Mới")}
                </h3>
              </div>

              <button
                type="button"
                className="icon-btn-ghost"
                onClick={() => setIsModalOpen(false)}
                title={isEn ? "Close" : "Đóng"}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="quick-tip-modal-form">
              {/* Tip Title */}
              <div className="form-group">
                <label className="form-label">
                  {isEn ? "Title / Purpose *" : "Tiêu đề / Mục đích *"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder={isEn ? "e.g., Screenshot selection to clipboard, Undo last commit..." : "Ví dụ: Chụp ảnh vùng chọn vào Clipboard, Hoàn tác commit..."}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Category Selection */}
              <div className="form-group">
                <label className="form-label">
                  {isEn ? "Category" : "Nhóm chủ đề"}
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <option value="mac">🍎 macOS (Phím tắt Mac)</option>
                    <option value="code">💻 Code & Dev (Mẹo lập trình)</option>
                    <option value="git">🌿 Git & Terminal (Dòng lệnh CLI)</option>
                    <option value="devnotes">⚡ DevNotes (Mẹo sử dụng app)</option>
                    <option value="other">💡 Mẹo vặt tổng hợp</option>
                    <option value="custom">✏️ Tự nhập nhóm khác...</option>
                  </select>

                  {formCategory === 'custom' && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isEn ? "Category name..." : "Nhập tên nhóm..."}
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      style={{ flex: 1, minWidth: 140 }}
                    />
                  )}
                </div>
              </div>

              {/* Shortcut or Command */}
              <div className="form-group">
                <label className="form-label">
                  {isEn ? "Shortcut / Code Command (Optional)" : "Phím tắt hoặc Câu lệnh (Tùy chọn)"}
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder={isEn ? "e.g. ⌘ + Shift + 4  or  git reset --soft HEAD~1" : "Ví dụ: ⌘ + Shift + 4  hoặc  git stash pop  hoặc  console.table(data)"}
                  value={formShortcut}
                  onChange={(e) => setFormShortcut(e.target.value)}
                />
                <span className="form-hint">
                  {isEn 
                    ? "Tip: Use '+' between keys (e.g. ⌘ + ⇧ + 4) to display stylish Mac keycaps!" 
                    : "Mẹo: Dùng dấu '+' giữa các phím (như ⌘ + ⇧ + 4) để hiển thị phím bấm macOS cực đẹp!"}
                </span>
              </div>

              {/* Description / Explanation */}
              <div className="form-group">
                <label className="form-label">
                  {isEn ? "Description / Usage Note" : "Hướng dẫn chi tiết & Ghi chú"}
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder={isEn ? "Brief explanation or tips on when/how to use this..." : "Giải thích ngắn gọn cách dùng hoặc lưu ý khi áp dụng..."}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Color Accent & Pinned */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {isEn ? "Card Accent:" : "Màu nổi bật:"}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['sky', 'indigo', 'emerald', 'amber', 'rose', 'purple'] as QuickTipColor[]).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setFormColor(col)}
                        className={`color-selector-dot ${formColor === col ? 'selected' : ''}`}
                        style={{
                          background: COLOR_ACCENTS[col].text,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: formColor === col ? '2px solid #ffffff' : 'none',
                          cursor: 'pointer',
                          outline: formColor === col ? `2px solid ${COLOR_ACCENTS[col].text}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    📌 {isEn ? "Pin to Top" : "Ghim lên đầu"}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="quick-tip-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  {isEn ? "Cancel" : "Hủy"}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingTipId 
                    ? (isEn ? "Save Changes" : "Lưu Thay Đổi") 
                    : (isEn ? "Create Tip" : "Tạo Mẹo")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
