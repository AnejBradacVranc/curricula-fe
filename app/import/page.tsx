"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgramDashboard } from "@/components/dashboard/program-dashboard";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import ImportDashboard from "@/components/import/import-dashboard";

export default function ImportPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="container py-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <ImportDashboard />
        </div>
    );
}
