/**
 * hook-handler.cjs side of the routing learning loop: post-agent capture,
 * the ESM-project router load, the flagged learned fallback, and tokenizer
 * parity with services/routing-outcome-store.ts.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { ROUTING_STOPWORDS, extractRoutingKeywords, storableRoutingKeywords } from '../src/services/routing-outcome-store.js';

const helpers = fileURLToPath(new URL('../.claude/helpers/', import.meta.url));
const handlerPath = join(helpers, 'hook-handler.cjs');
const handler = createRequire(import.meta.url)(handlerPath);

let project: string;
const env = { ...process.env };
beforeEach(() => {
  project = mkdtempSync(join(tmpdir(), 'ruflo-hookloop-'));
  delete process.env.CLAUDE_FLOW_CWD;
  delete process.env.CLAUDE_FLOW_ROUTER_LEARNED;
  delete process.env.CLAUDE_FLOW_ROUTER_LEARNED_MIN_SUPPORT;
  process.env.CLAUDE_PROJECT_DIR = project;
});
afterEach(() => {
  process.env = { ...env };
  rmSync(project, { recursive: true, force: true });
});

const store = () => join(project, '.claude-flow', 'routing-outcomes.json');
const agentCall = (over: Record<string, unknown> = {}) => ({
  hook_event_name: 'PostToolUse',
  tool_name: 'Agent',
  cwd: project,
  tool_input: { subagent_type: 'security-auditor', description: 'audit', prompt: 'Audit the auth module for injection. Token sk-live-123.' },
  tool_response: { content: [{ type: 'text', text: 'Fixed the error handling and found no injection.' }] },
  ...over,
});

describe('tokenizer parity with the TypeScript store', () => {
  it('uses the same stopwords and extraction', () => {
    expect([...handler.ROUTING_STOPWORDS].sort()).toEqual([...ROUTING_STOPWORDS].sort());
    for (const text of ['Refactor the Auth-Service; add JWT refresh!', 'write 3 unit tests for parser.ts', '', 'a an the', 'token sk-live-123 ghp_abcdefghijklmnopqrstuvwxyz0123 audit-log']) {
      expect(handler.extractRoutingKeywords(text)).toEqual(extractRoutingKeywords(text));
      expect(handler.storableRoutingKeywords(text)).toEqual(storableRoutingKeywords(text));
    }
  });
});

describe('post-agent capture', () => {
  it('records agent, keywords and a prompt hash, never the prompt text', () => {
    const row = handler.recordAgentOutcome(agentCall());
    expect(row).toMatchObject({ agent: 'security-auditor', outcome: 'unknown', success: false, source: 'hook' });
    const raw = readFileSync(store(), 'utf8');
    expect(raw).not.toContain('sk-live-123');
    expect(raw).not.toContain('Audit the auth module');
    expect(JSON.parse(raw).outcomes[0].keywords).toContain('injection');
  });

  it('does not read an error mentioned in prose as a failure', () => {
    expect(handler.recordAgentOutcome(agentCall()).outcome).toBe('unknown');
  });

  it('records a structured tool error as a failure', () => {
    const row = handler.recordAgentOutcome(agentCall({ tool_response: { is_error: true, content: 'boom' } }));
    expect(row).toMatchObject({ outcome: 'failure', signal: 'tool_error' });
  });

  it('rejects missing or malformed agent names and empty prompts', () => {
    expect(handler.recordAgentOutcome(agentCall({ tool_input: { prompt: 'x y z' } }))).toBeNull();
    expect(handler.recordAgentOutcome(agentCall({ tool_input: { subagent_type: '../evil', prompt: 'hi there' } }))).toBeNull();
    expect(handler.recordAgentOutcome(agentCall({ tool_input: { subagent_type: 'coder', prompt: '   ' } }))).toBeNull();
    expect(existsSync(store())).toBe(false);
  });

  it('accepts colon-namespaced plugin agents', () => {
    const row = handler.recordAgentOutcome(agentCall({ tool_input: { subagent_type: 'ruflo-core:reviewer', prompt: 'review the diff' } }));
    expect(row.agent).toBe('ruflo-core:reviewer');
  });

  it('skips rather than overwrites a store it cannot parse', () => {
    mkdirSync(join(project, '.claude-flow'), { recursive: true });
    writeFileSync(store(), '{corrupt');
    expect(handler.recordAgentOutcome(agentCall())).toBeNull();
    expect(readFileSync(store(), 'utf8')).toBe('{corrupt');
  });

  it('runs end to end as the PostToolUse hook and exits 0', () => {
    const res = spawnSync(process.execPath, [handlerPath, 'post-agent'], {
      input: JSON.stringify(agentCall()), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: project },
    });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('[LEARN] Agent outcome recorded (security-auditor: unknown)');
    expect(JSON.parse(readFileSync(store(), 'utf8')).outcomes).toHaveLength(1);
  });

  it('ignores non-agent tools', () => {
    const res = spawnSync(process.execPath, [handlerPath, 'post-agent'], {
      input: JSON.stringify(agentCall({ tool_name: 'Bash' })), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: project },
    });
    expect(res.stdout).toContain('not an agent call');
    expect(existsSync(store())).toBe(false);
  });
});

describe('learned fallback (opt-in)', () => {
  const writePatterns = (support: number) => {
    mkdirSync(join(project, '.claude-flow'), { recursive: true });
    writeFileSync(join(project, '.claude-flow', 'learned-patterns.json'), JSON.stringify({
      version: 1, outcomes: support, labelled: support,
      patterns: { 'learned-security-auditor': { keywords: ['injection', 'auth', 'audit'], agents: ['security-auditor'], source: 'learned', support, reliability: 0.9 } },
    }));
  };

  it('is off unless CLAUDE_FLOW_ROUTER_LEARNED is set', () => {
    writePatterns(50);
    expect(handler.learnedFallback('check auth for injection', project)).toBeNull();
  });

  it('ignores patterns below the support floor', () => {
    writePatterns(29);
    process.env.CLAUDE_FLOW_ROUTER_LEARNED = '1';
    expect(handler.learnedFallback('check auth for injection', project)).toBeNull();
  });

  it('returns the learned agent with enough support and keyword hits', () => {
    writePatterns(30);
    process.env.CLAUDE_FLOW_ROUTER_LEARNED = '1';
    expect(handler.learnedFallback('check auth for injection', project)).toMatchObject({ agent: 'security-auditor', hits: 2 });
    expect(handler.learnedFallback('rename a variable', project)).toBeNull();
  });
});

describe('router loading in an ESM project ("type": "module")', () => {
  const route = (withFlag: boolean, prompt: string) => {
    const dir = join(project, '.claude', 'helpers');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(project, 'package.json'), JSON.stringify({ type: 'module' }));
    copyFileSync(handlerPath, join(dir, 'hook-handler.cjs'));
    copyFileSync(join(helpers, 'router.js'), join(dir, 'router.js'));
    return spawnSync(process.execPath, [join(dir, 'hook-handler.cjs'), 'route'], {
      input: JSON.stringify({ prompt, cwd: project }), encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: project, ...(withFlag ? { CLAUDE_FLOW_ROUTER_LEARNED: '1' } : {}) },
    }).stdout;
  };

  it('loads router.js and routes instead of reporting "Router not available"', () => {
    const out = route(false, 'write unit tests for the parser');
    expect(out).not.toContain('Router not available');
    expect(out).toContain('Primary Recommendation');
  });

  it('uses a learned pattern only when the keyword router falls through', () => {
    mkdirSync(join(project, '.claude-flow'), { recursive: true });
    writeFileSync(join(project, '.claude-flow', 'learned-patterns.json'), JSON.stringify({
      version: 1, patterns: { 'learned-x': { keywords: ['zorbax', 'quuxifier'], agents: ['ruflo-core:reviewer'], support: 40, reliability: 1 } },
    }));
    expect(route(true, 'please zorbax the quuxifier')).toContain('Learned from 40 outcomes');
    expect(route(true, 'write unit tests for the parser')).not.toContain('Learned from');
  });
});

describe('init wiring', () => {
  it('generated settings run post-agent after every Agent/Task call', async () => {
    const { generateSettings } = await import('../src/init/settings-generator.js');
    const { DEFAULT_INIT_OPTIONS } = await import('../src/init/types.js');
    const settings = generateSettings(DEFAULT_INIT_OPTIONS) as { hooks: { PostToolUse: Array<{ matcher: string; hooks: Array<{ command: string }> }> } };
    const agentHook = settings.hooks.PostToolUse.find((h) => h.matcher === 'Task|Agent');
    expect(agentHook?.hooks[0]?.command).toMatch(/hook-handler\.cjs.*post-agent/);
  });

  it('the generator fallback handler loads helpers the same way (ESM-safe)', async () => {
    const { generateHookHandler } = await import('../src/init/helpers-generator.js');
    const src = generateHookHandler();
    expect(src).toContain('function loadCommonJs(modulePath)');
    expect(src).toContain(".cjs'");
  });
});
