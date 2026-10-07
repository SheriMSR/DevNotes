import React, { useState, useEffect } from 'react';
import type { Page, Snippet, FlashcardItem, LanguageId, AccentColor, BackgroundTheme, LearningActivity, AppLanguage } from './types';
import {
  loadPages,
  savePages,
  loadSnippets,
  saveSnippets,
  loadFlashcards,
  saveFlashcards,
  loadActivePageId,
  saveActivePageId,
  loadTheme,
  saveTheme,
  loadAccentColor,
  saveAccentColor,
  loadBackgroundTheme,
  saveBackgroundTheme,
  loadActivities,
  saveActivities,
  recordActivity,
  loadLanguage,
  saveLanguage,
  loadViewMode,
  saveViewMode,
  loadCustomTags,
  saveCustomTags,
} from './services/storage';
import { Sidebar } from './components/Sidebar/Sidebar';
import type { AppViewMode } from './types';
import { Navbar } from './components/Navbar/Navbar';
import { NotionEditor } from './components/Editor/NotionEditor';
import { SplitWorkspace } from './components/Playground/SplitWorkspace';
import { SnippetsVault } from './components/SnippetsVault/SnippetsVault';
import { FlashcardQuiz } from './components/Flashcards/FlashcardQuiz';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ThemePickerModal } from './components/Dashboard/ThemePickerModal';
import { t } from './i18n/translations';

export const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(loadPages);
  const [activePageId, setActivePageId] = useState<string>(loadActivePageId);
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(loadFlashcards);
  const [viewMode, setViewMode] = useState<AppViewMode>(loadViewMode);
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme);
  const [accentColor, setAccentColor] = useState<AccentColor>(loadAccentColor);
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>(loadBackgroundTheme);
  const [activities, setActivities] = useState<LearningActivity[]>(loadActivities);
  const [language, setLanguage] = useState<AppLanguage>(loadLanguage);
  const [customTags, setCustomTags] = useState<string[]>(loadCustomTags);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [pinnedCode, setPinnedCode] = useState<{
    code: string;
    language: LanguageId;
    snippetId?: string;
    snippetTitle?: string;
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('devnotes_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  // Keep customTags synced to localStorage
  useEffect(() => {
    saveCustomTags(customTags);
  }, [customTags]);

  const handleAddCustomTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setCustomTags((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      saveCustomTags(next);
      return next;
    });
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const target = tagToDelete.toLowerCase();
    // 1. Remove from customTags
    setCustomTags((prev) => {
      const next = prev.filter((t) => t.toLowerCase() !== target);
      saveCustomTags(next);
      return next;
    });
    // 2. Remove from all pages
    setPages((prevPages) => {
      const updated = prevPages.map((p) => {
        if (p.tags.some((t) => t.toLowerCase() === target)) {
          return {
            ...p,
            tags: p.tags.filter((t) => t.toLowerCase() !== target),
            updatedAt: Date.now(),
          };
        }
        return p;
      });
      savePages(updated);
      return updated;
    });
  };

  // Derive all unique tags from pages + customTags
  const allAvailableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    pages.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    customTags.forEach((t) => tagSet.add(t));
    return Array.from(tagSet);
  }, [pages, customTags]);

  // Global macOS shortcut Cmd+B or Cmd+\ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B' || e.key === '\\')) {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          localStorage.setItem('devnotes_sidebar_open', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('devnotes_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Sync state to local storage
  useEffect(() => {
    savePages(pages);
  }, [pages]);

  useEffect(() => {
    saveSnippets(snippets);
  }, [snippets]);

  useEffect(() => {
    saveFlashcards(flashcards);
  }, [flashcards]);

  useEffect(() => {
    saveActivePageId(activePageId);
  }, [activePageId]);

  useEffect(() => {
    saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    saveAccentColor(accentColor);
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    saveBackgroundTheme(bgTheme);
    document.documentElement.setAttribute('data-bg', bgTheme);
  }, [bgTheme]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  // Window beforeunload safety guard to guarantee all states are flushed to localStorage
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePages(pages);
      saveActivePageId(activePageId);
      saveViewMode(viewMode);
      saveSnippets(snippets);
      saveFlashcards(flashcards);
      saveActivities(activities);
      saveTheme(theme);
      saveAccentColor(accentColor);
      saveBackgroundTheme(bgTheme);
      saveLanguage(language);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pages, activePageId, viewMode, snippets, flashcards, activities, theme, accentColor, bgTheme, language]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'vi' ? 'en' : 'vi'));
  };

  // Current active page
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  // Actions
  const handleUpdatePage = (updatedPage: Page) => {
    setPages((prev) => {
      const next = prev.map((p) => (p.id === updatedPage.id ? updatedPage : p));
      savePages(next);
      return next;
    });
  };

  const handleAddPage = () => {
    const newId = 'page-' + Math.random().toString(36).substring(2, 9);
    const newPage: Page = {
      id: newId,
      title: t(language, 'untitledLesson'),
      icon: '💡',
      description: t(language, 'newLessonDesc'),
      category: t(language, 'generalCategory'),
      status: 'learning',
      coverGradient: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [
        {
          id: 'b-init-1',
          type: 'heading1',
          content: t(language, 'lessonObjectivesHeading'),
        },
        {
          id: 'b-init-2',
          type: 'text',
          content: t(language, 'lessonNotesInit'),
        },
        {
          id: 'b-init-3',
          type: 'code',
          language: 'javascript',
          content: t(language, 'lessonCodeInit'),
        },
      ],
    };

    const nextPages = [newPage, ...pages];
    setPages(nextPages);
    savePages(nextPages);
    setActivePageId(newId);
    saveActivePageId(newId);
    setViewMode('notes');
    saveViewMode('notes');

    // Record activity for contributions graph
    const updated = recordActivity('note', t(language, 'createdNewLessonActivity'));
    setActivities(updated);
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert(t(language, 'keepAtLeastOneLesson'));
      return;
    }
    const remaining = pages.filter((p) => p.id !== pageId);
    setPages(remaining);
    savePages(remaining);
    if (activePageId === pageId) {
      const nextId = remaining[0].id;
      setActivePageId(nextId);
      saveActivePageId(nextId);
    }
  };

  const handleSelectBgTheme = (newBg: BackgroundTheme) => {
    setBgTheme(newBg);
    saveBackgroundTheme(newBg);
    const isLightBg = newBg === 'light' || newBg === 'sepia';
    const nextTheme = isLightBg ? 'light' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const nextBg: BackgroundTheme = next === 'light' ? 'light' : 'midnight';
      setBgTheme(nextBg);
      saveBackgroundTheme(nextBg);
      return next;
    });
  };

  const handleSendToStudio = (code: string, language: LanguageId, snippetId?: string, snippetTitle?: string) => {
    setPinnedCode({ code, language, snippetId, snippetTitle });
    setViewMode('studio');
  };

  const handleSaveSnippet = (
    title: string,
    code: string,
    language: LanguageId,
    snippetId?: string,
    pageId?: string
  ): string => {
    // 1. If snippetId is specified, update that existing snippet
    if (snippetId) {
      const idx = snippets.findIndex((s) => s.id === snippetId);
      if (idx !== -1) {
        const next = [...snippets];
        next[idx] = {
          ...next[idx],
          title,
          code,
          language,
          updatedAt: Date.now(),
        };
        setSnippets(next);
        saveSnippets(next);
        const updated = recordActivity('snippet', `Cập nhật snippet: ${title}`);
        setActivities(updated);
        return snippetId;
      }
    }

    // 2. If pageId is provided, check if a snippet already exists for this page and language
    if (pageId) {
      const existingByPage = snippets.find((s) => s.pageId === pageId && s.language === language);
      if (existingByPage) {
        const next = snippets.map((s) =>
          s.id === existingByPage.id
            ? { ...s, title, code, language, updatedAt: Date.now() }
            : s
        );
        setSnippets(next);
        saveSnippets(next);
        const updated = recordActivity('snippet', `Cập nhật snippet: ${title}`);
        setActivities(updated);
        return existingByPage.id;
      }
    }

    // 3. Otherwise create a new snippet
    const newId = 'snip-' + Math.random().toString(36).substring(2, 9);
    const newSnip: Snippet = {
      id: newId,
      title,
      description: 'Lưu từ bài học DevNotes',
      language,
      code,
      tags: [language.toUpperCase()],
      createdAt: Date.now(),
      pageId,
    };
    const next = [newSnip, ...snippets];
    setSnippets(next);
    saveSnippets(next);

    // Record activity for contributions graph
    const updated = recordActivity('snippet', `Lưu snippet: ${title}`);
    setActivities(updated);
    return newId;
  };

  // Export current note as Markdown (.md)
  const handleExportMarkdown = () => {
    if (!activePage) return;

    let md = `# ${activePage.title}\n\n`;
    if (activePage.tags.length > 0) {
      md += `Tags: ${activePage.tags.map((t) => `#${t}`).join(' ')}\n\n---\n\n`;
    }

    activePage.blocks.forEach((b) => {
      switch (b.type) {
        case 'heading1':
          md += `## ${b.content}\n\n`;
          break;
        case 'heading2':
          md += `### ${b.content}\n\n`;
          break;
        case 'todo':
          md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
          break;
        case 'callout':
          md += `> **${b.calloutMeta?.title || 'Note'}**: ${b.content}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${b.language || 'javascript'}\n${b.content}\n\`\`\`\n\n`;
          break;
        case 'divider':
          md += `\n---\n\n`;
          break;
        case 'columns':
          if (b.columnsMeta) {
            md += `\n<!-- 2-Columns Layout (${b.columnsMeta.leftRatio}% : ${100 - b.columnsMeta.leftRatio}%) -->\n`;
            md += `#### Cột trái\n\n`;
            b.columnsMeta.leftBlocks.forEach((sub) => {
              md += sub.type === 'code' ? `\`\`\`${sub.language || 'javascript'}\n${sub.content}\n\`\`\`\n\n` : `${sub.content}\n\n`;
            });
            md += `#### Cột phải\n\n`;
            b.columnsMeta.rightBlocks.forEach((sub) => {
              md += sub.type === 'code' ? `\`\`\`${sub.language || 'javascript'}\n${sub.content}\n\`\`\`\n\n` : `${sub.content}\n\n`;
            });
          }
          break;
        case 'table':
          if (b.tableMeta) {
            md += `### 📖 ${b.tableMeta.title || 'Table'}\n\n`;
            const cols = b.tableMeta.columns;
            md += `| ${cols.map((c) => c.name).join(' | ')} |\n`;
            md += `| ${cols.map(() => '---').join(' | ')} |\n`;
            b.tableMeta.rows.forEach((r) => {
              md += `| ${cols.map((c) => r.cells[c.id] || '').join(' | ')} |\n`;
            });
            md += '\n';
          }
          break;
        case 'text':
        default:
          md += `${b.content}\n\n`;
          break;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Export full backup JSON
  const handleExportAllData = () => {
    const backup = {
      pages,
      snippets,
      flashcards,
      version: 1,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devnotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Import backup JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.pages && Array.isArray(data.pages)) setPages(data.pages);
        if (data.snippets && Array.isArray(data.snippets)) setSnippets(data.snippets);
        if (data.flashcards && Array.isArray(data.flashcards)) setFlashcards(data.flashcards);
        alert('Đã khôi phục dữ liệu thành công!');
      } catch (err) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={(id) => {
          setActivePageId(id);
          setViewMode('notes');
        }}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenThemePicker={() => setIsThemePickerOpen(true)}
        lang={language}
        onToggleLanguage={handleToggleLanguage}
        onExportAllData={handleExportAllData}
        onImportData={handleImportData}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <main className="main-view">
        <Navbar
          page={activePage}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onAddPage={handleAddPage}
          onExportMarkdown={handleExportMarkdown}
          lang={language}
          onToggleLanguage={handleToggleLanguage}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* View Mode Switching */}
        {viewMode === 'dashboard' && (
          <Dashboard
            pages={pages}
            activities={activities}
            onSelectPage={(id) => {
              setActivePageId(id);
              setViewMode('notes');
            }}
            onOpenStudio={(id) => {
              setActivePageId(id);
              setViewMode('studio');
            }}
            onAddPage={handleAddPage}
            onUpdatePage={handleUpdatePage}
            currentAccent={accentColor}
            onSelectAccent={setAccentColor}
            currentBg={bgTheme}
            onSelectBg={handleSelectBgTheme}
            lang={language}
            onToggleLanguage={handleToggleLanguage}
            customTags={customTags}
            allAvailableTags={allAvailableTags}
            onAddCustomTag={handleAddCustomTag}
            onDeleteTag={handleDeleteTag}
          />
        )}

        {viewMode === 'notes' && activePage && (
          <NotionEditor
            page={activePage}
            onUpdatePage={handleUpdatePage}
            onSendToStudio={handleSendToStudio}
            lang={language}
            allAvailableTags={allAvailableTags}
            onAddCustomTag={handleAddCustomTag}
            onDeleteTag={handleDeleteTag}
          />
        )}

        {viewMode === 'studio' && activePage && (
          <SplitWorkspace
            page={activePage}
            onUpdatePage={handleUpdatePage}
            pinnedCode={pinnedCode}
            onSaveSnippet={handleSaveSnippet}
            snippets={snippets}
          />
        )}

        {viewMode === 'snippets' && (
          <SnippetsVault
            snippets={snippets}
            onUpdateSnippets={setSnippets}
            onSendToStudio={handleSendToStudio}
          />
        )}

        {viewMode === 'flashcards' && (
          <FlashcardQuiz
            cards={flashcards}
            onUpdateCards={setFlashcards}
          />
        )}
      </main>

      {/* Theme Picker Modal */}
      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
        currentAccent={accentColor}
        onSelectAccent={setAccentColor}
        currentBg={bgTheme}
        onSelectBg={setBgTheme}
        lang={language}
      />
    </div>
  );
};

export default App;
