import React from 'react';
import type { Page, AppLanguage, AppViewMode } from '../../types';
import { t } from '../../i18n/translations';
import { 
  Columns, 
  FileText, 
  Download, 
  Plus, 
  LayoutDashboard,
  Languages,
  PanelLeftOpen
} from 'lucide-react';

interface NavbarProps {
  page?: Page;
  viewMode: AppViewMode;
  onChangeViewMode: (mode: AppViewMode) => void;
  onAddPage: () => void;
  onExportMarkdown: () => void;
  lang: AppLanguage;
  onToggleLanguage: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  page,
  viewMode,
  onChangeViewMode,
  onAddPage,
  onExportMarkdown,
  lang,
  onToggleLanguage,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  return (
    <header className="top-navbar macos-titlebar">
      {/* Left Area: Traffic lights safe area (if sidebar is closed) + Sidebar Toggle + Address Capsule */}
      <div className="navbar-left-cluster">
        {!isSidebarOpen && <div className="macos-traffic-light-spacer" />}

        {onToggleSidebar && !isSidebarOpen && (
          <button
            className="macos-toolbar-btn sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title={lang === 'vi' ? 'Hiện thanh bên (⌘B)' : 'Show sidebar (⌘B)'}
            aria-label="Show sidebar"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}
      </div>

      {/* Center Area: macOS Native Segmented Control */}
      <div className="navbar-center-cluster">
        <div className="macos-segmented-bar" role="group" aria-label="View Mode">
          <button
            className={`macos-segment-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('dashboard')}
            title={t(lang, 'navDashboard')}
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </button>

          <button
            className={`macos-segment-btn ${viewMode === 'notes' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('notes')}
            title={t(lang, 'navNotes')}
          >
            <FileText size={13} />
            <span>{lang === 'vi' ? 'Ghi chú' : 'Notes'}</span>
          </button>

          <button
            className={`macos-segment-btn ${viewMode === 'studio' ? 'active' : ''}`}
            onClick={() => onChangeViewMode('studio')}
            title={t(lang, 'navStudio')}
          >
            <Columns size={13} />
            <span>Split Studio</span>
          </button>
        </div>
      </div>

      {/* Right Area: macOS Toolbar Action Buttons */}
      <div className="navbar-right-cluster">
        {page && viewMode !== 'dashboard' && (
          <button
            className="macos-toolbar-btn macos-action-btn"
            onClick={onExportMarkdown}
            title={lang === 'vi' ? 'Xuất bài học ra file Markdown (.md)' : 'Export note as Markdown (.md)'}
          >
            <Download size={13} />
            <span className="macos-btn-text">{lang === 'vi' ? 'Xuất .md' : 'Export'}</span>
          </button>
        )}

        <button
          className="macos-toolbar-btn macos-lang-pill"
          onClick={onToggleLanguage}
          title={t(lang, 'changeLangBtn')}
        >
          <Languages size={13} color="#0ea5e9" />
          <span className="macos-lang-text">{lang === 'vi' ? 'EN' : 'VI'}</span>
        </button>

        <button 
          className="macos-primary-btn" 
          onClick={onAddPage}
          title={t(lang, 'newLesson')}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>{t(lang, 'newLesson')}</span>
        </button>
      </div>
    </header>
  );
};
