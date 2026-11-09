import { Suspense } from "react";
import { MobileTabBar } from "@/app/(app)/[emailAccountId]/m/MobileTabBar";

export default async function MobileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      <Suspense>
        <MobileTabBar emailAccountId={emailAccountId} />
      </Suspense>
    </div>
  );
}
