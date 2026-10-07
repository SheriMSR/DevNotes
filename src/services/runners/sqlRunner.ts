import type { CodeOutput } from '../../types';

let sqlDb: any = null;

async function getSqlDb(): Promise<any> {
  if (sqlDb) return sqlDb;

  if (typeof window.initSqlJs === 'function') {
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
    });
    sqlDb = new SQL.Database();
    // Seed default sample data so user can query right away
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        role TEXT,
        points INTEGER
      );
      INSERT OR IGNORE INTO users VALUES 
        (1, 'Alice Dev', 'Frontend', 120),
        (2, 'Bob Code', 'Backend', 95),
        (3, 'Charlie AI', 'ML Engineer', 150);
    `);
    return sqlDb;
  }
  throw new Error('SQLite WASM chưa sẵn sàng');
}

export async function runSQL(code: string): Promise<CodeOutput> {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    const db = await getSqlDb();
    const results = db.exec(code);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (!results || results.length === 0) {
      logs.push('Query executed successfully (0 rows returned / DDL statement).');
      return {
        logs,
        executionTimeMs,
        timestamp: Date.now(),
      };
    }

    const firstResult = results[0];
    logs.push(`Query executed successfully: ${firstResult.values.length} row(s) returned.`);

    return {
      logs,
      tableData: {
        columns: firstResult.columns,
        rows: firstResult.values,
      },
      executionTimeMs,
      timestamp: Date.now(),
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      logs,
      error: err?.message || String(err),
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
