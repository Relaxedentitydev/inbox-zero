# Nemuri patches on Inbox Zero

**Upstream pin:** `fbac6af2e1afa1f6b1471eae1ffa3f2524fd82ae`  
**Matched from:** running image `ghcr.io/elie222/inbox-zero@sha256:cdeae982cea9676db9d3ca1fc3a8bf9834994370f5ef051470fe1af081205d6a`  
label `org.opencontainers.image.revision=fbac6af2e1afa1f6b1471eae1ffa3f2524fd82ae`  
**Vendoring:** git submodule at `services/inbox-zero/fork` (branch `nemuri/pin-fbac6af`).  
Submodule (not subtree) so the AGPL tree stays a clear upstream boundary and we can fast-forward the pin without merging megabytes of history into `nav`.

Compose builds `services/inbox-zero/Dockerfile.nemuri` → tag `nemuri-inbox-zero:fbac6af2e`.
That Dockerfile `FROM`s the digest-matched upstream image (same commit as this pin) and
bakes in N-1. Full `fork/docker/Dockerfile.prod` is the long-term path but currently
OOMs (`next build` SIGKILL) on a 16 GB Docker VM — document RAM ≥16 GB before switching.

## Active patches (outside the AGPL tree unless noted)

Patches that are bind-mounted or applied via compose live under `services/inbox-zero/` (parent of `fork/`) so they stay clearly Nemuri-owned:

| ID | Where | What |
|----|--------|------|
| **N-1** | ~~`../patches/force-nonstream-gateway.cjs` + compose NODE_OPTIONS~~ **removed Phase 1** | Was: force non-stream to `:18090`. Now: `services/privacy-gateway` streams SSE live with placeholder-aware rehydration. Preload file kept for emergency rollback only; compose no longer sets NODE_OPTIONS by default. |
| **N-5** | `apps/web/app/api/nemuri/**` | Internal hub API (service token). Wraps rules CRUD/toggle/test, processHistoryForUser, Reply Zero, unsubscribe, archive, writing style. |
| **N-2** | `../docker-compose.yml` cron `profiles: [cron]` | Cron is opt-in (not on `--profile all`) to reduce Gmail quota burn. Documented in SETUP.md / quota-relief.sh. |
| **N-3** | `../docker-compose.yml` + `../egress/` | `web` on `internal: true` only (no default route). `edge` (nginx) publishes `:3300`. Squid allow-lists Google APIs. `gateway-relay` (socat) exposes host `:18090` on the internal net. Hermes `:8642` not relayed / not allow-listed. `NODE_USE_ENV_PROXY=1` so Node fetch uses the proxy. |
| **N-4** | Live + example `.env` | Telemetry/billing third-party keys blanked; `AI_SENDER_PATTERN_LEARNING_ENABLED=false` under quota relief; LLM base URL → Hermes privacy gateway. |

## Intentionally not forked into source (yet)

| Change | Why it stays outside |
|--------|----------------------|
| Hermes privacy gateway gate soft-allow for chat keywords/categories | Lives in Nemuri `src/main/hermesPrivacyGateway.ts`, not Inbox Zero. |
| Nemuri Electron Inbox window / desktop bridge | Nemuri app code. |

## How to add a fork source patch

1. Edit files under `fork/` on branch `nemuri/pin-fbac6af` (or a `nemuri/*` branch based on the pin).
2. Document the change in this file with ID `N-n`, paths, and rationale.
3. Rebuild: `docker compose --profile all build web && docker compose --profile all up -d web`.
4. Bump the image tag in compose if the pin SHA changes.
