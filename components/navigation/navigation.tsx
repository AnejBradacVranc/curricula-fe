"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  LogOut,
  Menu,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { useLogout } from "@/lib/queries";

export type NavLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  auth?: boolean;
};

export const navLinks: NavLink[] = [
  {
    href: "/",
    label: "Ure",
    description: "Dodeli učitelje predmetom po letnikih in razredih.",
    icon: CalendarClock,
    auth: true,
  },
  {
    href: "/programs",
    label: "Programi",
    description: "Upravljajte programe, letnike in predmetnike.",
    icon: GraduationCap,
    auth: true,
  },
  {
    href: "/subjects",
    label: "Predmeti",
    description: "Urejajte predmete in njihove kratice.",
    icon: BookOpen,
    auth: true,
  },
  {
    href: "/teachers",
    label: "Učitelji",
    description: "Upravljajte učitelje in uvozite jih iz datoteke.",
    icon: Users,
    auth: true,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = navLinks.filter((link) => !link.auth || isAuthenticated);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    setMobileOpen(false);
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/" || /^\/\d+$/.test(pathname);
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-border">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Curricula
        </Link>

        {isMobile === null ? (
          <div className="size-8" aria-hidden />
        ) : isMobile ? (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Odpri meni"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] gap-0 p-0"
            >
              <SheetHeader className="border-b">
                <SheetTitle>Meni</SheetTitle>
                <SheetDescription>
                  Navigacija po aplikaciji Curricula.
                </SheetDescription>
              </SheetHeader>

              <nav className="flex flex-1 flex-col gap-1 p-3">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Button
                      key={link.href}
                      nativeButton={false}
                      variant="ghost"
                      className={cn(
                        "h-auto justify-start gap-3 px-3 py-3",
                        isActive(link.href) &&
                        "bg-primary text-foreground hover:bg-primary/50",
                      )}
                      render={
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                        />
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex min-w-0 flex-col items-start gap-0.5">
                        <span className="font-medium">{link.label}</span>
                        <span
                          className={cn(
                            "text-xs font-normal text-muted-foreground text-wrap",
                            isActive(link.href) && "text-primary-foreground",
                          )}
                        >
                          {link.description}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </nav>

              <div className="mt-auto border-t flex justify-end p-3">
                {!isLoading && !isAuthenticated && (
                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                      />
                    }
                  >
                    Prijava
                  </Button>
                )}

                {!isLoading && isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-fit justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" />
                    Odjava
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Button
                nativeButton={false}
                key={link.href}
                variant="ghost"
                size="sm"
                render={<Link href={link.href} />}
                className={cn(
                  isActive(link.href) &&
                  "bg-primary text-foreground hover:bg-primary/50",
                )}
              >
                {link.label}
              </Button>
            ))}

            {!isLoading && !isAuthenticated && (
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Prijava
              </Button>
            )}

            {!isLoading && isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut />
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
