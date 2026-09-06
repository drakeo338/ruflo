import {generateKeyPairSync,sign} from 'node:crypto';
import {describe,expect,it} from 'vitest';
import {ACTION_AUTHORITIES,BUSINESS_BRIEFING_PROFILE as profile,PRODUCT_ACTION_REQUIREMENTS,
  canonicalProductPlaneBytes,validateProductActionEnvelope,verifySignedProductActionEnvelope} from '../src/policy/product-plane.js';

const digest=`sha256:${'a'.repeat(64)}`;
const subject={namespace:'slack-user',id:'T123/U123'};
const tenantRef={namespace:'ruclip-company' as const,id:'T123/company-1'};
const prefix='ruclip://workspaces/T123/companies/company-1/humans/U123/business-briefings/';
function envelope():Record<string,unknown>{
  return {schemaVersion:'cognitum.action.v1',eventId:'business-event',issuer:'slack',audience:'ruclip',subject,actor:subject,tenantRef,
    action:profile.action,resourceRefs:[prefix+'founder-1'],requestDigest:digest,idempotencyKey:'read-1',correlationId:'business-correlation',
    policyReceiptId:'current-business-policy',capabilityId:'business-read-capability',
    authoritativeSource:{authority:'ruclip',tenantRef,sourceType:profile.sourceType,sourceId:'business-read-capability',sourceVersion:'1',sourceDigest:digest},
    occurredAt:'2026-09-05T12:00:00.000Z',expiresAt:'2026-09-05T12:05:00.000Z',privacyClass:'P1'};
}
describe('private business briefing read reference profile',()=>{
  it('accepts a bound private human read and exports immutable shared constants',()=>{
    expect(validateProductActionEnvelope(envelope()).ok).toBe(true);
    expect(Object.isFrozen(profile)).toBe(true);
    expect(ACTION_AUTHORITIES[profile.action]).toEqual(['ruclip']);
    expect(PRODUCT_ACTION_REQUIREMENTS[profile.action]).toEqual({requestDigest:true,contentDigest:false,idempotencyKey:true,expiry:true,capability:true,validationReceipt:false});
  });
  it('requires all existing portable request, replay and authority obligations plus explicit self actor',()=>{
    for(const field of ['requestDigest','idempotencyKey','expiresAt','capabilityId','policyReceiptId','authoritativeSource','actor']){
      const value=envelope();delete value[field];expect(validateProductActionEnvelope(value).ok,field).toBe(false);
    }
  });
  it.each([
    {issuer:'ruclip'},{issuer:'meta-llm'},{audience:'slack'},
    {subject:{namespace:'slack-user',id:'T999/U123'}},
    {subject:{namespace:'slack-user',id:'U123'}},{subject:{namespace:'slack-user',id:'T123/ruv@example.test'}},
    {subject:{namespace:'workload',id:'T123/U123'}},{actor:{namespace:'slack-user',id:'T123/U999'}},
    {actor:{namespace:'workload',id:'T123/U123'}},{tenantRef:{namespace:'ruclip-company',id:'T999/company-1'}},
    {tenantRef:{namespace:'ruclip-company',id:'T123/company-2'}},{tenantRef:{namespace:'cognitum-tenant',id:'T123/company-1'}},
    {privacyClass:'P0'},{privacyClass:'P2'},{privacyClass:'P3'},
    {expiresAt:'2026-09-05T12:05:00.001Z'},{expiresAt:'2026-09-05T12:00:00.000Z'},
    {action:'workforce.business.briefing.write'},{action:'workforce.business.briefing.*'},
    {action:'workforce.business.consent'},{action:'workforce.business.briefing.read\n'},
    {role:'executive'},{ownerId:'other'},{sourceSlots:['financial.accounting']},
  ])('rejects cross-scope, authority, privacy and unknown vocabulary %j',changed=>{
    expect(validateProductActionEnvelope({...envelope(),...changed}).ok).toBe(false);
  });
  it.each(['*','..','profile/read','profile/','%70rofile','profile?source=all','profile#all','profile\n','profile\u2028','profile%2Fother','a'.repeat(129)])('rejects ambiguous profile resource %s',suffix=>{
    expect(validateProductActionEnvelope({...envelope(),resourceRefs:[prefix+suffix]}).ok).toBe(false);
  });
  it('accepts exact bounded profile IDs and rejects alternate prefixes/extra resources',()=>{
    for(const id of ['a','a_A-1','a'.repeat(128)])expect(validateProductActionEnvelope({...envelope(),resourceRefs:[prefix+id]}).ok).toBe(true);
    for(const part of ['T123','company-1','U123'])expect(validateProductActionEnvelope({...envelope(),resourceRefs:[prefix.replace(part,'other')+'founder-1']}).ok).toBe(false);
    expect(validateProductActionEnvelope({...envelope(),resourceRefs:[prefix+'founder-1',prefix+'founder-2']}).ok).toBe(false);
  });
  it('rejects source tenant/authority/kind confusion and business requests relabeled as own-issues, consent or promotion',()=>{
    const value=envelope();
    for(const changed of [{authority:'slack'},{authority:'ruflo.memory'},{sourceType:'ruclip/personal-workflow'},{sourceType:'ruclip/personal-consent'},
      {tenantRef:{...tenantRef,id:'T123/other'}}])expect(validateProductActionEnvelope({...value,authoritativeSource:{...(value.authoritativeSource as object),...changed}}).ok).toBe(false);
    for(const action of ['workforce.personal.request','workforce.personal.read','workforce.personal.consent','workforce.personal.notify','workforce.synthetic.trial.read','evolution.promote']){
      expect(validateProductActionEnvelope({...value,action}).ok,action).toBe(false);
    }
    expect(ACTION_AUTHORITIES['evolution.promote']).toEqual(['meta-llm']);
    expect(PRODUCT_ACTION_REQUIREMENTS['evolution.promote']).toEqual({requestDigest:true,contentDigest:false,idempotencyKey:true,expiry:true,capability:true,validationReceipt:false});
  });
});
describe('business read current adapter authority and replay boundary',()=>{
  const keys=generateKeyPairSync('ed25519');
  const signed=(value:Record<string,unknown>)=>({envelope:value,algorithm:'Ed25519',keyId:'reviewed-slack-key',signature:sign(null,canonicalProductPlaneBytes(value),keys.privateKey).toString('base64url')});
  const options=()=>({expectedAudience:'ruclip' as const,expectedTenantRef:tenantRef,now:()=>Date.parse('2026-09-05T12:01:00.000Z'),resolveKey:(issuer:string)=>issuer==='slack'?keys.publicKey:undefined,
    policyVerifier:(e:{policyReceiptId:string})=>e.policyReceiptId==='current-business-policy',
    capabilityVerifier:(e:{action:string;capabilityId?:string})=>e.action===profile.action&&e.capabilityId==='business-read-capability',replayStore:{reserve:()=> 'reserved' as const}});
  it('rejects valid signatures when current independent business authority is absent or revoked',async()=>{
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),policyVerifier:()=>false})).toMatchObject({ok:false,code:'policy_denied'});
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),capabilityVerifier:()=>false})).toMatchObject({ok:false,code:'capability_denied'});
    for(const capabilityId of ['executive','trusted-seed','own-issues-consent','business-read-capability-old']){
      expect(await verifySignedProductActionEnvelope(signed({...envelope(),capabilityId}),options())).toMatchObject({ok:false,code:'capability_denied'});
    }
  });
  it('requires real Ed25519 current keys, unchanged signed digest and unexpired read envelope',async()=>{
    const wrong=generateKeyPairSync('ed25519');
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),resolveKey:()=>wrong.publicKey})).toMatchObject({ok:false,code:'signature_invalid'});
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),resolveKey:()=>undefined})).toMatchObject({ok:false,code:'key_not_found'});
    const changed=signed(envelope());changed.envelope.requestDigest=`sha256:${'b'.repeat(64)}`;
    expect(await verifySignedProductActionEnvelope(changed,options())).toMatchObject({ok:false,code:'signature_invalid'});
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),now:()=>Date.parse('2026-09-05T12:05:00.000Z')})).toMatchObject({ok:false,code:'expired'});
  });
  it('denies exact replay and conflicting replay even for read-only work',async()=>{
    const seen=new Map<string,string>(),configured={...options(),replayStore:{reserve:({key,bindingDigest}:{key:string;bindingDigest:string})=>{
      const old=seen.get(key);if(old)return old===bindingDigest?'replay' as const:'conflict' as const;seen.set(key,bindingDigest);return 'reserved' as const;
    }}};
    expect((await verifySignedProductActionEnvelope(signed(envelope()),configured)).ok).toBe(true);
    expect(await verifySignedProductActionEnvelope(signed(envelope()),configured)).toMatchObject({ok:false,code:'replay_detected'});
    expect(await verifySignedProductActionEnvelope(signed({...envelope(),requestDigest:`sha256:${'b'.repeat(64)}`}),configured)).toMatchObject({ok:false,code:'idempotency_conflict'});
    expect((await verifySignedProductActionEnvelope(signed({...envelope(),eventId:'read-2',idempotencyKey:'read-2'}),configured)).ok).toBe(true);
  });
});
