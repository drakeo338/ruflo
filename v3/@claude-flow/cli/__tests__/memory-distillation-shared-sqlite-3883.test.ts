/**
 * #3883 (follow-up to #3693): the distillation service opens memory.db
 * read-write, so it must construct its handle through shared-sqlite.ts (the
 * better-sqlite3 copy AgentDB resolves), not the CLI's own copy. Closing a
 * read-write handle from a different copy can delete the -wal/-shm sidecars of
 * a live AgentDB handle.
 *
 * Mock hermeticity: never queue two mock entries for one path (vitest applies
 * the queue in resolve-completion order, see graph-writer-shared-sqlite-3693);
 * setSharedSqliteMock() drains the queue between the unmock and the mock.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let Database: any;
let native = true;
try {
  Database = (await import('better-sqlite3')).default;
  new Database(':memory:').close();
} catch { native = false; }

const SHARED_SQLITE = '../src/memory/shared-sqlite.js';

async function setSharedSqliteMock(factory?: () => unknown) {
  vi.resetModules();
  vi.doUnmock(SHARED_SQLITE);
  await import(SHARED_SQLITE);
  vi.resetModules();
  if (factory) vi.doMock(SHARED_SQLITE, factory as never);
}

afterEach(async () => { await setSharedSqliteMock(); });

function seed(dbPath: string) {
  const db = new Database(dbPath);
  db.exec(`CREATE TABLE memory_entries (id TEXT PRIMARY KEY, key TEXT, namespace TEXT DEFAULT 'default',
    content TEXT, embedding TEXT, status TEXT DEFAULT 'active')`);
  db.close();
}

describe('#3883 memory-distillation opens memory.db through shared-sqlite', () => {
  it('constructs its read-write handle with the shared constructor', async () => {
    if (!native) return;
    const dir = mkdtempSync(join(tmpdir(), 'ruflo-3883-'));
    try {
      const dbPath = join(dir, 'memory.db');
      seed(dbPath);
      const opened: string[] = [];
      class Shared extends Database {
        constructor(p: string, o?: Record<string, unknown>) { super(p, o); opened.push(p); }
      }
      await setSharedSqliteMock(() => ({
        loadBetterSqlite3: async () => Shared,
        resolveAgentdbBetterSqlite3: () => Shared,
      }));
      const { runDistillation } = await import('../src/services/memory-distillation.js');
      await runDistillation({ dbPath, dryRun: true });
      expect(opened).toContain(dbPath);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('#3883 guard: no read-write better-sqlite3 open bypasses shared-sqlite.ts', () => {
  // Files that load better-sqlite3 directly. Each is read-only, or works on a
  // private temp copy / throwaway file that no live AgentDB handle points at.
  // A new entry here needs the same justification; otherwise use
  // loadBetterSqlite3() from memory/shared-sqlite.ts.
  const ALLOWED = new Map<string, string>([
    ['commands/doctor.ts', 'read-only diagnostics'],
    ['commands/memory-distill.ts', 'read-only'],
    ['memory/sibling-store.ts', 'read-only'],
    ['services/memory-backup.ts', 'read-only source + snapshot verification'],
    ['services/distill-tuning.ts', 'writes only to private temp copies'],
  ]);

  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (p.endsWith('.ts') && !p.endsWith('.d.ts')) out.push(p);
    }
    return out;
  }

  it('only allow-listed files import better-sqlite3 directly', () => {
    const src = join(__dirname, '..', 'src');
    const offenders: string[] = [];
    for (const f of walk(src)) {
      const rel = f.slice(src.length + 1);
      if (rel === 'memory/shared-sqlite.ts' || ALLOWED.has(rel)) continue;
      const text = readFileSync(f, 'utf8');
      const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      if (/(?:import\(|require\(|from\s+|mod(?::\s*string)?\s*=\s*)\s*['"]better-sqlite3['"]/.test(code)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });
});
