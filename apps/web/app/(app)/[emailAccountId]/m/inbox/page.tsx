import { Suspense } from "react";
import { MobileInbox } from "@/app/(app)/[emailAccountId]/m/inbox/MobileInbox";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { MailEngineHost } from "@/utils/mail-engine/MailEngineHost";

export default async function MobileInboxPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <MailEngineHost>
      <Suspense>
        <MobileInbox />
      </Suspense>
    </MailEngineHost>
  );
}
