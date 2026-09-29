# ADR-0005: Opt-in RuVector edge derived memory

Status: Accepted for implementation; production activation gated

## Context

AI Team currently stores memory in Firestore and searches a bounded local feature-hash index. The local/native binding has not passed its runtime probe, so production correctly reports `lexical-degraded`. RuVector edge M0–M5 provides tenant-scoped collections, Workers AI BGE embeddings and quota accounting. Its RFC 8693 token exchange accepts only edge-issued subject tokens for the AI Team resource and a pre-registered confidential ES256 adapter; a Cognitum-issued AI Team token cannot be exchanged.

## Decision

`RUFLO_AI_TEAM_VECTOR=edge` selects a derived remote index. Firestore remains canonical. An approved `memory_remember` stores first, then exchanges its user token for an audience-bound `/v1` token, creates a team-specific collection if absent, and upserts text for BGE 384-dimensional embedding. `memory_search` exchanges a read token, queries that collection, and hydrates returned IDs only from the caller's verified Firestore tenant and team. It supplements edge hits with labelled local lexical results so legacy rows are not silently omitted. Tool inputs cannot specify the issuer, gateway URL, collection, tenant, or token. IDs are hashed before use in remote paths. No raw private key, bearer, or remote error body is returned to the model.

The adapter is not enabled by default. Enabling it requires the edge OAuth issuer for `https://team.ruv.io/mcp`, an operator-registered public ES256 JWK, a matching private JWK in a managed runtime secret, tenant claim/role verification, explicit disclosure that approved memory text and search queries are sent to RuVector edge, and browser OAuth E2E for two workspaces. Existing Cognitum-issuer connections and Firestore tenants are not automatically migrated: the edge tenant key is derived from `(upstream_iss, org_id, workspace_id)` and must not collapse to org alone. Reconnect and data migration need a separately reviewed plan.

## Failure behavior and limits

Index writes report `indexed` or `deferred`; Firestore writes are never rolled back by index failure. Search reports `ruvector-edge-hybrid` only on a successful edge query and `lexical-degraded` on exchange, provisioning, quota, or gateway failures. Edge embedding accepts at most 8 KiB of text; longer accepted Firestore memories remain local and are marked deferred. The adapter never auto-claims an edge tenant, runs an agent, shares evidence, or treats PR #1098's undeployed raised caps as production capacity. Existing rows require a bounded, consented backfill before the edge index can be treated as complete.

## Verification gate

Run unit and MCP tests, smoke tests, confirm live AS/PR metadata and gateway health, register the public key, install the private key in Secret Manager, and perform browser OAuth and tenant A/B denial drills. Confirm `edgeIndex: indexed`, `edgeStatus: active`, `ruvector-edge-hybrid` results, token audience and `act.sub`, usage cost, and revocation. Until these pass, production remains on its existing local backend and OAuth issuer.
