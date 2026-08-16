"use client";

import { useEffect, useState } from "react";
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
import { getAdditionalActivities, getPrograms, getTeachers } from "@/lib/api";
import type { AdditionalActivity, Teacher } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [additionalActivities, setAdditionalActivities] = useState<
    AdditionalActivity[]
  >([]);
  const [hasPrograms, setHasPrograms] = useState(false);
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [programsData, teachersData, activitiesData] = await Promise.all([
          getPrograms(),
          getTeachers(),
          getAdditionalActivities(),
        ]);

        if (cancelled) {
          return;
        }

        if (programsData.length > 0) {
          setHasPrograms(true);
          router.replace(`/${programsData[0].id}`);
          return;
        }

        setTeachers(teachersData);
        setAdditionalActivities(activitiesData);
      } catch {
        if (!cancelled) {
          setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const refreshTeachers = async () => {
    const teachersData = await getTeachers();
    setTeachers(teachersData);
  };

  if (isLoading || hasPrograms) {
    return (
      <div className="container py-8">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>{error}</CardDescription>
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
              onTeacherUpdated={refreshTeachers}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
