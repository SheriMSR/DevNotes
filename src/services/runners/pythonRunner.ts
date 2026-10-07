import type { CodeOutput } from '../../types';

// Declare global Pyodide types
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
    initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<any>;
    sqlJsInstance?: any;
  }
}

let pyodidePromise: Promise<any> | null = null;

async function getPyodide(): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (typeof window.loadPyodide === 'function') {
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
        });
        window.pyodideInstance = pyodide;
        return pyodide;
      }
      throw new Error('Pyodide script chưa tải xong');
    })();
  }

  return pyodidePromise;
}

export async function runPython(code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    const pyodide = await getPyodide();
    
    // Set up stdout/stderr redirection
    pyodide.setStdout({
      batched: (text: string) => {
        if (text.trim()) logs.push(text);
      },
    });
    
    pyodide.setStderr({
      batched: (text: string) => {
        if (text.trim()) logs.push('⚠ ' + text);
      },
    });

    const result = await pyodide.runPythonAsync(code);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      logs,
      returnValue: result !== undefined && result !== null ? String(result) : undefined,
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (wasmErr: any) {
    // If Pyodide fails or is offline, try fallback via Piston API
    try {
      const resp = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{ content: code }],
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
        const out = data.run?.stdout?.trim();
        const err = data.run?.stderr?.trim();
        if (out) logs.push(...out.split('\n'));
        return {
          logs,
          error: err || undefined,
          executionTimeMs,
          timestamp: Date.now(),
        };
      }
    } catch {
      // ignore
    }

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      logs,
      error: wasmErr?.message || String(wasmErr),
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
