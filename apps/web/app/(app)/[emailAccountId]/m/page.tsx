import { redirect } from "next/navigation";
import { prefixPath } from "@/utils/path";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

export default async function MobileIndexPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });
  redirect(prefixPath(emailAccountId, "/m/inbox"));
}
