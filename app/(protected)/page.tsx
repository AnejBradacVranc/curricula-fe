"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { TeachersPanel } from "@/app/(protected)/_components/teachers-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdditionalActivities } from "@/lib/queries/additional-activities/queries";
import { usePrograms } from "@/lib/queries/programs/queries";
import { teacherKeys } from "@/lib/queries/teachers/keys";
import { useTeachers } from "@/lib/queries/teachers/queries";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );

  const {
    data: programs = [],
    isLoading: programsLoading,
    isError: programsError,
  } = usePrograms();
  const {
    data: teachers = [],
    isLoading: teachersLoading,
    isError: teachersError,
  } = useTeachers();
  const {
    data: additionalActivities = [],
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useAdditionalActivities();

  const isLoading = programsLoading || teachersLoading || activitiesLoading;
  const isError = programsError || teachersError || activitiesError;
  const firstProgramId = programs[0]?.id;

  useEffect(() => {
    if (programsLoading || firstProgramId == null) {
      return;
    }

    router.replace(`/${firstProgramId}`);
  }, [firstProgramId, programsLoading, router]);

  if (isLoading || firstProgramId != null) {
    return (
      <div className="container py-8">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
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
            <TeachersPanel
              teachers={teachers}
              additionalActivities={additionalActivities}
              draggingTeacherId={draggingTeacherId}
              onDragStart={setDraggingTeacherId}
              onDragEnd={() => setDraggingTeacherId(null)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
