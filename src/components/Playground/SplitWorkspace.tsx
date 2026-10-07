import React, { useState, useRef, useEffect } from 'react';
import type { Page, LanguageId, CodeOutput } from '../../types';
import { NotionEditor } from '../Editor/NotionEditor';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { sql } from '@codemirror/lang-sql';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { executeCode } from '../../services/multiLanguageService';
import { loadStudioCode, saveStudioCode, loadStudioLang, saveStudioLang } from '../../services/storage';
import { 
  Play, 
  Terminal, 
  Eye, 
  RefreshCw, 
  BookmarkPlus, 
  Check,
  Trash, 
  Columns,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  GripHorizontal
} from 'lucide-react';
import type { Snippet } from '../../types';

interface SplitWorkspaceProps {
  page: Page;
  onUpdatePage: (updatedPage: Page) => void;
  pinnedCode?: { code: string; language: LanguageId; snippetId?: string; snippetTitle?: string } | null;
  onSaveSnippet?: (title: string, code: string, language: LanguageId, snippetId?: string, pageId?: string) => string;
  snippets?: Snippet[];
}

export interface StudioLangConfig {
  id: LanguageId;
  label: string;
  badge: string;
  color: string;
  desc: string;
}

export const STUDIO_LANGUAGES: StudioLangConfig[] = [
  { id: 'csharp', label: 'C# (.NET)', badge: 'C#', color: '#a855f7', desc: 'C# Console / LINQ' },
  { id: 'sql', label: 'SQL (Database)', badge: 'SQL', color: '#10b981', desc: 'SQLite / In-Memory DB' },
  { id: 'bash', label: 'Bash (Shell)', badge: 'SH', color: '#f59e0b', desc: 'Linux / macOS Shell Script' },
  { id: 'javascript', label: 'JavaScript', badge: 'JS', color: '#eab308', desc: 'Browser & Node JS ES6+' },
  { id: 'typescript', label: 'TypeScript', badge: 'TS', color: '#38bdf8', desc: 'Typed JavaScript' },
  { id: 'html', label: 'HTML & CSS', badge: 'WEB', color: '#f43f5e', desc: 'Live Webpage Preview' },
  { id: 'json', label: 'JSON Data', badge: '{ }', color: '#06b6d4', desc: 'Data Structure / Schema' },
];

const DEFAULT_SANDBOX_CODES: Record<LanguageId, string> = {
  csharp: `// Thử nghiệm C# (.NET)
using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        Console.WriteLine("🚀 Xin chào từ C# trong DevNotes!");
        
        var numbers = new List<int> { 15, 28, 42, 69, 88 };
        Console.WriteLine($"Danh sách gồm {numbers.Count} phần tử.");
        
        foreach (var n in numbers) {
            Console.WriteLine($"Số: {n} -> Bình phương: {n * n}");
        }
    }
}`,

  sql: `-- Thử nghiệm SQL Database (SQLite)
SELECT 
  role, 
  COUNT(*) AS total_users, 
  AVG(points) AS avg_score 
FROM users 
GROUP BY role 
ORDER BY avg_score DESC;`,

  bash: `#!/bin/bash
# Thử nghiệm Bash / Shell Script
echo "⚡ Xin chào từ DevNotes Bash Shell!"
USER_NAME="Developer"
echo "Người dùng: $USER_NAME"
pwd
date
echo "Đã thực thi script thành công."`,

  javascript: `// Thử nghiệm JavaScript tự do
const items = [10, 25, 40, 85, 120];
const doubled = items.map(n => n * 2);
console.log("Mảng gấp đôi:", doubled);

async function simulateApi() {
  console.log("Đang fetch dữ liệu giả lập...");
  return new Promise(resolve => setTimeout(() => resolve({ status: 200, user: "Dev" }), 300));
}

simulateApi().then(res => console.log("Kết quả API:", res));`,

  typescript: `interface User {
  id: number;
  name: string;
  role: string;
}

const user: User = { id: 1, name: "Alice", role: "Fullstack Engineer" };
console.log("TypeScript user profile:", user);`,

  html: `<div style="font-family: system-ui; padding: 24px; background: #1e1b4b; color: white; border-radius: 12px; text-align: center;">
  <h2>🚀 Live Web Playground</h2>
  <p>Thử nghiệm HTML & CSS với render trực tiếp.</p>
  <button onclick="alert('Hello from DevNotes!')" style="padding: 8px 18px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
    Bấm thử
  </button>
</div>`,

  json: `{
  "app": "DevNotes",
  "version": "1.0.0",
  "supportedLanguages": [
    "csharp",
    "sql",
    "bash",
    "javascript",
    "typescript",
    "html",
    "json"
  ]
}`,

  css: `/* CSS playground */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,

  python: '',
  cpp: '',
};

export const SplitWorkspace: React.FC<SplitWorkspaceProps> = ({
  page,
  onUpdatePage,
  pinnedCode,
  onSaveSnippet,
  snippets,
}) => {
  const [savedCodes, setSavedCodes] = useState<Record<string, string>>(loadStudioCode);
  const [activeLang, setActiveLang] = useState<LanguageId>(() => {
    if (pinnedCode?.language && pinnedCode.language !== 'python' && pinnedCode.language !== 'cpp') {
      return pinnedCode.language;
    }
    const l = loadStudioLang();
    return (l === 'python' || l === 'cpp') ? 'csharp' : l;
  });

  // Track the snippet ID associated with the current code in Studio
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(() => {
    if (pinnedCode?.snippetId) return pinnedCode.snippetId;
    if (snippets && page) {
      const match = snippets.find((s) => s.pageId === page.id && s.language === activeLang);
      return match ? match.id : null;
    }
    return null;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'updated'>('idle');

  const [code, setCode] = useState<string>(() => {
    if (pinnedCode?.code) return pinnedCode.code;
    const stored = loadStudioCode();
    const l = activeLang;
    return stored[l] || DEFAULT_SANDBOX_CODES[l] || '';
  });

  const [output, setOutput] = useState<CodeOutput | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'console' | 'preview'>(() => {
    return activeLang === 'html' ? 'preview' : 'console';
  });

  const [isRightPaneOpen, setIsRightPaneOpen] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(240); // in pixels
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isDraggingConsole, setIsDraggingConsole] = useState(false);

  const langPickerRef = useRef<HTMLDivElement>(null);
  const studioRightRef = useRef<HTMLDivElement>(null);

  // Close language menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // React to pinned code changes
  useEffect(() => {
    if (pinnedCode) {
      const validLang = (pinnedCode.language === 'python' || pinnedCode.language === 'cpp') ? 'csharp' : pinnedCode.language;
      setActiveLang(validLang);
      saveStudioLang(validLang);
      setCode(pinnedCode.code);
      const updated = { ...savedCodes, [validLang]: pinnedCode.code };
      setSavedCodes(updated);
      saveStudioCode(updated);
      setActiveSnippetId(pinnedCode.snippetId || null);
      setSaveStatus('idle');
    }
  }, [pinnedCode]);

  const handleLangChange = (lang: LanguageId) => {
    setActiveLang(lang);
    saveStudioLang(lang);
    const nextCode = savedCodes[lang] || DEFAULT_SANDBOX_CODES[lang] || '';
    setCode(nextCode);
    setOutput(null);
    setSaveStatus('idle');

    if (snippets && page) {
      const match = snippets.find((s) => s.pageId === page.id && s.language === lang);
      setActiveSnippetId(match ? match.id : null);
    } else {
      setActiveSnippetId(null);
    }

    if (lang === 'html') {
      setActiveViewTab('preview');
    } else {
      setActiveViewTab('console');
    }
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
    }
    const updated = { ...savedCodes, [activeLang]: val };
    setSavedCodes(updated);
    saveStudioCode(updated);
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeCode(activeLang, code);
      setOutput(res);
      if (activeLang === 'html') {
        setActiveViewTab('preview');
      } else {
        setActiveViewTab('console');
      }
    } catch (err: any) {
      setOutput({
        logs: [],
        error: err.message || 'Lỗi thực thi mã nguồn',
        timestamp: Date.now(),
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageExtension = (lang: LanguageId) => {
    switch (lang) {
      case 'csharp':
        return [StreamLanguage.define(csharp)];
      case 'bash':
        return [StreamLanguage.define(shell)];
      case 'sql':
        return [sql()];
      case 'javascript':
      case 'typescript':
        return [javascript({ jsx: true, typescript: lang === 'typescript' })];
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'json':
        return [json()];
      default:
        return [javascript()];
    }
  };

  const handleSaveToVault = () => {
    if (onSaveSnippet) {
      const isExisting = Boolean(activeSnippetId);
      const title = pinnedCode?.snippetTitle || `${page.title} — ${activeLang.toUpperCase()} Experiment`;
      const resId = onSaveSnippet(title, code, activeLang, activeSnippetId || undefined, page.id);
      if (resId) {
        setActiveSnippetId(resId);
      }
      setSaveStatus(isExisting ? 'updated' : 'saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    }
  };

  // Draggable Console Splitter
  const handleConsoleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingConsole(true);
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(500, Math.max(100, startHeight + deltaY));
      setConsoleHeight(newHeight);
      setIsConsoleCollapsed(false);
    };

    const onMouseUp = () => {
      setIsDraggingConsole(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const currentLangConfig = STUDIO_LANGUAGES.find((l) => l.id === activeLang) || STUDIO_LANGUAGES[0];

  return (
    <div className="split-studio-container">
      {/* Left Pane: Notion Lesson Viewer */}
      <div className={`studio-left-pane ${!isRightPaneOpen ? 'expanded' : ''}`}>
        <div style={{ padding: '8px 16px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Columns size={13} />
            <span>Lesson Notes (Tài liệu bài học)</span>
          </div>
          {!isRightPaneOpen && (
            <button
              className="macos-toolbar-btn"
              onClick={() => setIsRightPaneOpen(true)}
              title="Mở thanh Code Sandbox bên phải"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', fontSize: '0.74rem' }}
            >
              <PanelRightOpen size={13} color="var(--primary)" />
              <span>Mở Code Sandbox</span>
            </button>
          )}
        </div>
        <NotionEditor
          page={page}
          onUpdatePage={onUpdatePage}
          onSendToStudio={(c, l) => {
            const validLang = (l === 'python' || l === 'cpp') ? 'csharp' : l;
            setCode(c);
            setActiveLang(validLang);
            setIsRightPaneOpen(true);
          }}
        />
      </div>

      {/* Right Pane: Coding Sandbox Studio */}
      {isRightPaneOpen && (
        <div className="studio-right-pane" ref={studioRightRef}>
          {/* Studio Toolbar with compact Language Dropdown List */}
          <div className="studio-toolbar">
            <div className="studio-lang-picker-wrapper" ref={langPickerRef}>
              <button
                className="studio-lang-selector-btn"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                title="Chọn ngôn ngữ lập trình (Dạng danh sách)"
              >
                <span className="studio-lang-dot" style={{ backgroundColor: currentLangConfig.color }} />
                <span className="studio-lang-name">{currentLangConfig.label}</span>
                <span className="studio-lang-badge">{currentLangConfig.badge}</span>
                <ChevronDown size={13} className={`studio-lang-arrow ${isLangMenuOpen ? 'open' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="studio-lang-dropdown-menu">
                  <div className="studio-lang-dropdown-header">Ngôn ngữ hỗ trợ</div>
                  {STUDIO_LANGUAGES.map((item) => (
                    <button
                      key={item.id}
                      className={`studio-lang-menu-item ${activeLang === item.id ? 'active' : ''}`}
                      onClick={() => {
                        handleLangChange(item.id);
                        setIsLangMenuOpen(false);
                      }}
                    >
                      <span className="studio-lang-dot" style={{ backgroundColor: item.color }} />
                      <div className="studio-lang-item-content">
                        <span className="studio-lang-item-title">{item.label}</span>
                        <span className="studio-lang-item-desc">{item.desc}</span>
                      </div>
                      <span className="studio-lang-item-badge">{item.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {onSaveSnippet && (
                <button 
                  className="btn-secondary" 
                  onClick={handleSaveToVault} 
                  title={activeSnippetId ? 'Cập nhật lại snippet đã lưu trong Vault' : 'Lưu vào Kho Snippets'} 
                  style={{ 
                    padding: '4px 10px', 
                    fontSize: '0.76rem',
                    backgroundColor: saveStatus !== 'idle' ? 'rgba(16, 185, 129, 0.15)' : undefined,
                    borderColor: saveStatus !== 'idle' ? '#10b981' : undefined,
                    color: saveStatus !== 'idle' ? '#10b981' : undefined,
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  {saveStatus === 'saved' ? (
                    <>
                      <Check size={13} color="#10b981" />
                      <span style={{ fontWeight: 600 }}>Đã lưu vào Vault ✓</span>
                    </>
                  ) : saveStatus === 'updated' ? (
                    <>
                      <Check size={13} color="#10b981" />
                      <span style={{ fontWeight: 600 }}>Đã cập nhật ✓</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={13} />
                      <span>{activeSnippetId ? 'Cập nhật Snippet' : 'Lưu Snippet'}</span>
                    </>
                  )}
                </button>
              )}

              <button 
                className="btn-primary" 
                onClick={handleRun} 
                disabled={isRunning} 
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
              >
                {isRunning ? <RefreshCw size={13} className="spin-animation" /> : <Play size={13} fill="currentColor" />}
                <span>{isRunning ? 'Running...' : 'Chạy Code'}</span>
              </button>

              <button
                className="macos-toolbar-btn"
                onClick={() => setIsRightPaneOpen(false)}
                title="Thu gọn khung Sandbox bên phải"
                style={{ padding: '4px', marginLeft: 2 }}
                aria-label="Collapse right studio pane"
              >
                <PanelRightClose size={13} />
              </button>
            </div>
          </div>

          {/* Unified Dark Code Editor Container (No White Gap) */}
          <div className="studio-editor-area">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={getLanguageExtension(activeLang)}
              onChange={handleCodeChange}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                autocompletion: true,
              }}
            />
          </div>

          {/* Draggable Resizer Bar between Editor and Console */}
          <div 
            className={`studio-console-resizer ${isDraggingConsole ? 'dragging' : ''}`}
            onMouseDown={handleConsoleResizeStart}
            title="Kéo lên/xuống để điều chỉnh độ cao Console"
          >
            <div className="console-resizer-line" />
            <div className="console-resizer-handle">
              <GripHorizontal size={12} />
            </div>
          </div>

          {/* Output Tabs & View (Adjustable Height) */}
          <div 
            className="studio-console-pane"
            style={{ height: isConsoleCollapsed ? 34 : consoleHeight }}
          >
            <div className="studio-console-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className={`studio-tab ${activeViewTab === 'console' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveViewTab('console');
                    setIsConsoleCollapsed(false);
                  }}
                  style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                >
                  <Terminal size={12} />
                  <span>Console Output</span>
                </button>
                {activeLang === 'html' && (
                  <button
                    className={`studio-tab ${activeViewTab === 'preview' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveViewTab('preview');
                      setIsConsoleCollapsed(false);
                    }}
                    style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                  >
                    <Eye size={12} />
                    <span>Web Live Preview</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {output?.executionTimeMs !== undefined && (
                  <span style={{ color: '#10b981', fontSize: '0.72rem' }}>
                    ⚡ {output.executionTimeMs}ms
                  </span>
                )}
                <button 
                  className="icon-btn-ghost" 
                  onClick={() => setOutput(null)} 
                  title="Xóa output"
                  style={{ padding: 2 }}
                >
                  <Trash size={12} />
                </button>
                <button
                  className="icon-btn-ghost"
                  onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                  title={isConsoleCollapsed ? 'Mở rộng Console' : 'Thu nhỏ Console'}
                  style={{ padding: 2 }}
                >
                  {isConsoleCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Console or Preview Body */}
            {!isConsoleCollapsed && (
              <div className="studio-console-body">
                {activeViewTab === 'preview' ? (
                  <iframe
                    title="Preview"
                    srcDoc={code}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: 'white',
                      borderRadius: 6,
                    }}
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {output ? (
                      <>
                        {output.logs.map((log, i) => (
                          <div key={i} className="console-log-row">{log}</div>
                        ))}
                        {output.returnValue && (
                          <div className="console-return-val">↳ Result: {output.returnValue}</div>
                        )}
                        {output.error && (
                          <div className="console-error-box">{output.error}</div>
                        )}
                        {output.tableData && (
                          <div className="sql-table-wrapper">
                            <table className="sql-table">
                              <thead>
                                <tr>
                                  {output.tableData.columns.map((col, idx) => (
                                    <th key={idx}>{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {output.tableData.rows.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((val, cIdx) => (
                                      <td key={cIdx}>{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                        Nhấn "Chạy Code" để xem kết quả console hoặc truy vấn dữ liệu...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
