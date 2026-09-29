# ADR-0005: Opt-in RuVector edge derived memory

Status: Accepted for implementation; production activation gated

## Context

AI Team currently stores memory in Firestore and searches a bounded local feature-hash index. The local/native binding has not passed its runtime probe, so production correctly reports `lexical-degraded`. RuVector edge M0–M5 provides tenant-scoped collections, Workers AI BGE embeddings and quota accounting. Its RFC 8693 token exchange accepts only edge-issued subject tokens for the AI Team resource and a pre-registered confidential ES256 adapter; a Cognitum-issued AI Team token cannot be exchanged.

## Decision

`RUFLO_AI_TEAM_VECTOR=edge` selects a derived remote index. Firestore remains canonical. An approved `memory_remember` stores first, then exchanges its user token for an audience-bound `/v1` token, creates a team-specific collection if absent, and upserts text for BGE 384-dimensional embedding. `memory_search` exchanges a read token, queries that collection, and hydrates returned IDs only from the caller's verified Firestore tenant and team. It supplements sparse edge hits with labelled local lexical results; a full remote page skips the Firestore scan, so unindexed older rows are not guaranteed to appear in the first page. Tool inputs cannot specify the issuer, gateway URL, collection, tenant, or token. IDs are hashed before use in remote paths. No raw private key, bearer, or remote error body is returned to the model.

The adapter is not enabled by default. Enabling it requires the edge OAuth issuer for `https://team.ruv.io/mcp`, an operator-registered public ES256 JWK, a matching private JWK in a managed runtime secret, tenant claim/role verification, explicit disclosure that approved memory text and search queries are sent to RuVector edge, and browser OAuth E2E for two workspaces. Existing Cognitum-issued connections remain verified under an explicit legacy issuer and use their original Firestore tenant plus local-memory fallback. New edge tenants derive from `(upstream_iss, org_id, workspace_id)` and must not collapse to org alone. Cross-key data migration needs a separately reviewed, consented plan.

## Failure behavior and limits

Index writes report `indexed` or `deferred`; Firestore writes are never rolled back by index failure. Search reports `ruvector-edge-hybrid` only on a successful edge query and `lexical-degraded` on exchange, provisioning, quota, or gateway failures. Edge embedding accepts at most 8 KiB of text; longer accepted Firestore memories remain local and are marked deferred. The adapter never auto-claims an edge tenant, runs an agent, or shares evidence. Workers Paid caps have a live deploy receipt, but the adapter does not rely on them. Existing rows require a bounded, consented backfill before the edge index can be treated as complete.

## Verification gate

Run unit and MCP tests, smoke tests, confirm live AS/PR metadata and gateway health, register the public key, install the private key in Secret Manager, and perform browser OAuth and tenant A/B denial drills. Confirm `edgeIndex: indexed`, `edgeStatus: active`, `ruvector-edge-hybrid` results, token audience and `act.sub`, usage cost, and revocation.

On 2026-09-29, the independent token-exchange drill, 22 local tests, 16 smoke checks, and a user-signed-in AI Team canary create/index/search round trip passed against revision `ruflo-ai-team-00016-hap`. The optimized revision `00017-bec` is available only by its `edge-canary` tag. A brief production traffic move to that revision was reversed after confirming this gate still requires a second-workspace A/B drill, measured usage, and revocation. Production is back on `00013-wez` with its original local backend and OAuth issuer. Do not promote the edge revision until the remaining checks pass.

The second-workspace attempt on 2026-09-29 was inconclusive: the signed-in caller did not receive the expected `not_found` denial for the first workspace's test team, and the probe did not capture whether that team was visible or another error occurred. The upstream Cognitum OAuth authorization handler currently resolves `first_org_for_user` and `default_workspace` when granting a code; switching the console's active workspace does not select a different OAuth tenant. Repeat this live denial check with a separate Cognitum identity whose issued org/workspace claims differ, or first add an explicit, authorized workspace selector to the upstream OAuth flow. Never count a second console workspace under the same OAuth identity as an A/B pass without verifying different token tenant claims. The user selected `edge.ruv.io` as the intended stable hostname and org/workspace (not team) tenancy for this release; coordinate exact audience, metadata, and gateway changes before switching traffic.
