import { describe, expect, it } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFlywheelEvaluationEvidence, verifyFlywheelEvaluationEvidence, EVALUATION_EVIDENCE_DOMAIN,
  EVALUATION_EVIDENCE_LIMITS, type CreateEvaluationEvidenceInput, type EvaluationEvidenceBindings } from '../src/services/flywheel-evaluation-evidence.js';
import { canonicalizeJcs, sha256Ref, createFlywheelReceipt, verifyFlywheelReceipt,
  type FlywheelEvaluationReceipt } from '../src/services/flywheel-receipt.js';
import { registerFlywheelReceipt, promoteFlywheelCandidate, readFlywheelTransactionState } from '../src/services/flywheel-transaction.js';

const now = 1_788_609_600_000;
function keys() {
  const pair = generateKeyPairSync('ed25519');
  return { publicKeyPem: pair.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateKeyPem: pair.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };
}
const key = keys();
function input(): CreateEvaluationEvidenceInput {
  const refs = ['reviewRef', 'scopeRef', 'planRef', 'corpusRef', 'baselineRef', 'candidateRef', 'baselineSourceRef',
    'candidateSourceRef', 'verifierSourceRef', 'evaluatorSourceRef', 'baselineBuildRef', 'candidateBuildRef', 'dependencyClosureRef', 'safetyEnvelopeRef'];
  return { evaluationRunId: 'synthetic-run-1', bindings: Object.fromEntries(refs.map(name => [name, sha256Ref(name)])) as unknown as EvaluationEvidenceBindings,
    corpus: { selectionTaskIds: ['train-a', 'train-b'], heldOutTaskIds: ['held-a', 'held-b'] },
    pairedOutcomes: [{ taskId: 'held-a', baselineScore: 0.75, candidateScore: 1 }, { taskId: 'held-b', baselineScore: 0.75, candidateScore: 1 }],
    measurements: { clock: 'monotonic', samplesMicros: [10, 20, 30, 40, 50, 60, 70, 80], totalWallMicros: 400 } };
}
const create = (value = input()) => createFlywheelEvaluationEvidence(value, { ...key, now, ttlMs: 60_000 });
const check = (receipt: unknown, overrides = {}) => verifyFlywheelEvaluationEvidence(receipt,
  { trustedPublicKeys: new Set([key.publicKeyPem]), expectedBindings: input().bindings, now, ...overrides });
// A trusted key can sign malformed data. Semantic validators must still reject
// it; these tests do not rely solely on an invalid content ID or signature.
function resign(receipt: ReturnType<typeof create>): ReturnType<typeof create> {
  const { evidenceId: _id, ...base } = receipt.payload;
  receipt.payload.evidenceId = sha256Ref(canonicalizeJcs(base));
  const bytes = Buffer.concat([Buffer.from(EVALUATION_EVIDENCE_DOMAIN), Buffer.from([0]), Buffer.from(canonicalizeJcs(receipt.payload))]);
  receipt.signature.signatureBase64 = sign(null, bytes, key.privateKeyPem).toString('base64');
  return receipt;
}

describe('evaluation-only synthetic evidence', () => {
  it('round-trips a real Ed25519 signature without acceptance or significance claims', () => {
    const receipt = create();
    expect(check(receipt)).toEqual({ valid: true, errors: [] });
    expect(receipt.payload.evidenceKind).toBe('synthetic_fixture_comparison');
    expect(receipt.payload.trialAuthorized).toBe(false);
    expect(receipt.payload.comparison).toMatchObject({ baselineMean: '0.750000000000', candidateMean: '1.000000000000', meanDelta: '0.250000000000' });
    expect(receipt.payload.resources).toMatchObject({ p95LatencyMicros: 80, sampleCount: 8, totalWallMicros: 400,
      providerTokens: 0, providerCostMicros: 0, networkCalls: 0 });
    const allKeys = (v: unknown): string[] => v && typeof v === 'object'
      ? Object.entries(v).flatMap(([name, child]) => [name, ...allKeys(child)]) : [];
    expect(allKeys(receipt)).not.toEqual(expect.arrayContaining(['accepted']));
    for (const forbidden of ['accepted', 'significant', 'promoted', 'decision', 'gates', 'statistics']) expect(allKeys(receipt)).not.toContain(forbidden);
  });

  it('recomputes descriptive scores from encoded pairs, including repeating fractions and negative deltas', () => {
    const value = input(); value.pairedOutcomes = [{ taskId: 'held-a', baselineScore: 1 / 3, candidateScore: 2 / 3 },
      { taskId: 'held-b', baselineScore: 1, candidateScore: 0 }];
    const receipt = create(value); expect(check(receipt).valid).toBe(true);
    expect(receipt.payload.comparison.heldOutDeltas).toEqual(['0.333333333334', '-1.000000000000']);
    expect(receipt.payload.comparison.meanDelta).toBe('-0.333333333333');
  });

  it('requires current exact bindings for every plan, scope, review, source, build and policy ref', () => {
    const receipt = create();
    for (const field of Object.keys(receipt.payload.bindings)) {
      const changed = { ...input().bindings, [field]: sha256Ref('other') };
      expect(check(receipt, { expectedBindings: changed }).valid).toBe(false);
      const forged = structuredClone(receipt);
      (forged.payload.bindings as unknown as Record<string, string>)[field] = sha256Ref('other');
      expect(check(resign(forged)).valid).toBe(false);
    }
  });

  it('rejects tampering and unknown or authority fields even with a recomputed valid signature', () => {
    const changes = [
      (r: any) => { r.extra = true; }, (r: any) => { r.payload.accepted = true; },
      (r: any) => { r.payload.trialAuthorized = true; }, (r: any) => { r.payload.bindings.roles = ['executive']; },
      (r: any) => { r.payload.comparison.significant = true; },
      (r: any) => { r.payload.comparison.pairedOutcomes[0].candidateScore = '0.500000000000'; },
      (r: any) => { r.payload.resources.p95LatencyMicros = 1; },
      (r: any) => { r.payload.resources.providerCostMicros = 1; },
      (r: any) => { r.payload.signature = 'nested'; },
      (r: any) => { r.signature.keyId = 'injected'; },
    ];
    for (const change of changes) { const altered = structuredClone(create()); change(altered); expect(check(resign(altered)).valid).toBe(false); }
  });

  it('rejects unknown, revoked, mismatched and wrong-type keys and requires a trust set', () => {
    const receipt = create(), other = keys();
    expect(check(receipt, { trustedPublicKeys: new Set([other.publicKeyPem]) }).valid).toBe(false);
    expect(check(receipt, { trustedPublicKeys: new Set() }).valid).toBe(false);
    expect(check(receipt, { trustedPublicKeys: undefined }).valid).toBe(false);
    expect(() => createFlywheelEvaluationEvidence(input(), { ...key, publicKeyPem: other.publicKeyPem, now, ttlMs: 10 })).toThrow();
    const ec = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const bad = { privateKeyPem: ec.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
      publicKeyPem: ec.publicKey.export({ type: 'spki', format: 'pem' }).toString() };
    expect(() => createFlywheelEvaluationEvidence(input(), { ...bad, now, ttlMs: 10 })).toThrow();
    const altered = structuredClone(receipt); altered.signature.publicKeyPem = bad.publicKeyPem;
    expect(check(altered, { trustedPublicKeys: new Set([bad.publicKeyPem]) }).valid).toBe(false);
  });

  it('enforces canonical times, expiry, future issuance and a bounded TTL after valid re-signing', () => {
    const receipt = create();
    expect(check(receipt, { now: now - 1 }).valid).toBe(false);
    expect(check(receipt, { now: now + 59_999 }).valid).toBe(true);
    expect(check(receipt, { now: now + 60_000 }).valid).toBe(false);
    expect(() => createFlywheelEvaluationEvidence(input(), { ...key, now, ttlMs: EVALUATION_EVIDENCE_LIMITS.ttlMs + 1 })).toThrow();
    for (const expiry of [new Date(now + 300_001).toISOString(), new Date(now).toISOString(), 'invalid']) {
      const altered = structuredClone(receipt); altered.payload.expiresAt = expiry; expect(check(resign(altered)).valid).toBe(false);
    }
  });

  it('rejects duplicated/disjoint split violations, missing pairs, out-of-range scores and invented timing summaries', () => {
    const alterations = [
      (v: any) => { v.corpus.heldOutTaskIds[0] = 'train-a'; },
      (v: any) => { v.corpus.selectionTaskIds[1] = 'train-a'; },
      (v: any) => { v.pairedOutcomes.pop(); },
      (v: any) => { v.pairedOutcomes[0].candidateScore = 2; },
      (v: any) => { v.pairedOutcomes[0].candidateScore = NaN; },
      (v: any) => { v.pairedOutcomes[0].taskId = 'other'; },
      (v: any) => { v.measurements.samplesMicros.pop(); },
      (v: any) => { v.measurements.samplesMicros[0] = -1; },
      (v: any) => { v.measurements.totalWallMicros = 1; },
      (v: any) => { v.measurements.clock = 'wall'; },
      (v: any) => { v.measurements = undefined; },
    ];
    for (const alter of alterations) { const value = input(); alter(value); expect(() => create(value)).toThrow(); }
  });

  it('snapshots inputs and deeply freezes output, rejecting getter/cyclic/oversized objects', () => {
    const value = input(), receipt = create(value);
    value.measurements.samplesMicros[0] = 999;
    expect(receipt.payload.resources.samplesMicros[0]).toBe(10);
    expect(Object.isFrozen(receipt.payload.bindings)).toBe(true);
    expect(() => { receipt.payload.comparison.meanDelta = 'changed'; }).toThrow();
    let calls = 0; Object.defineProperty(value, 'bindings', { enumerable: true, get() { calls++; return {}; } });
    expect(() => create(value)).toThrow(); expect(calls).toBe(0);
    const big = input(); big.evaluationRunId = 'x'.repeat(100_000); expect(() => create(big)).toThrow();
    const cycle: any = input(); cycle.bindings = cycle; expect(() => create(cycle)).toThrow();
  });

  it('cannot be verified, registered directly or promoted as an existing promotion receipt', async () => {
    const receipt = create();
    expect(verifyFlywheelReceipt(receipt as unknown as FlywheelEvaluationReceipt, new Set([key.publicKeyPem])).valid).toBe(false);
    const root = mkdtempSync(join(tmpdir(), 'synthetic-no-promotion-'));
    try {
      await expect(registerFlywheelReceipt(root, receipt as unknown as FlywheelEvaluationReceipt)).rejects.toThrow();
      // Even adding the legacy storage locator cannot turn this into authority.
      const legacyLocator = { ...receipt, payload: { ...receipt.payload, receiptId: receipt.payload.evidenceId } } as unknown as FlywheelEvaluationReceipt;
      await registerFlywheelReceipt(root, legacyLocator, now);
      let applied = 0;
      const result = await promoteFlywheelCandidate(root, receipt.payload.evidenceId,
        { confirm: true, now, trustedPublicKeys: new Set([key.publicKeyPem]),
          applyFn: () => { applied++; return { applied: true }; } });
      expect(result.success).toBe(false); expect(applied).toBe(0);
      const state = readFlywheelTransactionState(root);
      expect(state.activeChampionRef).toBeNull(); expect(state.servingEpoch).toBe(0); expect(state.commits).toEqual([]);
      const relabeled: any = structuredClone(legacyLocator); relabeled.payload.schemaVersion = 'ruflo.flywheel-receipt/v1';
      expect(verifyFlywheelReceipt(relabeled, new Set([key.publicKeyPem])).valid).toBe(false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it('keeps existing valid promotion receipt verification unchanged and rejects it as evaluation evidence', () => {
    const legacy = createFlywheelReceipt({ baselineRef: sha256Ref('baseline'), candidatePolicy: { alpha: 0.4 },
      safetyEnvelopeRef: sha256Ref('safety'), corpusVersion: 'fixture-v1', corpusHash: sha256Ref('corpus'),
      baselineScore: 0.75, candidateScore: 1, heldOutDeltas: [0.25, 0.25], frozenAnchorRegression: 0,
      gates: { example: true }, ...key, now, ttlMs: 60_000, bootstrapIterations: 100 });
    expect(verifyFlywheelReceipt(legacy, new Set([key.publicKeyPem])).valid).toBe(true);
    expect(check(legacy).valid).toBe(false);
  });
});
