import React, { useState } from 'react';
import type { Snippet, LanguageId } from '../../types';
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
import { 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Code2,
  Edit3
} from 'lucide-react';

interface SnippetsVaultProps {
  snippets: Snippet[];
  onUpdateSnippets: (snippets: Snippet[]) => void;
  onSendToStudio?: (code: string, language: LanguageId, snippetId?: string, snippetTitle?: string) => void;
}

const VAULT_LANG_FILTERS = [
  { id: 'all', label: 'TẤT CẢ' },
  { id: 'csharp', label: 'C#' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'BASH' },
  { id: 'javascript', label: 'JS' },
  { id: 'typescript', label: 'TS' },
  { id: 'html', label: 'HTML' },
  { id: 'json', label: 'JSON' },
];

export const SnippetsVault: React.FC<SnippetsVaultProps> = ({
  snippets,
  onUpdateSnippets,
  onSendToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState<LanguageId>('csharp');
  const [newCode, setNewCode] = useState('');
  const [newTags, setNewTags] = useState('');

  const filteredSnippets = snippets.filter((s) => {
    const matchesLang = selectedLang === 'all' || s.language === selectedLang;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesQuery;
  });

  const handleCopy = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    onUpdateSnippets(snippets.filter((s) => s.id !== id));
  };

  const handleStartAdd = () => {
    setEditingSnippet(null);
    setNewTitle('');
    setNewDesc('');
    setNewLang('csharp');
    setNewCode('');
    setNewTags('');
    setIsAdding(true);
  };

  const handleStartEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setNewTitle(snippet.title);
    setNewDesc(snippet.description || '');
    setNewLang(snippet.language);
    setNewCode(snippet.code);
    setNewTags(snippet.tags ? snippet.tags.join(', ') : '');
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingSnippet(null);
    setNewTitle('');
    setNewDesc('');
    setNewCode('');
    setNewTags('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingSnippet) {
      const updated = snippets.map((s) =>
        s.id === editingSnippet.id
          ? {
              ...s,
              title: newTitle,
              description: newDesc,
              language: newLang,
              code: newCode,
              tags: tagsArray.length > 0 ? tagsArray : [newLang.toUpperCase()],
              updatedAt: Date.now(),
            }
          : s
      );
      onUpdateSnippets(updated);
    } else {
      const created: Snippet = {
        id: 'snip-' + Math.random().toString(36).substring(2, 9),
        title: newTitle,
        description: newDesc,
        language: newLang,
        code: newCode,
        tags: tagsArray.length > 0 ? tagsArray : [newLang.toUpperCase()],
        createdAt: Date.now(),
      };
      onUpdateSnippets([created, ...snippets]);
    }

    handleCancelForm();
  };

  // Export to VS Code Snippets JSON
  const handleExportVSCodeSnippets = () => {
    const vsCodeFormat: Record<string, any> = {};

    snippets.forEach((s) => {
      const prefix = s.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      vsCodeFormat[s.title] = {
        prefix,
        body: s.code.split('\n'),
        description: `${s.description} (Từ DevNotes)`,
      };
    });

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vsCodeFormat, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'devnotes.code-snippets');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Code2 size={24} color="#6366f1" />
            <span>Kho Đoạn Code (Snippet Vault)</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Lưu trữ, chỉnh sửa và xuất trực tiếp thành VS Code Snippets cho công việc thực tế.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={handleExportVSCodeSnippets} title="Tải file .code-snippets để dùng ngay trong VS Code">
            <Download size={14} />
            <span>Xuất VS Code Snippets</span>
          </button>

          <button className="btn-primary" onClick={handleStartAdd}>
            <Plus size={14} />
            <span>Thêm Snippet mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', flex: 1, minWidth: 240 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tags..."
            style={{ width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {VAULT_LANG_FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedLang(item.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedLang === item.id ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedLang === item.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal / Form thêm hoặc chỉnh sửa snippet */}
      {isAdding && (
        <form onSubmit={handleSaveForm} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24, boxShadow: 'var(--shadow-md)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingSnippet ? <Edit3 size={16} color="#6366f1" /> : <Plus size={16} color="#6366f1" />}
            <span>{editingSnippet ? 'Chỉnh Sửa Snippet' : 'Tạo Snippet Mới'}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tiêu đề snippet (ví dụ: LINQ Group By Query)..."
              style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem' }}
            />
            <select
              value={newLang}
              onChange={(e) => setNewLang(e.target.value as LanguageId)}
              style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem' }}
            >
              <option value="csharp">C# (.NET)</option>
              <option value="sql">SQL (Database)</option>
              <option value="bash">Bash (Shell)</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML & CSS</option>
              <option value="json">JSON Data</option>
            </select>
          </div>
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Mô tả công dụng ngắn gọn..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem', marginBottom: 12 }}
          />
          <textarea
            required
            rows={6}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Nội dung mã code..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.84rem', fontFamily: 'var(--font-mono)', marginBottom: 12, resize: 'vertical' }}
          />
          <input
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags cách nhau bởi dấu phẩy (vd: C#, LINQ, Collections)..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem', marginBottom: 16 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={handleCancelForm}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {editingSnippet ? 'Lưu Thay Đổi' : 'Lưu Snippet'}
            </button>
          </div>
        </form>
      )}

      {/* Snippet Cards Grid */}
      <div className="snippets-grid" style={{ padding: 0 }}>
        {filteredSnippets.map((snippet) => (
          <div key={snippet.id} className="snippet-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="tag-pill" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                <span className={`lang-dot ${snippet.language}`} style={{ marginRight: 4 }} />
                {snippet.language}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="icon-btn-ghost"
                  onClick={() => handleStartEdit(snippet)}
                  title="Chỉnh sửa snippet"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="icon-btn-ghost"
                  onClick={() => handleCopy(snippet)}
                  title="Copy code"
                >
                  {copiedId === snippet.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
                <button
                  className="icon-btn-ghost"
                  onClick={() => handleDelete(snippet.id)}
                  title="Xóa snippet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{snippet.title}</h3>
            {snippet.description && (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {snippet.description}
              </p>
            )}

            <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <CodeMirror
                value={snippet.code}
                readOnly
                height="auto"
                maxHeight="160px"
                theme={oneDark}
                extensions={getLanguageExtension(snippet.language)}
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {snippet.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    #{tag}
                  </span>
                ))}
              </div>

              {onSendToStudio && (
                <button
                  className="btn-send-studio"
                  onClick={() => onSendToStudio(snippet.code, snippet.language, snippet.id, snippet.title)}
                  style={{ fontSize: '0.72rem' }}
                >
                  Mở trong Studio
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
