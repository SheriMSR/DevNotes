import type { LanguageId, CodeOutput } from '../types';
import { runJavaScript } from './runners/javascriptRunner';
import { runSQL } from './runners/sqlRunner';
import { runCSharp } from './runners/csharpRunner';
import { runBash } from './runners/bashRunner';

export async function executeCode(language: LanguageId, code: string): Promise<CodeOutput> {
  switch (language) {
    case 'csharp':
      return runCSharp(code);
    case 'sql':
      return runSQL(code);
    case 'bash':
      return runBash(code);
    case 'javascript':
    case 'typescript':
      return runJavaScript(code);
    case 'html':
    case 'css':
      return {
        logs: ['Web live preview updated.'],
        timestamp: Date.now(),
      };
    case 'json':
      try {
        const parsed = JSON.parse(code);
        return {
          logs: ['Valid JSON payload:', JSON.stringify(parsed, null, 2)],
          timestamp: Date.now(),
        };
      } catch (err: any) {
        return {
          logs: [],
          error: `Invalid JSON: ${err.message}`,
          timestamp: Date.now(),
        };
      }
    default:
      return runJavaScript(code);
  }
}
