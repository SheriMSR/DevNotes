import type { CodeOutput } from '../../types';

export async function runJavaScript(code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  const stringify = (arg: unknown): string => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  const customConsole = {
    log: (...args: unknown[]) => logs.push(args.map(stringify).join(' ')),
    info: (...args: unknown[]) => logs.push('ℹ ' + args.map(stringify).join(' ')),
    warn: (...args: unknown[]) => logs.push('⚠ ' + args.map(stringify).join(' ')),
    error: (...args: unknown[]) => logs.push('✖ ' + args.map(stringify).join(' ')),
  };

  try {
    // Execute inside an async function with captured console
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('console', code);
    const result = await fn(customConsole);

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    
    return {
      logs,
      returnValue: result !== undefined ? stringify(result) : undefined,
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (err: unknown) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return {
      logs,
      error: errorMsg,
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
