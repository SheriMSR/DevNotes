import type { CodeOutput } from '../../types';

export async function runPiston(language: string, code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  const langMap: Record<string, { lang: string; version: string }> = {
    cpp: { lang: 'c++', version: '10.2.0' },
    typescript: { lang: 'typescript', version: '5.0.3' },
  };

  const target = langMap[language] || { lang: language, version: '*' };

  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: target.lang,
        version: target.version,
        files: [{ content: code }],
      }),
    });

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (!res.ok) {
      throw new Error(`Piston API returned error status ${res.status}`);
    }

    const data = await res.json();
    const stdout = data.run?.stdout;
    const stderr = data.run?.stderr;

    if (stdout) {
      logs.push(...stdout.trimEnd().split('\n'));
    }

    return {
      logs,
      error: stderr?.trim() || undefined,
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      logs,
      error: `Execution error: ${err?.message || err}`,
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
