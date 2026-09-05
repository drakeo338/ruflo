import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  canonicalProductPlaneBytes,
  identityKey,
  validateProductActionEnvelope,
  verifySignedProductActionEnvelope,
} from '../src/policy/product-plane.js';

const digest = `sha256:${'a'.repeat(64)}`;
const tenantRef = { namespace: 'ruclip-company' as const, id: 'T123/cognitum' };
const root = 'ruclip://workspaces/T123/companies/cognitum/humans/U123/';
function envelope(action = 'workforce.personal.request'): Record<string, unknown> {
  const consent = action === 'workforce.personal.consent';
  return {
    schemaVersion: 'cognitum.action.v1', eventId: 'event-1', issuer: 'slack', audience: 'ruclip',
    subject: { namespace: 'slack-user', id: 'T123/U123' }, tenantRef, action,
    resourceRefs: [root + (consent ? 'consent' : 'workflows/work-1')],
    requestDigest: digest, idempotencyKey: 'operation-1', correlationId: 'correlation-1',
    authoritativeSource: {
      authority: 'ruclip', tenantRef,
      sourceType: consent ? 'ruclip/personal-consent' : 'ruclip/personal-workflow',
      sourceId: 'source-1', sourceVersion: '1', sourceDigest: digest,
    },
    policyReceiptId: 'policy-1', capabilityId: 'capability-1',
    ...(consent ? { validationReceiptId: 'human-decision-1' } : {}),
    occurredAt: '2026-09-05T12:00:00.000Z', expiresAt: '2026-09-05T12:05:00.000Z', privacyClass: 'P1',
  };
}
const actions = ['request', 'read', 'cancel', 'consent'].map(a => `workforce.personal.${a}`);

describe('Slack/ruClip personal workforce profile', () => {
  it.each(actions)('accepts a bound %s with the existing envelope version', action => {
    expect(validateProductActionEnvelope(envelope(action)).ok).toBe(true);
  });

  it.each(actions)('requires every %s operation binding', action => {
    for (const field of ['requestDigest', 'idempotencyKey', 'expiresAt', 'capabilityId', 'policyReceiptId']) {
      const payload = envelope(action);
      delete payload[field];
      const result = validateProductActionEnvelope(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues).toContainEqual(expect.objectContaining({ path: `$.${field}`, code: 'missing' }));
    }
  });

  it('requires the exact consent decision receipt and consent resource kind', () => {
    const payload = envelope('workforce.personal.consent');
    delete payload.validationReceiptId;
    expect(validateProductActionEnvelope(payload).ok).toBe(false);
    expect(validateProductActionEnvelope({ ...envelope(), action: 'workforce.personal.consent', validationReceiptId: 'decision' }).ok).toBe(false);
  });

  it.each([
    { issuer: 'ruflo.policy' }, { issuer: 'slack.evil' }, { audience: 'meta-llm' },
    { action: 'workforce.personal.hire' }, { action: 'workforce.personal.request ' },
    { subject: { namespace: 'legacy-principal', id: 'T123/U123' } },
    { subject: { namespace: 'slack-user', id: 'T999/U123' } },
    { subject: { namespace: 'slack-user', id: 'U123' } },
    { subject: { namespace: 'slack-user', id: 'T123/U123\u2028' } },
    { tenantRef: { namespace: 'ruclip-company', id: 'T123/cognitum\u2029' } },
    { actor: { namespace: 'slack-user', id: 'T999/U123' } },
    { actor: { namespace: 'slack-user', id: 'T123/U999' } },
    { actor: { namespace: 'workload', id: 'slack' } },
    { tenantRef: { namespace: 'ruclip-company', id: 'T999/cognitum' } },
    { expiresAt: '2026-09-05T12:05:00.001Z' },
  ])('rejects malicious or ambiguous authority/identity bindings %j', override => {
    expect(validateProductActionEnvelope({ ...envelope(), ...override }).ok).toBe(false);
  });

  it.each([
    root.replace('T123', 'T999') + 'workflows/work-1',
    root.replace('U123', 'U999') + 'workflows/work-1',
    root.replace('cognitum', 'other') + 'workflows/work-1',
    root + 'workflows/../work-1', root + 'workflows/%77ork-1',
    root + 'workflows/work-1/extra', root + 'workflows/work-1?owner=U999',
    root + 'workflows/work-1\n', root + 'workflows/work-1\u2028',
    root + 'workflows/work-1#fragment', root + 'workflows/', root + 'consent',
  ])('rejects unscoped or ambiguous request resource %s', resource => {
    expect(validateProductActionEnvelope({ ...envelope(), resourceRefs: [resource] }).ok).toBe(false);
  });

  it('separates workspace identities and permits only the human owner and read collection', () => {
    expect(identityKey({ namespace: 'slack-user', id: 'T123/U123' }))
      .not.toBe(identityKey({ namespace: 'slack-user', id: 'T999/U123' }));
    expect(validateProductActionEnvelope({ ...envelope(), actor: { namespace: 'slack-user', id: 'T123/U123' } }).ok).toBe(true);
    expect(validateProductActionEnvelope({ ...envelope('workforce.personal.read'), resourceRefs: [root + 'workflows'] }).ok).toBe(true);
    expect(validateProductActionEnvelope({ ...envelope(), resourceRefs: [root + 'workflows'] }).ok).toBe(false);
    expect(validateProductActionEnvelope({ ...envelope(), resourceRefs: [root + 'workflows/work-1', root + 'workflows/work-2'] }).ok).toBe(false);
  });

  it('rejects wrong authoritative owners, source kinds and workspace references', () => {
    const base = envelope();
    for (const override of [
      { authority: 'slack', sourceType: 'slack/personal-workflow' },
      { sourceType: 'ruclip/personal-consent' },
      { tenantRef: { namespace: 'ruclip-company', id: 'T999/cognitum' } },
    ]) {
      expect(validateProductActionEnvelope({ ...base, authoritativeSource: { ...(base.authoritativeSource as object), ...override } }).ok).toBe(false);
    }
  });
});

describe('personal workforce local authority checks', () => {
  const keys = generateKeyPairSync('ed25519');
  function signed(payload: Record<string, unknown>) {
    return { envelope: payload, algorithm: 'Ed25519', keyId: 'slack-1',
      signature: sign(null, canonicalProductPlaneBytes(payload), keys.privateKey).toString('base64url') };
  }
  function options() {
    return {
      expectedAudience: 'ruclip' as const, expectedTenantRef: tenantRef,
      now: () => Date.parse('2026-09-05T12:01:00.000Z'),
      resolveKey: (issuer: string) => issuer === 'slack' ? keys.publicKey : undefined,
      policyVerifier: () => true, capabilityVerifier: () => true,
      replayStore: { reserve: () => 'reserved' as const },
    };
  }
  it('cannot substitute a signature or receipt ID for current local policy/grant checks', async () => {
    const payload = signed(envelope());
    expect(await verifySignedProductActionEnvelope(payload, { ...options(), policyVerifier: () => false }))
      .toMatchObject({ ok: false, code: 'policy_denied' });
    expect(await verifySignedProductActionEnvelope(payload, { ...options(), capabilityVerifier: () => false }))
      .toMatchObject({ ok: false, code: 'capability_denied' });
    expect(await verifySignedProductActionEnvelope(payload, { ...options(), expectedTenantRef: { ...tenantRef, id: 'T999/cognitum' } }))
      .toMatchObject({ ok: false, code: 'tenant_mismatch' });
    expect((await verifySignedProductActionEnvelope(payload, options())).ok).toBe(true);
  });
  it('requires adapter validation of a consent decision and permits a separately authorized self-consent capability', async () => {
    const payload = signed(envelope('workforce.personal.consent'));
    expect(await verifySignedProductActionEnvelope(payload, { ...options(), capabilityVerifier: e => e.validationReceiptId === 'verified-new-decision' }))
      .toMatchObject({ ok: false, code: 'capability_denied' });
    expect((await verifySignedProductActionEnvelope(payload, { ...options(), capabilityVerifier: e => e.action === 'workforce.personal.consent' && e.validationReceiptId === 'human-decision-1' })).ok).toBe(true);
  });
  it('binds canonical action and request digest to signature and replay identity', async () => {
    const payload = signed(envelope());
    payload.envelope.requestDigest = `sha256:${'b'.repeat(64)}`;
    expect(await verifySignedProductActionEnvelope(payload, options())).toMatchObject({ ok: false, code: 'signature_invalid' });
    const bindings = new Map<string, string>();
    const configured = { ...options(), replayStore: { reserve: ({ key, bindingDigest }: { key: string; bindingDigest: string }) => {
      const old = bindings.get(key);
      if (old) return old === bindingDigest ? 'replay' as const : 'conflict' as const;
      bindings.set(key, bindingDigest); return 'reserved' as const;
    } } };
    expect((await verifySignedProductActionEnvelope(signed(envelope()), configured)).ok).toBe(true);
    expect(await verifySignedProductActionEnvelope(signed(envelope()), configured)).toMatchObject({ ok: false, code: 'replay_detected' });
    expect(await verifySignedProductActionEnvelope(signed({ ...envelope(), requestDigest: `sha256:${'b'.repeat(64)}` }), configured))
      .toMatchObject({ ok: false, code: 'idempotency_conflict' });
  });
});
