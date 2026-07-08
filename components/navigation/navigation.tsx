"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Domov" },
  { href: "/dashboard", label: "Nadzorna plošča", auth: true },
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
                  pathname === link.href && "bg-muted text-foreground",
                )}
              >
                {link.label}
              </Button>
            ))}

          {!isLoading && !isAuthenticated && (
            <Button size="sm" nativeButton={false}
              render={<Link href="/login" />}>
              Prijava
            </Button>
          )}

          {!isLoading && isAuthenticated && (
            <Button nativeButton={false}
              variant="outline" size="sm" onClick={handleLogout}>
              Odjava
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
