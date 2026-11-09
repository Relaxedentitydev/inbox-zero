"use client";

import { useMemo } from "react";
import { useQueryState } from "nuqs";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useAccount } from "@/providers/EmailAccountProvider";
import { useLabels } from "@/hooks/useLabels";
import { useFolders } from "@/hooks/useFolders";
import { useMailThreads } from "@/app/(app)/[emailAccountId]/mail/use-mail-threads";
import { useThread } from "@/hooks/useThread";
import { isThreadUnread } from "@/app/(app)/[emailAccountId]/mail/read-state";
import { getThreadParticipantNames } from "@/app/(app)/[emailAccountId]/mail/thread-participants";
import { getMailSidebarFolders } from "@/app/(app)/[emailAccountId]/mail/outlook-folder-list";
import { EmailDate } from "@/components/email-list/EmailDate";
import { EmailThread } from "@/components/email-list/EmailThread";
import { LoadingContent } from "@/components/LoadingContent";
import { Button } from "@/components/ui/button";
import { decodeSnippet } from "@/utils/gmail/decode";
import { internalDateToDate } from "@/utils/date";
import { isMicrosoftProvider } from "@/utils/email/provider-types";
import { cn } from "@/utils";
import {
  mobileScopeToThreadsQuery,
  parseMobileScope,
  type MobileScope,
} from "@/app/(app)/[emailAccountId]/m/mobile-scope";

const SYSTEM_SCOPES: Array<{ name: string; type: string }> = [
  { name: "Inbox", type: "inbox" },
  { name: "Starred", type: "starred" },
  { name: "Sent", type: "sent" },
  { name: "Drafts", type: "draft" },
  { name: "Archived", type: "archive" },
  { name: "Spam", type: "spam" },
  { name: "Trash", type: "trash" },
];

export function MobileInbox() {
  const { emailAccountId, userEmail, provider } = useAccount();
  const [type, setType] = useQueryState("type");
  const [labelId, setLabelId] = useQueryState("labelId");
  const [folderId, setFolderId] = useQueryState("folderId");
  const [threadId, setThreadId] = useQueryState("thread-id");

  const scope = useMemo(
    () => parseMobileScope({ type, labelId, folderId }),
    [folderId, labelId, type],
  );
  const query = useMemo(() => mobileScopeToThreadsQuery(scope), [scope]);

  const { userLabels, isLoading: labelsLoading } = useLabels(emailAccountId);
  const { folders, isLoading: foldersLoading } = useFolders(provider);
  const outlookFolders = useMemo(
    () => (isMicrosoftProvider(provider) ? getMailSidebarFolders(folders) : []),
    [folders, provider],
  );

  const {
    threads,
    isLoading: threadsLoading,
    error: threadsError,
    hasMore,
    isLoadingMore,
    loadMore,
  } = useMailThreads({ emailAccountId, query });

  const {
    data: threadData,
    isLoading: threadLoading,
    error: threadError,
    mutate: mutateThread,
    localAvailability,
  } = useThread(
    { id: threadId, emailAccountId },
    { includeDrafts: true, localMail: true },
  );

  const selectScope = async (next: MobileScope) => {
    await setThreadId(null);
    if (next.kind === "label") {
      await setType(null);
      await setFolderId(null);
      await setLabelId(next.id);
      return;
    }
    if (next.kind === "folder") {
      await setType(null);
      await setLabelId(null);
      await setFolderId(next.id);
      return;
    }
    await setLabelId(null);
    await setFolderId(null);
    await setType(next.type === "inbox" ? null : next.type);
  };

  if (threadId) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label="Back to list"
            onClick={() => {
              setThreadId(null).catch(() => undefined);
            }}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">
              {threadData?.thread.messages[0]?.headers.subject || "Email"}
            </h1>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <LoadingContent loading={threadLoading} error={threadError}>
            {threadData && (
              <EmailThread
                messages={threadData.thread.messages}
                missingBodyIds={localAvailability?.missingBodyIds}
                outgoing={localAvailability?.outgoing}
                sendOperationIds={localAvailability?.sendOperationIds}
                refetch={() => {
                  mutateThread().catch(() => undefined);
                }}
                showReplyButton={false}
                withHeader
              />
            )}
          </LoadingContent>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-base font-semibold">Inbox</h1>
        <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
      </header>

      <div className="shrink-0 overflow-x-auto border-b border-border">
        <div className="flex w-max gap-2 px-3 py-2">
          {SYSTEM_SCOPES.map((item) => (
            <FolderChip
              key={item.type}
              label={item.name}
              active={
                scope.kind === "type" &&
                (scope.type === item.type ||
                  (item.type === "inbox" && scope.type === "inbox"))
              }
              onClick={() => {
                selectScope({ kind: "type", type: item.type }).catch(
                  () => undefined,
                );
              }}
            />
          ))}
          {!labelsLoading &&
            userLabels.map((label) => (
              <FolderChip
                key={label.id}
                label={label.name}
                active={scope.kind === "label" && scope.id === label.id}
                onClick={() => {
                  selectScope({ kind: "label", id: label.id }).catch(
                    () => undefined,
                  );
                }}
              />
            ))}
          {!foldersLoading &&
            outlookFolders.map((folder) => (
              <FolderChip
                key={folder.id}
                label={folder.name}
                active={scope.kind === "folder" && scope.id === folder.id}
                onClick={() => {
                  selectScope({ kind: "folder", id: folder.id }).catch(
                    () => undefined,
                  );
                }}
              />
            ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <LoadingContent loading={threadsLoading} error={threadsError}>
          {threads.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No emails here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {threads.map((thread) => {
                const message = thread.messages.at(-1);
                if (!message) return null;
                const unread = isThreadUnread(thread.messages);
                const participants = getThreadParticipantNames(
                  [...(thread.participantMessages ?? []), ...thread.messages],
                  userEmail,
                ).join(", ");
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-4 py-3 text-left active:bg-muted/60"
                      onClick={() => {
                        setThreadId(thread.id).catch(() => undefined);
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {participants || "Unknown"}
                        </span>
                        <EmailDate
                          className="text-xs"
                          date={internalDateToDate(message.internalDate)}
                        />
                      </div>
                      <span
                        className={cn(
                          "truncate text-sm",
                          unread ? "font-medium" : "text-foreground/90",
                        )}
                      >
                        {message.headers.subject || "(no subject)"}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {decodeSnippet(message.snippet)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </LoadingContent>
        {hasMore ? (
          <div className="flex justify-center p-4">
            <Button
              type="button"
              variant="outline"
              disabled={isLoadingMore}
              onClick={() => {
                loadMore?.();
              }}
            >
              {isLoadingMore ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FolderChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-2 text-xs font-medium",
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}
