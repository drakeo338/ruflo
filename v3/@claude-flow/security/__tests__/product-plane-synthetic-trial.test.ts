import {generateKeyPairSync,sign} from 'node:crypto';
import {describe,expect,it} from 'vitest';
import {ACTION_AUTHORITIES,PRODUCT_ACTION_REQUIREMENTS,SYNTHETIC_TRIAL_PROFILE as profile,
  canonicalProductPlaneBytes,validateProductActionEnvelope,verifySignedProductActionEnvelope} from '../src/policy/product-plane.js';

const digest=`sha256:${'a'.repeat(64)}`;
const operations=['activate','run','read','rollback'] as const;
type Operation=typeof operations[number];
const subject={namespace:'workload',id:profile.subjectId};
const tenantRef={namespace:'ruclip-company' as const,id:profile.tenantId};
function envelope(operation:Operation='activate'):Record<string,unknown>{
  return {schemaVersion:'cognitum.action.v1',eventId:'synthetic-event',issuer:'ruclip',audience:'ruclip',subject,actor:subject,tenantRef,
    action:`workforce.synthetic.trial.${operation}`,resourceRefs:[profile.resourcePrefix+'trial-1/'+({activate:'activation',run:'runs/run-1',read:'status',rollback:'rollback'}[operation])],
    requestDigest:digest,idempotencyKey:'synthetic-operation',correlationId:'synthetic-correlation',policyReceiptId:'current-independent-policy',capabilityId:`trial-${operation}-capability`,
    authoritativeSource:{authority:'ruclip',tenantRef,sourceType:`ruclip/synthetic-trial-${operation}`,sourceId:'independent-trial-capability',sourceVersion:'1',sourceDigest:digest},
    ...(['activate','run'].includes(operation)?{validationReceiptId:'independently-reviewed-trial-approval'}:{}),
    occurredAt:'2026-09-05T12:00:00.000Z',expiresAt:'2026-09-05T12:05:00.000Z',privacyClass:'P0'};
}
describe('fixed synthetic trial envelope profile',()=>{
  it.each(operations)('accepts only the bound %s operation with unchanged v1 schema',operation=>{
    expect(validateProductActionEnvelope(envelope(operation)).ok).toBe(true);
  });
  it.each(operations)('requires every request/replay/expiry/authority binding for %s',operation=>{
    for(const field of ['requestDigest','idempotencyKey','expiresAt','capabilityId','policyReceiptId','authoritativeSource','actor']){
      const value=envelope(operation);delete value[field];expect(validateProductActionEnvelope(value).ok).toBe(false);
    }
  });
  it('requires independent approval reference for activation/run, without blocking separately authorized read/rollback',()=>{
    for(const operation of ['activate','run'] as const){const value=envelope(operation);delete value.validationReceiptId;expect(validateProductActionEnvelope(value).ok).toBe(false);}
    for(const operation of ['read','rollback'] as const)expect(validateProductActionEnvelope(envelope(operation)).ok).toBe(true);
  });
  it.each([
    {issuer:'slack'},{issuer:'meta-llm'},{issuer:'ruflo.policy'},{audience:'meta-llm'},
    {subject:{namespace:'slack-user',id:'T123/U123'}},{actor:{namespace:'slack-user',id:'T123/U123'}},
    {subject:{namespace:'cognitum-principal',id:profile.subjectId},actor:{namespace:'cognitum-principal',id:profile.subjectId}},
    {subject:{...subject,id:profile.subjectId.replace('synthetic-owner','other-owner')}},
    {actor:{...subject,id:profile.subjectId+'/other'}},
    {tenantRef:{...tenantRef,id:'other-workspace/synthetic-company'}},
    {tenantRef:{...tenantRef,id:'synthetic-workspace/other-company'}},
    {tenantRef:{namespace:'cognitum-tenant',id:profile.tenantId}},
    {expiresAt:'2026-09-05T12:05:00.001Z'},
    {expiresAt:'2026-09-05T12:00:00.000Z'},
    {action:'workforce.synthetic.trial.promote'},{action:'workforce.synthetic.trial.*'},
    {action:'workforce.personal.trial.activate'},{action:'workforce.synthetic.trial.activate\n'},
  ])('rejects authority, identity, tenant and action confusion %j',changed=>{
    expect(validateProductActionEnvelope({...envelope(),...changed}).ok).toBe(false);
  });
  it.each([
    '*','trial-1/*','../activation','trial-1/activation/extra','trial-1/activation?owner=other','trial-1/activation#fragment',
    '%74rial-1/activation','trial-1/%61ctivation','trial-1/activation\n','trial-1/activation\u2028','trial-1//activation',
    'trial-1/runs/*','trial-1/runs/..','trial-1/runs/run-1/extra','trial-1/runs/%72un-1',
  ])('rejects wildcard/path/encoding resources %s',suffix=>{
    expect(validateProductActionEnvelope({...envelope(suffix.includes('/runs/')?'run':'activate'),resourceRefs:[profile.resourcePrefix+suffix]}).ok).toBe(false);
  });
  it('rejects cross-scope prefixes, duplicate resources and action/source substitutions',()=>{
    for(const component of ['synthetic-workspace','synthetic-company','synthetic-owner']){
      const value=envelope();value.resourceRefs=[profile.resourcePrefix.replace(component,'other')+'trial-1/activation'];expect(validateProductActionEnvelope(value).ok).toBe(false);
    }
    const value=envelope();expect(validateProductActionEnvelope({...value,resourceRefs:[...(value.resourceRefs as string[]),profile.resourcePrefix+'trial-2/activation']}).ok).toBe(false);
    for(const from of operations)for(const to of operations)if(from!==to){
      expect(validateProductActionEnvelope({...envelope(from),action:`workforce.synthetic.trial.${to}`}).ok).toBe(false);
    }
    for(const changed of [{authority:'ruflo.policy'},{sourceType:'ruclip/personal-workflow'},{sourceType:'ruflo/evaluation-evidence'},{tenantRef:{...tenantRef,id:'other/company'}}]){
      expect(validateProductActionEnvelope({...value,authoritativeSource:{...(value.authoritativeSource as object),...changed}}).ok).toBe(false);
    }
  });
  it('keeps evolution.promote authority and obligations unchanged',()=>{
    expect(ACTION_AUTHORITIES['evolution.promote']).toEqual(['meta-llm']);
    expect(PRODUCT_ACTION_REQUIREMENTS['evolution.promote']).toEqual({requestDigest:true,contentDigest:false,idempotencyKey:true,expiry:true,capability:true,validationReceipt:false});
    const tenant={namespace:'meta-llm-account',id:'account-1'},value={...envelope(),issuer:'meta-llm',audience:'meta-llm',tenantRef:tenant,action:'evolution.promote',
      subject:{namespace:'meta-llm-account',id:'account-1'},actor:{namespace:'workload',id:'metallm/evolution'},resourceRefs:['meta-llm://evolution/candidate-1'],
      authoritativeSource:{authority:'meta-llm',tenantRef:tenant,sourceType:'meta-llm/evolution',sourceId:'candidate-1',sourceVersion:'1',sourceDigest:digest}};
    delete (value as Record<string,unknown>).validationReceiptId;expect(validateProductActionEnvelope(value).ok).toBe(true);
    expect(validateProductActionEnvelope({...envelope(),action:'evolution.promote'}).ok).toBe(false);
  });
});
describe('synthetic trial local authority boundary',()=>{
  const keys=generateKeyPairSync('ed25519');
  const signed=(value:Record<string,unknown>)=>({envelope:value,algorithm:'Ed25519',keyId:'configured-trial-issuer',signature:sign(null,canonicalProductPlaneBytes(value),keys.privateKey).toString('base64url')});
  const options=()=>({expectedAudience:'ruclip' as const,expectedTenantRef:tenantRef,now:()=>Date.parse('2026-09-05T12:01:00.000Z'),resolveKey:(issuer:string)=>issuer==='ruclip'?keys.publicKey:undefined,
    policyVerifier:(e:{policyReceiptId:string})=>e.policyReceiptId==='current-independent-policy',
    capabilityVerifier:(e:{action:string;capabilityId?:string;validationReceiptId?:string})=>{
      const operation=e.action.split('.').at(-1);return e.capabilityId===`trial-${operation}-capability`&&(['read','rollback'].includes(operation??'')||e.validationReceiptId==='independently-reviewed-trial-approval');
    },replayStore:{reserve:()=> 'reserved' as const}});
  it('does not turn an evaluation reference, valid signature or capability label into trial authority',async()=>{
    const value=envelope();value.validationReceiptId='evaluation-only-receipt';expect(validateProductActionEnvelope(value).ok).toBe(true); // reference syntax only
    expect(await verifySignedProductActionEnvelope(signed(value),options())).toMatchObject({ok:false,code:'capability_denied'});
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),policyVerifier:()=>false})).toMatchObject({ok:false,code:'policy_denied'});
    expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),capabilityVerifier:()=>false})).toMatchObject({ok:false,code:'capability_denied'});
  });
  it('permits independently authorized status/rollback after execution approval is revoked',async()=>{
    const configured={...options(),capabilityVerifier:(e:{action:string})=>e.action==='workforce.synthetic.trial.read'||e.action==='workforce.synthetic.trial.rollback'};
    for(const operation of ['read','rollback'] as const)expect((await verifySignedProductActionEnvelope(signed(envelope(operation)),configured)).ok).toBe(true);
    for(const operation of ['activate','run'] as const)expect(await verifySignedProductActionEnvelope(signed(envelope(operation)),configured)).toMatchObject({ok:false,code:'capability_denied'});
  });
  it('binds real Ed25519 signature, expiry and immutable replay request digest',async()=>{
    const wrongKey=generateKeyPairSync('ed25519');expect(await verifySignedProductActionEnvelope(signed(envelope()),{...options(),resolveKey:()=>wrongKey.publicKey})).toMatchObject({ok:false,code:'signature_invalid'});
    const altered=signed(envelope());altered.envelope.requestDigest=`sha256:${'b'.repeat(64)}`;expect(await verifySignedProductActionEnvelope(altered,options())).toMatchObject({ok:false,code:'signature_invalid'});
    expect((await verifySignedProductActionEnvelope(signed(envelope()),{...options(),now:()=>Date.parse('2026-09-05T12:06:00.000Z')})).ok).toBe(false);
    const seen=new Map<string,string>(),configured={...options(),replayStore:{reserve:({key,bindingDigest}:{key:string;bindingDigest:string})=>{
      const old=seen.get(key);if(old)return old===bindingDigest?'replay' as const:'conflict' as const;seen.set(key,bindingDigest);return 'reserved' as const;
    }}};
    expect((await verifySignedProductActionEnvelope(signed(envelope()),configured)).ok).toBe(true);
    expect(await verifySignedProductActionEnvelope(signed(envelope()),configured)).toMatchObject({ok:false,code:'replay_detected'});
    expect(await verifySignedProductActionEnvelope(signed({...envelope(),requestDigest:`sha256:${'b'.repeat(64)}`}),configured)).toMatchObject({ok:false,code:'idempotency_conflict'});
  });
});
