import type { MailClient, WorkAdmission } from "@inboxzero/mail-core/engine";
import type { QuerySnapshot } from "@inboxzero/mail-core/queries";

export type BrowserEngineStart = {
  accountId: string;
  provider: "google" | "microsoft";
  generation?: string;
  persist?: boolean;
  maxPendingOperations?: number;
  online?: boolean;
};

export function shouldReleaseDeferredOnStart(online?: boolean) {
  return online !== false;
}

// Turbopack's worker bootstrap can fail or hang before the start RPC
// resolves; without a bound the page waits forever and never falls back
// to the in-tab engine (so /m shows an empty inbox with no /api/mail traffic).
export const MAIL_ENGINE_WORKER_START_MS = 5000;

export function rejectAfter(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

export async function requestSyncUnlessOffline(
  online: boolean | undefined,
  sync: () => Promise<WorkAdmission>,
): Promise<WorkAdmission> {
  if (!shouldReleaseDeferredOnStart(online)) {
    return { status: "scheduled" };
  }
  return sync();
}

export function pageConnectivityOnline(): boolean | undefined {
  if (typeof navigator === "undefined") return;
  return navigator.onLine;
}

export type WorkerObserveKind =
  | "mailbox"
  | "mailboxCounts"
  | "mailboxWindow"
  | "conversation"
  | "operation";

export function observeByKind(
  client: MailClient,
  kind: WorkerObserveKind,
  args: unknown[],
) {
  switch (kind) {
    case "mailbox":
      return client.observeMailbox(args[0] as never);
    case "mailboxCounts":
      return client.observeMailboxCounts(args[0] as never);
    case "mailboxWindow":
      return (
        client.observeMailboxWindow?.(args[0] as never) ??
        client.observeMailbox(args[0] as never)
      );
    case "conversation":
      return client.observeConversation(args[0] as never, args[1] as never);
    case "operation":
      return client.observeOperation(args[0] as never);
    default: {
      const exhaustive: never = kind;
      throw new Error(`unsupported observe kind ${exhaustive}`);
    }
  }
}

export type WorkerRequest =
  | { id: string; type: "start"; input: BrowserEngineStart }
  | { id: string; type: "call"; method: string; args: unknown[] }
  | {
      id: string;
      type: "observe";
      kind: WorkerObserveKind;
      handleId: string;
      args: unknown[];
    }
  | { id: string; type: "loadMore"; handleId: string }
  | { id: string; type: "unobserve"; handleId: string }
  | { id: string; type: "close" };

export type WorkerResponse =
  | { id: string; type: "ok"; value?: unknown }
  | { id: string; type: "error"; message: string }
  | { type: "snapshot"; handleId: string; snapshot: QuerySnapshot<unknown> };

export function browserMailEngineCapabilities() {
  return {
    worker: typeof Worker !== "undefined",
    locks:
      typeof navigator !== "undefined" &&
      Boolean((navigator as Navigator & { locks?: unknown }).locks),
    opfs:
      typeof navigator !== "undefined" &&
      "storage" in navigator &&
      "getDirectory" in navigator.storage,
  };
}

export function workerStartFence(
  startedAccount: string | undefined,
  nextAccountId: string,
) {
  if (startedAccount !== undefined && startedAccount !== nextAccountId) {
    return "account_mismatch";
  }
  return null;
}

export function readPageMaxPendingOperations(): number | undefined {
  if (typeof window === "undefined") return;
  const value = window.__inboxZeroMailMaxPendingOperations;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    return;
  }
  return Math.floor(value);
}

declare global {
  interface Window {
    __inboxZeroMailMaxPendingOperations?: number;
  }
}
