/** Descriptive synthetic evidence, deliberately separate from promotion receipts.
 * Signing attests the supplied measurements/bindings, not their independent
 * review. Service adapters must establish current review and signing authority. */
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { canonicalizeJcs, sha256Ref } from './flywheel-receipt.js';
import { checkPairedOutcomesConsistency } from './flywheel-sequential-evidence.js';

export const EVALUATION_EVIDENCE_SCHEMA = 'ruflo.flywheel-evaluation-evidence/v1';
export const EVALUATION_EVIDENCE_DOMAIN = 'ruflo/flywheel-evaluation-evidence/v1';
export const EVALUATION_EVIDENCE_LIMITS = Object.freeze({ bytes: 65_536, tasks: 32, samples: 64,
  ttlMs: 300_000, wallMicros: 300_000_000 });

export interface EvaluationEvidenceBindings {
  reviewRef: string;
  scopeRef: string;
  planRef: string;
  corpusRef: string;
  baselineRef: string;
  candidateRef: string;
  baselineSourceRef: string;
  candidateSourceRef: string;
  verifierSourceRef: string;
  evaluatorSourceRef: string;
  baselineBuildRef: string;
  candidateBuildRef: string;
  dependencyClosureRef: string;
  safetyEnvelopeRef: string;
}
interface CorpusSplit { selectionTaskIds: string[]; heldOutTaskIds: string[] }
interface ScorePair { taskId: string; baselineScore: number; candidateScore: number }
interface EncodedPair { taskId: string; baselineScore: string; candidateScore: string }
interface Comparison {
  baselineMean: string;
  candidateMean: string;
  meanDelta: string;
  pairedOutcomes: EncodedPair[];
  heldOutDeltas: string[];
}
interface MeasuredResources {
  kind: 'measured_local_scored_execution';
  clock: 'monotonic';
  sampleCount: number;
  samplesMicros: number[];
  totalWallMicros: number;
  p95LatencyMicros: number;
  providerCostMicros: 0;
  providerTokens: 0;
  networkCalls: 0;
}
export interface FlywheelEvaluationEvidencePayload {
  schemaVersion: typeof EVALUATION_EVIDENCE_SCHEMA;
  evidenceId: string;
  evidenceKind: 'synthetic_fixture_comparison';
  trialAuthorized: false;
  evaluationRunId: string;
  signerKeyRef: string;
  bindings: EvaluationEvidenceBindings;
  corpus: CorpusSplit;
  comparison: Comparison;
  resources: MeasuredResources;
  issuedAt: string;
  expiresAt: string;
}
export interface FlywheelEvaluationEvidence {
  payload: FlywheelEvaluationEvidencePayload;
  signature: { algorithm: 'ed25519'; domain: typeof EVALUATION_EVIDENCE_DOMAIN;
    publicKeyPem: string; signatureBase64: string };
}
export interface CreateEvaluationEvidenceInput {
  evaluationRunId: string;
  bindings: EvaluationEvidenceBindings;
  corpus: CorpusSplit;
  pairedOutcomes: ScorePair[];
  /** Actual serial scored-execution measurements from the trusted adapter.
   * Each train/held-out task has two samples. Validation/signing is excluded.
   * Zero is allowed at the stated clock's microsecond resolution. */
  measurements: { clock: 'monotonic'; samplesMicros: number[]; totalWallMicros: number };
}
export interface EvaluationEvidenceSigningOptions {
  privateKeyPem: string;
  publicKeyPem: string;
  now: number;
  ttlMs: number;
}
export interface EvaluationEvidenceVerificationOptions {
  trustedPublicKeys: ReadonlySet<string>;
  expectedBindings: EvaluationEvidenceBindings;
  now: number;
}

const bindingFields = ['reviewRef', 'scopeRef', 'planRef', 'corpusRef', 'baselineRef', 'candidateRef',
  'baselineSourceRef', 'candidateSourceRef', 'verifierSourceRef', 'evaluatorSourceRef', 'baselineBuildRef',
  'candidateBuildRef', 'dependencyClosureRef', 'safetyEnvelopeRef'];
const payloadFields = ['schemaVersion', 'evidenceId', 'evidenceKind', 'trialAuthorized', 'evaluationRunId',
  'signerKeyRef', 'bindings', 'corpus', 'comparison', 'resources', 'issuedAt', 'expiresAt'];
function deny(): never { throw new Error('invalid_evaluation_evidence'); }
const exact = (v: unknown, keys: readonly string[]): v is Record<string, unknown> => v !== null
  && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === keys.length
  && keys.every(key => Object.hasOwn(v, key));
const ref = (v: unknown): v is string => typeof v === 'string' && /^sha256:[a-f0-9]{64}$/.test(v);
const id = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(v);
const integer = (v: unknown, max: number): v is number => Number.isSafeInteger(v) && Number(v) >= 0 && Number(v) <= max;
const decimal = (v: number): string => v.toFixed(12);
const hash = (v: unknown): string => sha256Ref(canonicalizeJcs(v));
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

/** Reject non-JSON/getter input before canonicalization or cryptographic work. */
function snapshot<T>(value: T): T {
  let nodes = 0, bytes = 0;
  const copy = (v: unknown, depth: number): unknown => {
    if (++nodes > 10_000 || depth > 8) deny();
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'string') { bytes += Buffer.byteLength(v); if (bytes > EVALUATION_EVIDENCE_LIMITS.bytes) deny(); return v; }
    if (typeof v === 'number' && Number.isFinite(v) && !Object.is(v, -0)) return v;
    if (typeof v !== 'object' || !v) deny();
    if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== Array.prototype) deny();
    if (Reflect.ownKeys(v).some(key => typeof key !== 'string')) deny();
    const descriptors = Object.getOwnPropertyDescriptors(v);
    if (Object.entries(descriptors).some(([key, d]) => !('value' in d)
      || (!d.enumerable && !(Array.isArray(v) && key === 'length')))) deny();
    if (Array.isArray(v)) {
      if (v.length > 128 || Object.keys(v).length !== v.length) deny();
      return v.map(child => copy(child, depth + 1));
    }
    return Object.fromEntries(Object.entries(v).map(([key, child]) => [key, copy(child, depth + 1)]));
  };
  const result = copy(value, 0);
  if (Buffer.byteLength(canonicalizeJcs(result)) > EVALUATION_EVIDENCE_LIMITS.bytes) deny();
  return result as T;
}
function validateBindings(value: unknown): asserts value is EvaluationEvidenceBindings {
  if (!exact(value, bindingFields) || !Object.values(value).every(ref)) deny();
}
function validateCorpus(value: CorpusSplit): void {
  if (!exact(value, ['selectionTaskIds', 'heldOutTaskIds']) || !Array.isArray(value.selectionTaskIds)
    || !Array.isArray(value.heldOutTaskIds) || value.selectionTaskIds.length < 2 || value.heldOutTaskIds.length < 2) deny();
  const ids = [...value.selectionTaskIds, ...value.heldOutTaskIds];
  if (ids.length > EVALUATION_EVIDENCE_LIMITS.tasks || !ids.every(id) || new Set(ids).size !== ids.length) deny();
}
function comparison(pairs: ScorePair[], corpus: CorpusSplit): Comparison {
  if (!Array.isArray(pairs) || pairs.length !== corpus.heldOutTaskIds.length) deny();
  const encoded = pairs.map((pair, index) => {
    if (!exact(pair, ['taskId', 'baselineScore', 'candidateScore']) || pair.taskId !== corpus.heldOutTaskIds[index]
      || typeof pair.baselineScore !== 'number' || typeof pair.candidateScore !== 'number'
      || !Number.isFinite(pair.baselineScore) || !Number.isFinite(pair.candidateScore)
      || pair.baselineScore < 0 || pair.baselineScore > 1 || pair.candidateScore < 0 || pair.candidateScore > 1) deny();
    return { taskId: pair.taskId, baselineScore: decimal(pair.baselineScore), candidateScore: decimal(pair.candidateScore) };
  });
  const numeric = encoded.map(pair => ({ taskId: pair.taskId,
    baselineScore: Number(pair.baselineScore), candidateScore: Number(pair.candidateScore) }));
  const deltas = numeric.map(pair => decimal(pair.candidateScore - pair.baselineScore));
  if (!checkPairedOutcomesConsistency(numeric, deltas.map(Number)).ok) deny();
  return { pairedOutcomes: encoded, heldOutDeltas: deltas,
    baselineMean: decimal(numeric.reduce((sum, p) => sum + p.baselineScore, 0) / numeric.length),
    candidateMean: decimal(numeric.reduce((sum, p) => sum + p.candidateScore, 0) / numeric.length),
    meanDelta: decimal(deltas.reduce((sum, d) => sum + Number(d), 0) / deltas.length) };
}
function resources(value: CreateEvaluationEvidenceInput['measurements'], corpus: CorpusSplit): MeasuredResources {
  if (!exact(value, ['clock', 'samplesMicros', 'totalWallMicros']) || value.clock !== 'monotonic'
    || !Array.isArray(value.samplesMicros) || value.samplesMicros.length !== 2 * (corpus.selectionTaskIds.length + corpus.heldOutTaskIds.length)
    || value.samplesMicros.length > EVALUATION_EVIDENCE_LIMITS.samples
    || !value.samplesMicros.every(n => integer(n, EVALUATION_EVIDENCE_LIMITS.wallMicros))
    || !integer(value.totalWallMicros, EVALUATION_EVIDENCE_LIMITS.wallMicros)
    || value.samplesMicros.reduce((sum, n) => sum + n, 0) > value.totalWallMicros) deny();
  const sorted = [...value.samplesMicros].sort((a, b) => a - b);
  return { kind: 'measured_local_scored_execution', clock: 'monotonic', samplesMicros: value.samplesMicros,
    totalWallMicros: value.totalWallMicros, sampleCount: sorted.length,
    p95LatencyMicros: sorted[Math.ceil(sorted.length * 0.95) - 1], providerCostMicros: 0, providerTokens: 0, networkCalls: 0 };
}
function signingBytes(payload: FlywheelEvaluationEvidencePayload): Buffer {
  return Buffer.concat([Buffer.from(EVALUATION_EVIDENCE_DOMAIN), Buffer.from([0]), Buffer.from(canonicalizeJcs(payload))]);
}
function keyDetails(pem: string) {
  if (typeof pem !== 'string' || pem.length > 4096) deny();
  const key = createPublicKey(pem);
  if (key.asymmetricKeyType !== 'ed25519') deny();
  return { key, ref: sha256Ref(key.export({ type: 'spki', format: 'der' })) };
}

/** No unsigned mode and no defaults for keys, time, TTL or measurement evidence.
 * The caller must establish independently reviewed current signing authority. */
export function createFlywheelEvaluationEvidence(input: CreateEvaluationEvidenceInput,
  options: EvaluationEvidenceSigningOptions): FlywheelEvaluationEvidence {
  input = snapshot(input);
  if (!exact(input, ['evaluationRunId', 'bindings', 'corpus', 'pairedOutcomes', 'measurements']) || !id(input.evaluationRunId)) deny();
  if (!exact(options, ['privateKeyPem', 'publicKeyPem', 'now', 'ttlMs'])
    || !integer(options.now, 8_640_000_000_000_000 - EVALUATION_EVIDENCE_LIMITS.ttlMs)
    || !integer(options.ttlMs, EVALUATION_EVIDENCE_LIMITS.ttlMs) || options.ttlMs < 1
    || typeof options.privateKeyPem !== 'string' || options.privateKeyPem.length > 4096) deny();
  validateBindings(input.bindings); validateCorpus(input.corpus);
  const publicKey = keyDetails(options.publicKeyPem);
  const privateKey = createPrivateKey(options.privateKeyPem);
  if (privateKey.asymmetricKeyType !== 'ed25519'
    || !createPublicKey(privateKey).export({ type: 'spki', format: 'der' }).equals(publicKey.key.export({ type: 'spki', format: 'der' }))) deny();
  const base: Omit<FlywheelEvaluationEvidencePayload, 'evidenceId'> = { schemaVersion: EVALUATION_EVIDENCE_SCHEMA, evidenceKind: 'synthetic_fixture_comparison' as const,
    trialAuthorized: false as const, evaluationRunId: input.evaluationRunId, signerKeyRef: publicKey.ref,
    bindings: input.bindings, corpus: input.corpus, comparison: comparison(input.pairedOutcomes, input.corpus),
    resources: resources(input.measurements, input.corpus), issuedAt: new Date(options.now).toISOString(),
    expiresAt: new Date(options.now + options.ttlMs).toISOString() };
  const payload = { ...base, evidenceId: hash(base) };
  return freeze({ payload, signature: { algorithm: 'ed25519', domain: EVALUATION_EVIDENCE_DOMAIN,
    publicKeyPem: options.publicKeyPem, signatureBase64: sign(null, signingBytes(payload), privateKey).toString('base64') } });
}

/** Descriptive evidence validity only. No result from this API authorizes work,
 * trial activation, policy selection or promotion. Trust/bindings must be fresh. */
export function verifyFlywheelEvaluationEvidence(value: unknown,
  options: EvaluationEvidenceVerificationOptions): { valid: boolean; errors: string[] } {
  try {
    const receipt = snapshot(value) as FlywheelEvaluationEvidence;
    if (!options || !integer(options.now, 8_640_000_000_000_000) || !options.trustedPublicKeys?.size) deny();
    validateBindings(options.expectedBindings);
    if (!exact(receipt, ['payload', 'signature']) || !exact(receipt.payload, payloadFields)
      || !exact(receipt.signature, ['algorithm', 'domain', 'publicKeyPem', 'signatureBase64'])) deny();
    const p = receipt.payload, s = receipt.signature;
    if (p.schemaVersion !== EVALUATION_EVIDENCE_SCHEMA || p.evidenceKind !== 'synthetic_fixture_comparison'
      || p.trialAuthorized !== false || !id(p.evaluationRunId) || !ref(p.evidenceId) || !ref(p.signerKeyRef)
      || s.algorithm !== 'ed25519' || s.domain !== EVALUATION_EVIDENCE_DOMAIN
      || !options.trustedPublicKeys.has(s.publicKeyPem)) deny();
    const issued = Date.parse(p.issuedAt), expiry = Date.parse(p.expiresAt);
    if (!Number.isFinite(issued) || !Number.isFinite(expiry) || new Date(issued).toISOString() !== p.issuedAt
      || new Date(expiry).toISOString() !== p.expiresAt || issued > options.now || expiry <= options.now
      || expiry - issued < 1 || expiry - issued > EVALUATION_EVIDENCE_LIMITS.ttlMs) deny();
    validateBindings(p.bindings); validateCorpus(p.corpus);
    if (canonicalizeJcs(p.bindings) !== canonicalizeJcs(options.expectedBindings)) deny();
    if (!exact(p.comparison, ['baselineMean', 'candidateMean', 'meanDelta', 'pairedOutcomes', 'heldOutDeltas'])
      || !Array.isArray(p.comparison.pairedOutcomes)) deny();
    const pairs = p.comparison.pairedOutcomes.map(pair => {
      if (!exact(pair, ['taskId', 'baselineScore', 'candidateScore']) || typeof pair.baselineScore !== 'string'
        || typeof pair.candidateScore !== 'string' || !/^[01]\.[0-9]{12}$/.test(pair.baselineScore)
        || !/^[01]\.[0-9]{12}$/.test(pair.candidateScore)) deny();
      return { taskId: pair.taskId, baselineScore: Number(pair.baselineScore), candidateScore: Number(pair.candidateScore) };
    });
    if (canonicalizeJcs(comparison(pairs, p.corpus)) !== canonicalizeJcs(p.comparison)) deny();
    if (!exact(p.resources, ['kind', 'clock', 'sampleCount', 'samplesMicros', 'totalWallMicros', 'p95LatencyMicros',
      'providerCostMicros', 'providerTokens', 'networkCalls'])) deny();
    if (canonicalizeJcs(resources({ clock: p.resources.clock, samplesMicros: p.resources.samplesMicros,
      totalWallMicros: p.resources.totalWallMicros }, p.corpus)) !== canonicalizeJcs(p.resources)) deny();
    const { evidenceId, ...base } = p;
    const key = keyDetails(s.publicKeyPem);
    if (key.ref !== p.signerKeyRef || hash(base) !== evidenceId || typeof s.signatureBase64 !== 'string'
      || s.signatureBase64.length !== 88) deny();
    const signature = Buffer.from(s.signatureBase64, 'base64');
    if (signature.length !== 64 || signature.toString('base64') !== s.signatureBase64
      || !verify(null, signingBytes(p), key.key, signature)) deny();
    return { valid: true, errors: [] };
  } catch { return { valid: false, errors: ['invalid_evaluation_evidence'] }; }
}
