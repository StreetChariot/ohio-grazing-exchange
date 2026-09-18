"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [{ href: "/listings", label: "Browse" }];

function NavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {links.map((link) => {
        const active =
          link.href === "/listings"
            ? pathname === "/listings" ||
              (pathname.startsWith("/listings/") && pathname !== "/listings/new")
            : pathname === link.href;
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wheat className="size-4" />
          </span>
          Ohio Grazing Exchange
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          <NavLinks className="flex items-center" />
          <Button asChild size="sm" className="ml-2">
            <Link href="/listings/new">Post a listing</Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="sm:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Ohio Grazing Exchange</SheetTitle>
            </SheetHeader>
            <NavLinks className="mt-4 flex flex-col gap-1 px-4" />
            <div className="px-4">
              <Button asChild className="w-full">
                <Link href="/listings/new">Post a listing</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
