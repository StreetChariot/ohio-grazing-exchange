"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { ExchangeMark } from "@/components/exchange-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Account } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { PRODUCT_NAME } from "@/lib/region";

const links = [
  { href: "/listings", label: "Browse" },
  { href: "/education", label: "Education" },
  { href: "/alliances", label: "Alliances" },
  { href: "/partners", label: "Partners" },
  { href: "/forum", label: "Forum" },
];

function NavLinks({
  onNavigate,
  className,
  account,
}: {
  onNavigate?: () => void;
  className?: string;
  account: Account | null;
}) {
  const pathname = usePathname();
  const extra = [
    ...(account ? [{ href: "/account", label: "Account" }] : []),
    ...(account?.isAdmin ? [{ href: "/admin", label: "Host" }] : []),
  ];
  return (
    <nav className={className}>
      {[...links, ...extra].map((link) => {
        const active =
          link.href === "/listings"
            ? pathname === "/listings" ||
              (pathname.startsWith("/listings/") && pathname !== "/listings/new")
            : link.href === "/forum"
              ? pathname === "/forum" || pathname.startsWith("/forum/")
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              active && "bg-muted text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountControls({ account }: { account: Account | null }) {
  if (!account) {
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button asChild size="sm">
        <Link href="/listings/new">Post a listing</Link>
      </Button>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </>
  );
}

export function SiteHeader({ account }: { account: Account | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ExchangeMark className="size-9 shrink-0" />
          <span className="leading-tight">
            <span className="block text-sm">Ohio Valley</span>
            <span className="block text-[0.7rem] font-medium text-muted-foreground">
              Grazing Exchange
            </span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          <NavLinks className="flex items-center" account={account} />
          <div className="ml-2 flex items-center gap-1">
            <AccountControls account={account} />
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="sm:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{PRODUCT_NAME}</SheetTitle>
            </SheetHeader>
            <NavLinks className="mt-4 flex flex-col gap-1 px-4" account={account} />
            <div className="grid gap-2 px-4">
              {account ? (
                <p className="text-sm text-muted-foreground">{account.displayName}</p>
              ) : null}
              <AccountControls account={account} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
