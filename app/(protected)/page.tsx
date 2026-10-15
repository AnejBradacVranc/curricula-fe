"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { TeachersPanel } from "@/app/(protected)/_components/teachers-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms } from "@/lib/queries/programs/queries";

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: programs = [],
    isLoading: programsLoading,
    isError: programsError,
  } = usePrograms();

  const firstProgramId = programs[0]?.id;

  useEffect(() => {
    if (programsLoading || firstProgramId == null) {
      return;
    }

    router.replace(`/${firstProgramId}`);
  }, [firstProgramId, programsLoading, router]);

  if (programsLoading || firstProgramId != null) {
    return (
      <div className="container py-8">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (programsError) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>
              Podatkov ni bilo mogoče naložiti. Poskusite znova.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ni programov</CardTitle>
            <CardDescription>
              Za vašo šolo še ni ustvarjenih programov. Ko bodo na voljo, se
              bodo prikazali tukaj.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeachersPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
