import type { CodeOutput } from '../../types';

export async function runCSharp(code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    // Clean and transform common C# constructs to runnable JavaScript in-browser sandbox
    // Strip namespaces and class boilerplate if present
    let body = code;
    
    // Check if user wrapped in class/Main
    const mainMatch = code.match(/static\s+void\s+Main\s*\([^)]*\)\s*\{([\s\S]*)\}\s*\}?\s*$/);
    if (mainMatch) {
      body = mainMatch[1];
    } else {
      // Remove using directives and namespace/class declarations
      body = body
        .replace(/using\s+[\w.]+;\s*/g, '')
        .replace(/namespace\s+[\w.]+\s*\{?/g, '')
        .replace(/class\s+\w+\s*\{?/g, '');
    }

    // Transform C# Console methods
    body = body
      .replace(/Console\.WriteLine\s*\(([\s\S]*?)\);/g, 'console.log($1);')
      .replace(/Console\.Write\s*\(([\s\S]*?)\);/g, 'console.log($1);');

    // Transform C# string interpolation: $"Hello {name}" -> `Hello ${name}`
    body = body.replace(/\$"([^"]*)"/g, (_m, content) => {
      const replaced = content.replace(/\{([^}]+)\}/g, '${$1}');
      return `\`${replaced}\``;
    });

    // Transform C# List initialization: new List<int> { 1, 2, 3 } -> [ 1, 2, 3 ]
    body = body.replace(/new\s+List<[^>]+>\s*\{\s*([\s\S]*?)\s*\}/g, '[$1]');
    body = body.replace(/new\s+[a-zA-Z0-9_]+\[\]\s*\{\s*([\s\S]*?)\s*\}/g, '[$1]');

    // Transform simple C# LINQ methods
    body = body
      .replace(/\.Average\(\)/g, '.reduce((a, b) => a + b, 0) / (this?.length || 1)')
      .replace(/\.Sum\(\)/g, '.reduce((a, b) => a + b, 0)')
      .replace(/\.Count\(\)/g, '.length');

    // Replace C# type declarations: int x = 10; -> let x = 10;
    body = body.replace(/\b(int|string|bool|double|float|long|char|var|auto|decimal)\b\s+([a-zA-Z_]\w*)/g, 'let $2');
    
    // Replace C# foreach (var x in list) -> for (const x of list)
    body = body.replace(/foreach\s*\(\s*(?:var|[a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s+in\s+([^)]+)\)/g, 'for (const $1 of $2)');

    // Custom console to capture output
    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
    };

    // Run in isolated async function
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const runner = new AsyncFunction('console', body);
    await runner(customConsole);

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    
    if (logs.length === 0) {
      logs.push('C# program executed successfully (no Console.WriteLine output).');
    }

    return {
      logs,
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      logs,
      error: `C# Runtime/Syntax Error: ${err.message || String(err)}`,
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
