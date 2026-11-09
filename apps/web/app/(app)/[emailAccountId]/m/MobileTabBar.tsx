"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InboxIcon, SparklesIcon } from "lucide-react";
import { prefixPath } from "@/utils/path";
import { cn } from "@/utils";

export function MobileTabBar({ emailAccountId }: { emailAccountId: string }) {
  const pathname = usePathname() ?? "";
  const inboxHref = prefixPath(emailAccountId, "/m/inbox");
  const agentHref = prefixPath(emailAccountId, "/m/agent");
  const onInbox = pathname.includes("/m/inbox") || pathname.endsWith("/m");
  const onAgent = pathname.includes("/m/agent");

  return (
    <nav
      aria-label="Mobile"
      className="border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-2">
        <TabLink
          href={inboxHref}
          active={onInbox}
          label="Inbox"
          Icon={InboxIcon}
        />
        <TabLink
          href={agentHref}
          active={onAgent}
          label="Agent"
          Icon={SparklesIcon}
        />
      </div>
    </nav>
  );
}

function TabLink({
  href,
  active,
  label,
  Icon,
}: {
  href: string;
  active: boolean;
  label: string;
  Icon: typeof InboxIcon;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
