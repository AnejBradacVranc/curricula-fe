"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  Home,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    label: "Domov",
    description: "Začetna stran aplikacije.",
    icon: Home,
  },
  {
    href: "/dashboard",
    label: "Dodeljevanje ur",
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
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-border">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold text-primary">
          Curricula
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks
            .filter((link) => !link.auth || isAuthenticated)
            .map((link) => (
              <Button
                nativeButton={false}
                key={link.href}
                variant="ghost"
                size="sm"
                render={<Link href={link.href} />}
                className={cn(
                  pathname === link.href && "bg-primary text-foreground",
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
      </div>
    </header>
  );
}
