import { Suspense } from "react";
import { EmailLabelsProvider } from "@/providers/EmailLabelsProvider";
import { Chat } from "@/components/assistant-chat/chat";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

export const maxDuration = 300;

export default async function MobileAgentPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <EmailLabelsProvider>
      <Suspense>
        <div className="flex h-full flex-col">
          <header className="shrink-0 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <h1 className="text-base font-semibold">Agent</h1>
            <p className="text-xs text-muted-foreground">
              Ask about your inbox — tool results show as interactive cards.
            </p>
          </header>
          <div className="min-h-0 flex-1">
            <Chat open />
          </div>
        </div>
      </Suspense>
    </EmailLabelsProvider>
  );
}
