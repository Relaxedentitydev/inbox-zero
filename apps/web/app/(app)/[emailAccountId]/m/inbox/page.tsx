import { Suspense } from "react";
import { MobileInbox } from "@/app/(app)/[emailAccountId]/m/inbox/MobileInbox";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

export default async function MobileInboxPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <Suspense>
      <MobileInbox />
    </Suspense>
  );
}
