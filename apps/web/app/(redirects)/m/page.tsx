import { redirectToEmailAccountPath } from "@/utils/account";

export default async function MobileRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectToEmailAccountPath("/m", await searchParams);
}
