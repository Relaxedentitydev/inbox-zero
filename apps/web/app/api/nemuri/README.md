# `/api/nemuri/*` (N-5)

Source stubs for the hub service-token API. The running `Dockerfile.nemuri` image is digest-based and cannot pick up new Next routes without a full `Dockerfile.prod` rebuild (OOM on 16 GB).

Until then, Core talks to `services/inbox-zero/nemuri-bridge` on `:8790` (compose profile `all`), which exposes the same capabilities over plain HTTP + Postgres.

When RAM allows a fork rebuild, implement these routes here wrapping:

- `createRule` / `updateRuleAction` / `deleteRuleAction` / `toggleRuleAction` / `runRulesAction`
- `processHistoryForUser` (`utils/webhook/google/process-history.ts`)
- Reply Zero / `ThreadTracker`
- `unsubscribeSenderAndMark` / bulk archive
- writing style read/write

Auth: `Authorization: Bearer $NEMURI_SERVICE_TOKEN` only; reject all other callers.
