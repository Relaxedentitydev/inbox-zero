import type { ThreadsQuery } from "@/utils/threads/validation";
import { mailTypeToThreadsQuery } from "@/utils/split-inbox/split-query";

export type MobileScope =
  | { kind: "type"; type: string }
  | { kind: "label"; id: string }
  | { kind: "folder"; id: string };

export function mobileScopeToThreadsQuery(scope: MobileScope): ThreadsQuery {
  if (scope.kind === "label") return { labelId: scope.id };
  if (scope.kind === "folder") return { folderId: scope.id };
  if (scope.type !== "inbox") return mailTypeToThreadsQuery(scope.type);
  return { type: "inbox" };
}

export function parseMobileScope({
  type,
  labelId,
  folderId,
}: {
  type: string | null;
  labelId: string | null;
  folderId: string | null;
}): MobileScope {
  if (labelId) return { kind: "label", id: labelId };
  if (folderId) return { kind: "folder", id: folderId };
  return { kind: "type", type: type || "inbox" };
}
