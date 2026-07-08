"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgramDashboard } from "@/components/dashboard/program-dashboard";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImportDashboard() {


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Uvoz podatkov
                </h1>
                <p className="text-sm text-muted-foreground">
                    Središče za uvažanje urnikov — uvozite nove urnike in predmete z možnostjo ročnega urejanja.
                </p>
            </div>



            <div className="grid items-start gap-6 ">

            </div>
        </div>
    );
}
