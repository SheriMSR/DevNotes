import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { sql } from '@codemirror/lang-sql';
import { StreamLanguage } from '@codemirror/language';
import { csharp } from '@codemirror/legacy-modes/mode/clike';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, Copy, Check, Terminal, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import type { LanguageId, CodeOutput } from '../../types';
import { executeCode } from '../../services/multiLanguageService';

interface ExecutableCodeBlockProps {
  id: string;
  initialCode: string;
  initialLanguage?: LanguageId;
  initialOutput?: CodeOutput;
  onCodeChange?: (newCode: string) => void;
  onLanguageChange?: (newLang: LanguageId) => void;
  onOutputChange?: (output: CodeOutput | null) => void;
  onSendToStudio?: (code: string, language: LanguageId) => void;
  onDeleteBlock?: () => void;
}

export const ExecutableCodeBlock: React.FC<ExecutableCodeBlockProps> = ({
  initialCode,
  initialLanguage = 'javascript',
  initialOutput,
  onCodeChange,
  onLanguageChange,
  onOutputChange,
  onSendToStudio,
  onDeleteBlock,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<LanguageId>(initialLanguage);
  const [output, setOutput] = useState<CodeOutput | null>(initialOutput || null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync if initialCode or initialOutput changes from parent
  React.useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  React.useEffect(() => {
    if (initialOutput) setOutput(initialOutput);
  }, [initialOutput]);

  // Get CodeMirror language extension
  const getLanguageExtension = (lang: LanguageId) => {
    switch (lang) {
      case 'csharp':
        return [StreamLanguage.define(csharp)];
      case 'sql':
        return [sql()];
      case 'bash':
        return [StreamLanguage.define(shell)];
      case 'javascript':
      case 'typescript':
        return [javascript({ jsx: true, typescript: lang === 'typescript' })];
      case 'html':
        return [html()];
      case 'json':
        return [json()];
      default:
        return [javascript()];
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeCode(language, code);
      setOutput(res);
      onOutputChange?.(res);
    } catch (err: any) {
      const errOut: CodeOutput = {
        logs: [],
        error: err.message || 'Lỗi không xác định khi chạy code',
        timestamp: Date.now(),
      };
      setOutput(errOut);
      onOutputChange?.(errOut);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLangSelect = (newLang: LanguageId) => {
    setLanguage(newLang);
    onLanguageChange?.(newLang);
  };

  return (
    <div className="executable-code-card">
      {/* Code Header Bar */}
      <div className="code-card-header">
        <div className="lang-badge">
          <span className={`lang-dot ${language}`} />
          <select 
            value={language} 
            onChange={(e) => handleLangSelect(e.target.value as LanguageId)}
            style={{ 
              background: 'transparent', 
              color: 'inherit', 
              fontWeight: 600, 
              cursor: 'pointer',
              border: 'none',
              fontSize: '0.8rem'
            }}
          >
            <option value="csharp" style={{ background: '#1e293b' }}>C# (.NET)</option>
            <option value="sql" style={{ background: '#1e293b' }}>SQL (SQLite)</option>
            <option value="bash" style={{ background: '#1e293b' }}>Bash / Shell</option>
            <option value="javascript" style={{ background: '#1e293b' }}>JavaScript</option>
            <option value="typescript" style={{ background: '#1e293b' }}>TypeScript</option>
            <option value="html" style={{ background: '#1e293b' }}>HTML / CSS</option>
            <option value="json" style={{ background: '#1e293b' }}>JSON</option>
          </select>
        </div>

        <div className="code-card-actions">
          {onSendToStudio && (
            <button 
              className="btn-send-studio" 
              onClick={() => onSendToStudio(code, language)}
              title="Ghim đoạn code này sang Playground bên phải để thử nghiệm sâu hơn"
            >
              <ExternalLink size={13} />
              <span>Ghim sang Studio</span>
            </button>
          )}

          <button className="icon-btn-ghost" onClick={handleCopy} title="Copy code">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>

          {onDeleteBlock && (
            <button className="icon-btn-ghost" onClick={onDeleteBlock} title="Xóa block">
              <Trash2 size={14} />
            </button>
          )}

          <button 
            className="btn-run-code" 
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? <RefreshCw size={13} className="spin-animation" /> : <Play size={13} fill="currentColor" />}
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* CodeMirror Editor */}
      <CodeMirror
        value={code}
        height="auto"
        minHeight="80px"
        maxHeight="420px"
        theme={oneDark}
        extensions={getLanguageExtension(language)}
        onChange={(val) => {
          setCode(val);
          onCodeChange?.(val);
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          autocompletion: true,
        }}
      />

      {/* Console Output Panel */}
      {output && (
        <div className="code-console-panel">
          <div className="console-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Terminal size={12} />
              <span>Console Output</span>
            </div>
            {output.executionTimeMs !== undefined && (
              <span style={{ color: '#10b981', fontSize: '0.72rem' }}>
                ⚡ {output.executionTimeMs}ms
              </span>
            )}
          </div>

          {output.logs.length > 0 && output.logs.map((log, i) => (
            <div key={i} className="console-log-row">
              {log}
            </div>
          ))}

          {output.returnValue && (
            <div className="console-return-val">
              ↳ Result: {output.returnValue}
            </div>
          )}

          {output.error && (
            <div className="console-error-box">
              {output.error}
            </div>
          )}

          {/* Render Table for SQL outputs */}
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
        </div>
      )}
    </div>
  );
};
