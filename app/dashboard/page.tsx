import Link from "next/link";
import { DashboardPanel } from "@/components/dashboard-panel";

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <DashboardPanel />
      <Link
        href="/"
        className="mt-6 text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        Back to home
      </Link>
    </div>
  );
}
