import React, { useState } from 'react';
import type { Page, AppLanguage } from '../../types';
import { t } from '../../i18n/translations';
import { 
  BookOpen, 
  Columns, 
  Code2, 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Download, 
  LayoutDashboard,
  Palette,
  Upload, 
  Search,
  Languages,
  PanelLeftClose
} from 'lucide-react';

export type AppViewMode = 'dashboard' | 'notes' | 'studio' | 'snippets' | 'flashcards';

interface SidebarProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  viewMode: AppViewMode;
  onChangeViewMode: (mode: AppViewMode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenThemePicker?: () => void;
  lang: AppLanguage;
  onToggleLanguage: () => void;
  onExportAllData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  viewMode,
  onChangeViewMode,
  theme,
  onToggleTheme,
  onOpenThemePicker,
  lang,
  onToggleLanguage,
  onExportAllData,
  onImportData,
  isOpen = true,
  onToggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      {/* Brand Header with macOS Traffic Light Spacer */}
      <div className="sidebar-header">
        <div className="macos-traffic-light-spacer" />
        <div 
          className="brand" 
          onClick={() => onChangeViewMode('dashboard')} 
          title={t(lang, 'backToDashboard')}
        >
          <div className="brand-icon">
            <Code2 size={16} strokeWidth={2.5} />
          </div>
          <span className="brand-text">
            {t(lang, 'appName')}
          </span>
          <span className="brand-badge">
            v1.0
          </span>
        </div>
        
        {onToggleSidebar && (
          <button 
            className="macos-toolbar-btn sidebar-collapse-btn" 
            onClick={onToggleSidebar}
            title={lang === 'vi' ? 'Thu gọn thanh bên (⌘B)' : 'Hide sidebar (⌘B)'}
            aria-label="Hide sidebar"
          >
            <PanelLeftClose size={14} />
          </button>
        )}
      </div>

      {/* Main Navigation Modes */}
      <div className="nav-modes">
        <button
          className={`nav-item ${viewMode === 'dashboard' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('dashboard')}
        >
          <LayoutDashboard size={16} />
          <span>{t(lang, 'navDashboard')}</span>
          <span className="badge" style={{ color: 'var(--primary)' }}>Hub</span>
        </button>

        <button
          className={`nav-item ${viewMode === 'notes' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('notes')}
        >
          <BookOpen size={16} />
          <span>{t(lang, 'navNotes')}</span>
          <span className="badge">{pages.length}</span>
        </button>

        <button
          className={`nav-item ${viewMode === 'studio' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('studio')}
        >
          <Columns size={16} />
          <span>{t(lang, 'navStudio')}</span>
          <span className="badge" style={{ color: '#10b981' }}>Live</span>
        </button>

        <button
          className={`nav-item ${viewMode === 'snippets' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('snippets')}
        >
          <Code2 size={16} />
          <span>{t(lang, 'navSnippets')}</span>
        </button>

        <button
          className={`nav-item ${viewMode === 'flashcards' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('flashcards')}
        >
          <BrainCircuit size={16} />
          <span>{t(lang, 'navFlashcards')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px' }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(lang, 'searchLessons')}
            style={{ width: '100%', fontSize: '0.78rem' }}
          />
        </div>
      </div>

      {/* Section Header: Bài học */}
      <div className="sidebar-section-title">
        <span>{t(lang, 'lessonsTitle')}</span>
        <button className="icon-btn-ghost" onClick={onAddPage} title={t(lang, 'addLesson')}>
          <Plus size={14} />
        </button>
      </div>

      {/* Pages List */}
      <div className="sidebar-pages-list">
        {filteredPages.map((page) => (
          <div
            key={page.id}
            className={`page-row ${page.id === activePageId ? 'active' : ''}`}
            onClick={() => {
              onSelectPage(page.id);
              if (viewMode === 'snippets' || viewMode === 'flashcards') {
                onChangeViewMode('notes');
              }
            }}
          >
            <span className="page-icon">{page.icon}</span>
            <span className="page-title-text">{page.title || 'Không có tiêu đề'}</span>
            
            <div className="page-actions-hover" onClick={(e) => e.stopPropagation()}>
              <button
                className="icon-btn-ghost"
                onClick={() => onDeletePage(page.id)}
                title="Xóa bài học"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredPages.length === 0 && (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Không tìm thấy bài học nào
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn-ghost" onClick={onToggleTheme} title={t(lang, 'toggleThemeTooltip')}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {onOpenThemePicker && (
            <button className="icon-btn-ghost" onClick={onOpenThemePicker} title={t(lang, 'paletteTooltip')}>
              <Palette size={15} color="var(--primary)" />
            </button>
          )}
          <button className="icon-btn-ghost" onClick={onToggleLanguage} title={t(lang, 'changeLangBtn')}>
            <Languages size={14} color="#0ea5e9" />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, marginLeft: 2 }}>{lang.toUpperCase()}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button className="icon-btn-ghost" onClick={onExportAllData} title={t(lang, 'exportBackupTooltip')}>
            <Download size={14} />
          </button>
          <label className="icon-btn-ghost" title={t(lang, 'importBackupTooltip')} style={{ cursor: 'pointer' }}>
            <Upload size={14} />
            <input type="file" accept=".json" onChange={onImportData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </aside>
  );
};
