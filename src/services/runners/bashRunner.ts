import type { CodeOutput } from '../../types';

export async function runBash(code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    const lines = code.split('\n');
    const variables: Record<string, string> = {
      USER: 'dev',
      HOME: '/home/dev',
      SHELL: '/bin/bash',
      OSTYPE: 'darwin',
      PWD: '/workspace/DevNotes',
    };

    const resolveVars = (str: string): string => {
      // Handle $((math))
      let result = str.replace(/\$\(\(\s*([^)]+?)\s*\)\)/g, (_m, expr) => {
        try {
          // eslint-disable-next-line no-eval
          return String(eval(expr));
        } catch {
          return '0';
        }
      });

      // Handle ${VAR} and $VAR
      result = result.replace(/\$\{?([a-zA-Z_]\w*)\}?/g, (_m, varName) => {
        return variables[varName] !== undefined ? variables[varName] : '';
      });

      return result;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Variable assignment: VAR=value or VAR="value"
      const assignMatch = line.match(/^([a-zA-Z_]\w*)=(.*)$/);
      if (assignMatch) {
        let val = assignMatch[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        variables[assignMatch[1]] = resolveVars(val);
        continue;
      }

      // echo command
      if (line.startsWith('echo ')) {
        let text = line.substring(5).trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
          text = text.slice(1, -1);
        }
        logs.push(resolveVars(text));
        continue;
      }

      // printf command
      if (line.startsWith('printf ')) {
        let text = line.substring(7).trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
          text = text.slice(1, -1);
        }
        logs.push(resolveVars(text).replace(/\\n/g, '\n'));
        continue;
      }

      // pwd
      if (line === 'pwd') {
        logs.push(variables.PWD);
        continue;
      }

      // date
      if (line.startsWith('date')) {
        logs.push(new Date().toString());
        continue;
      }

      // uname
      if (line.startsWith('uname')) {
        logs.push('Darwin DevNotes-MacBook 24.3.0 arm64');
        continue;
      }

      // ls
      if (line.startsWith('ls')) {
        logs.push('src/   public/   package.json   README.md   dist/   DevNotes.app');
        continue;
      }

      // Generic command simulation
      logs.push(`$ ${line}`);
    }

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      logs,
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      logs,
      error: `Bash Error: ${err.message || String(err)}`,
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
