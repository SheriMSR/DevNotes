import React, { useState, useMemo } from 'react';
import type { Page, AccentColor, BackgroundTheme, LearningActivity, AppLanguage } from '../../types';
import { t } from '../../i18n/translations';
import { TutorialModal } from './TutorialModal';
import { ThemePickerModal } from './ThemePickerModal';
import { TodoListWidget } from './TodoListWidget';
import { StickyNotesWidget } from './StickyNotesWidget';
import { QuickTipsWidget } from './QuickTipsWidget';
import { 
  BookOpen, 
  Code2, 
  CheckCircle2, 
  BrainCircuit, 
  Search, 
  Plus, 
  HelpCircle, 
  Palette, 
  ArrowRight, 
  Columns, 
  Tag as TagIcon, 
  SlidersHorizontal,
  FolderOpen,
  Languages,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  Check,
  CircleDot,
  X
} from 'lucide-react';
import { getNotionTagStyle, NOTION_STATUS_CONFIG, type NotionStatus } from '../Editor/TableBlock';

interface DashboardProps {
  pages: Page[];
  activities: LearningActivity[];
  onSelectPage: (pageId: string) => void;
  onOpenStudio: (pageId: string) => void;
  onAddPage: () => void;
  onUpdatePage?: (updatedPage: Page) => void;
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
  currentBg: BackgroundTheme;
  onSelectBg: (bg: BackgroundTheme) => void;
  lang: AppLanguage;
  onToggleLanguage: () => void;
  customTags?: string[];
  allAvailableTags?: string[];
  onAddCustomTag?: (tag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  pages,
  activities: _activities,
  onSelectPage,
  onOpenStudio,
  onAddPage,
  onUpdatePage,
  currentAccent,
  onSelectAccent,
  currentBg,
  onSelectBg,
  lang,
  onToggleLanguage,
  customTags = [],
  allAvailableTags,
  onAddCustomTag,
  onDeleteTag,
}) => {
  const [catalogLayout, setCatalogLayout] = useState<'grid' | 'table'>('table');
  const [activeStatusMenuPageId, setActiveStatusMenuPageId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'progress'>('newest');
  
  // Custom tag creation input
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Modals state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  // Derive all unique tags from pages + custom tags
  const allTags = useMemo(() => {
    if (allAvailableTags) return allAvailableTags;
    const tagSet = new Set<string>();
    pages.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    customTags.forEach((t) => tagSet.add(t));
    return Array.from(tagSet);
  }, [pages, customTags, allAvailableTags]);

  // Derive all unique categories
  const allCategories = useMemo(() => {
    const catSet = new Set<string>();
    pages.forEach((p) => {
      if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet);
  }, [pages]);

  // Stats calculation
  const stats = useMemo(() => {
    let totalCodeBlocks = 0;
    let totalTodos = 0;
    let completedTodos = 0;

    pages.forEach((p) => {
      p.blocks.forEach((b) => {
        if (b.type === 'code') totalCodeBlocks++;
        if (b.type === 'todo') {
          totalTodos++;
          if (b.checked) completedTodos++;
        }
      });
    });

    return {
      totalPages: pages.length,
      totalCodeBlocks,
      completedTodos,
      totalTodos,
    };
  }, [pages]);

  // Add custom tag
  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      onAddCustomTag?.(trimmed);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  // Toggle tag filter
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filtered & Sorted Pages
  const filteredPages = useMemo(() => {
    return pages
      .filter((p) => {
        // Category filter
        const matchesCategory =
          selectedCategory === 'all' || (p.category && p.category === selectedCategory);

        // Tags filter (must match all selected tags)
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every((st) => p.tags.includes(st));

        // Search query
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.tags.some((t) => t.toLowerCase().includes(query));

        return matchesCategory && matchesTags && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'progress') {
          const aTodos = a.blocks.filter((bl) => bl.type === 'todo');
          const bTodos = b.blocks.filter((bl) => bl.type === 'todo');
          const aRate = aTodos.length > 0 ? aTodos.filter((t) => t.checked).length / aTodos.length : 0;
          const bRate = bTodos.length > 0 ? bTodos.filter((t) => t.checked).length / bTodos.length : 0;
          return bRate - aRate;
        }
        return 0;
      });
  }, [pages, selectedCategory, selectedTags, searchQuery, sortBy]);

  const getPageStatus = (p: Page): NotionStatus => {
    if (p.status === 'completed') return 'Done';
    if (p.status === 'learning') return 'In progress';
    if (p.status === 'review') return 'Frequent update';
    const todos = p.blocks.filter((b) => b.type === 'todo');
    if (todos.length > 0 && todos.every((t) => t.checked)) return 'Done';
    if (todos.some((t) => t.checked)) return 'In progress';
    return 'Done';
  };

  const handlePageStatusChange = (page: Page, status: NotionStatus) => {
    if (!onUpdatePage) return;
    let mappedStatus: 'learning' | 'completed' | 'review' = 'completed';
    if (status === 'Done') mappedStatus = 'completed';
    else if (status === 'In progress') mappedStatus = 'learning';
    else mappedStatus = 'review';
    onUpdatePage({ ...page, status: mappedStatus, updatedAt: Date.now() });
    setActiveStatusMenuPageId(null);
  };

  return (
    <div className="dashboard-container">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div className="dashboard-hero-badge">
              <FolderOpen size={13} />
              <span>{t(lang, 'dashboardBadge')}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 8 }}>
              {t(lang, 'dashboardHeroTitle')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {t(lang, 'dashboardHeroDesc')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onToggleLanguage} title={t(lang, 'changeLangBtn')}>
              <Languages size={14} color="#0ea5e9" />
              <span style={{ fontWeight: 600 }}>{lang === 'vi' ? 'English (EN)' : 'Tiếng Việt (VI)'}</span>
            </button>

            <button className="btn-secondary" onClick={() => setIsTutorialOpen(true)} title={t(lang, 'tutorialBtn')}>
              <HelpCircle size={14} color="#10b981" />
              <span>{t(lang, 'tutorialBtn')}</span>
            </button>

            <button className="btn-secondary" onClick={() => setIsThemePickerOpen(true)} title={t(lang, 'changeThemeBtn')}>
              <Palette size={14} color="var(--primary)" />
              <span>{t(lang, 'changeThemeBtn')}</span>
            </button>

            <button className="btn-primary" onClick={onAddPage}>
              <Plus size={14} />
              <span>{t(lang, 'newLesson')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.totalPages}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t(lang, 'totalLessons')}
            </div>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Code2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.totalCodeBlocks}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t(lang, 'runnableBlocks')}
            </div>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.completedTodos} / {stats.totalTodos}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t(lang, 'goalsCompleted')}
            </div>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
            <BrainCircuit size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t(lang, 'readyStatus')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t(lang, 'spacedRepetitionReady')}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Goals Todo List & Sticky Notes Widgets */}
      <div className="dashboard-widgets-container">
        <TodoListWidget lang={lang} />
        <StickyNotesWidget lang={lang} />
      </div>

      {/* Quick Tips & Shortcuts Deck */}
      <QuickTipsWidget lang={lang} />

      {/* Filter & Sort Section */}
      <div className="filter-section">
        {/* Category Pills Row */}
        <div className="category-pills-row">
          <button
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            {t(lang, 'allCategories')} ({pages.length})
          </button>
          {allCategories.map((cat) => {
            const count = pages.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Dynamic Tags Filter & Creator Bar */}
        <div className="tags-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: 4 }}>
            <TagIcon size={14} />
            <span>{t(lang, 'tagsLabel')}</span>
          </div>

          {allTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <div key={tag} className="tag-filter-chip-wrapper">
                <button
                  className={`tag-filter-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleToggleTag(tag)}
                >
                  <span>#{tag}</span>
                  {isActive && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                </button>
                {onDeleteTag && (
                  <button
                    className="tag-chip-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTag(tag);
                    }}
                    title={lang === 'en' ? `Delete tag #${tag}` : `Xóa tag #${tag}`}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Inline Create New Tag */}
          {isAddingTag ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder={t(lang, 'newTagNamePlaceholder')}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: '0.76rem',
                }}
              />
              <button className="btn-primary" onClick={handleAddCustomTag} style={{ padding: '3px 8px', fontSize: '0.74rem' }}>
                {t(lang, 'save')}
              </button>
              <button className="icon-btn-ghost" onClick={() => setIsAddingTag(false)}>
                ×
              </button>
            </div>
          ) : (
            <button
              className="tag-filter-chip"
              onClick={() => setIsAddingTag(true)}
              style={{ borderStyle: 'dashed', color: 'var(--primary)' }}
            >
              <Plus size={11} />
              <span>{t(lang, 'createNewTag')}</span>
            </button>
          )}

          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              style={{ marginLeft: 'auto', fontSize: '0.74rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {t(lang, 'clearTagFilter')} ({selectedTags.length})
            </button>
          )}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', flex: 1, minWidth: 260 }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(lang, 'searchPlaceholder')}
              style={{ width: '100%', fontSize: '0.86rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px 12px' }}>
            <SlidersHorizontal size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t(lang, 'sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ background: 'transparent', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}
            >
              <option value="newest" style={{ background: '#1e293b' }}>{t(lang, 'sortNewest')}</option>
              <option value="oldest" style={{ background: '#1e293b' }}>{t(lang, 'sortOldest')}</option>
              <option value="title" style={{ background: '#1e293b' }}>{t(lang, 'sortTitle')}</option>
              <option value="progress" style={{ background: '#1e293b' }}>{t(lang, 'sortProgress')}</option>
            </select>
          </div>

          {/* Layout Toggle: Notion Table vs Grid Cards */}
          <div className="layout-toggle-pill">
            <button
              className={`layout-btn ${catalogLayout === 'table' ? 'active' : ''}`}
              onClick={() => setCatalogLayout('table')}
              title={lang === 'vi' ? 'Xem dạng bảng Notion (My knowledge)' : 'Notion table view'}
            >
              <TableIcon size={14} />
              <span>{lang === 'vi' ? 'Bảng Notion' : 'Table'}</span>
            </button>
            <button
              className={`layout-btn ${catalogLayout === 'grid' ? 'active' : ''}`}
              onClick={() => setCatalogLayout('grid')}
              title={lang === 'vi' ? 'Xem dạng lưới thẻ' : 'Grid view'}
            >
              <LayoutGrid size={14} />
              <span>{lang === 'vi' ? 'Lưới thẻ' : 'Grid'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content View: Notion Table or Cards Grid */}
      {catalogLayout === 'table' ? (
        <div className="notion-database-table-block" style={{ marginTop: 20 }}>
          <div className="notion-table-topbar">
            <div className="notion-table-title-area">
              <span className="notion-table-icon">📖</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {lang === 'vi' ? 'My knowledge (Kho tri thức)' : 'My knowledge'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                ({filteredPages.length} {lang === 'vi' ? 'bài học' : 'lessons'})
              </span>
            </div>

            <div className="notion-table-controls">
              <button
                className="notion-table-btn-new"
                onClick={onAddPage}
                title={lang === 'vi' ? 'Thêm bài học mới' : 'Add new lesson'}
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New</span>
              </button>
            </div>
          </div>

          <div className="notion-table-scroll-container">
            <table className="notion-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 280 }}>
                    <div className="notion-th-content">
                      <span className="notion-col-type-icon">Aa</span>
                      <span>Page</span>
                    </div>
                  </th>
                  <th style={{ minWidth: 200 }}>
                    <div className="notion-th-content">
                      <TagIcon size={12} className="notion-col-type-icon" />
                      <span>Tags</span>
                    </div>
                  </th>
                  <th style={{ minWidth: 170 }}>
                    <div className="notion-th-content">
                      <CircleDot size={12} className="notion-col-type-icon" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th style={{ width: 110, textAlign: 'right' }}>
                    <div className="notion-th-content" style={{ justifyContent: 'flex-end' }}>
                      <span>Thao tác</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => {
                  const statusKey = getPageStatus(page);
                  const statusConfig = NOTION_STATUS_CONFIG[statusKey] || NOTION_STATUS_CONFIG['Done'];
                  const isMenuOpen = activeStatusMenuPageId === page.id;

                  return (
                    <tr key={page.id} className="notion-table-row">
                      {/* Page Column */}
                      <td className="notion-td" onClick={() => onSelectPage(page.id)} style={{ cursor: 'pointer' }}>
                        <div className="notion-page-cell-content">
                          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{page.icon || '📄'}</span>
                          <span className="notion-cell-text-value" style={{ fontWeight: 600 }}>{page.title}</span>
                        </div>
                      </td>

                      {/* Tags Column */}
                      <td className="notion-td">
                        <div className="notion-tags-cell-row">
                          {page.tags.length > 0 ? (
                            page.tags.map((t) => {
                              const s = getNotionTagStyle(t);
                              return (
                                <span
                                  key={t}
                                  className="notion-tag-pill"
                                  style={{
                                    backgroundColor: s.bg,
                                    color: s.color,
                                    border: `1px solid ${s.border}`,
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTag(t);
                                  }}
                                  title={`Lọc theo tag #${t}`}
                                >
                                  {t}
                                </span>
                              );
                            })
                          ) : (
                            <span className="notion-placeholder-text">Chưa có tag</span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="notion-td" style={{ position: 'relative' }}>
                        <div
                          className="notion-status-badge"
                          style={{
                            background: statusConfig.bg,
                            color: statusConfig.color,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveStatusMenuPageId(isMenuOpen ? null : page.id);
                          }}
                        >
                          <span className="notion-status-dot" style={{ backgroundColor: statusConfig.dot }} />
                          <span className="notion-status-text">{statusConfig.label}</span>
                          <ChevronDown size={11} style={{ opacity: 0.6, marginLeft: 2 }} />
                        </div>

                        {isMenuOpen && (
                          <div
                            className="notion-status-picker-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="notion-status-picker-header">Cập nhật trạng thái</div>
                            {Object.entries(NOTION_STATUS_CONFIG).map(([key, item]) => (
                              <button
                                key={key}
                                className={`notion-status-picker-item ${key === statusKey ? 'active' : ''}`}
                                onClick={() => handlePageStatusChange(page, key as NotionStatus)}
                              >
                                <span className="notion-status-dot" style={{ backgroundColor: item.dot }} />
                                <span>{item.label}</span>
                                {key === statusKey && <Check size={12} style={{ marginLeft: 'auto' }} />}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="notion-td" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn-send-studio"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStudio(page.id);
                            }}
                            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                            title="Mở trong Split Studio"
                          >
                            Studio
                          </button>
                          <button
                            className="icon-btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPage(page.id);
                            }}
                            title="Mở ghi chú"
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="notion-table-footer">
            <button className="notion-table-btn-add-row" onClick={onAddPage}>
              <Plus size={13} />
              <span>{lang === 'vi' ? 'Thêm bài học mới (+ New)' : 'New page (+ New)'}</span>
            </button>
            <div className="notion-table-row-count">
              {filteredPages.length} {lang === 'vi' ? 'bài học' : 'lessons'}
            </div>
          </div>
        </div>
      ) : (
        /* Lesson Catalog Cards Grid */
        <div className="lessons-catalog-grid">
        {filteredPages.map((page) => {
          const codeBlocksCount = page.blocks.filter((b) => b.type === 'code').length;
          const todos = page.blocks.filter((b) => b.type === 'todo');
          const completedCount = todos.filter((t) => t.checked).length;

          return (
            <div
              key={page.id}
              className="lesson-card"
              onClick={() => onSelectPage(page.id)}
            >
              {/* Card Banner */}
              <div
                className="lesson-card-banner"
                style={{
                  background:
                    page.coverGradient ||
                    'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                }}
              >
                <div className="lesson-card-icon">{page.icon}</div>
                {page.category && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: 'rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(8px)',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {page.category}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="lesson-card-body">
                <h3 className="lesson-card-title">{page.title}</h3>
                
                <p className="lesson-card-desc">
                  {page.description ||
                    (lang === 'vi' 
                      ? 'Bài học thực hành kết hợp ghi chú lý thuyết và mã chạy trực tiếp trong DevNotes.'
                      : 'Interactive lesson combining theoretical notes and executable code runners.')}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {page.tags.map((t) => (
                    <span key={t} className="tag-pill" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Footer Stats & Actions */}
                <div className="lesson-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Code2 size={13} color="var(--primary)" />
                      <span>{codeBlocksCount} {t(lang, 'blocksCount')}</span>
                    </span>
                    {todos.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} color="#10b981" />
                        <span>{completedCount}/{todos.length}</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-send-studio"
                      onClick={() => onOpenStudio(page.id)}
                      title={t(lang, 'openInStudio')}
                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    >
                      <Columns size={12} />
                      <span>{t(lang, 'openInStudio')}</span>
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => onSelectPage(page.id)}
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      <span>{t(lang, 'studyLesson')}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {filteredPages.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginTop: 20 }}>
          <FolderOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t(lang, 'noMatchingLessons')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
            {t(lang, 'tryAdjustingFilters')}
          </p>
        </div>
      )}

      {/* Modals */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        lang={lang}
      />

      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
        currentAccent={currentAccent}
        onSelectAccent={onSelectAccent}
        currentBg={currentBg}
        onSelectBg={onSelectBg}
        lang={lang}
      />
    </div>
  );
};
