"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { ProgramClasses } from "@/components/dashboard/program-classes";
import { TeachersPanel } from "@/components/dashboard/teachers-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getAssignments, getPrograms, getTeachers } from "@/lib/api";
import type {
  AssignmentWithRelations,
  ProgramWithRelations,
  Teacher,
} from "@/types";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export function ProgramDashboard() {
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [programsData, teachersData, assignmentsData] = await Promise.all([
          getPrograms(),
          getTeachers(),
          getAssignments(),
        ]);

        if (!cancelled) {
          setPrograms(programsData);
          setTeachers(teachersData);
          setAssignments(assignmentsData);
        }
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

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Napaka pri nalaganju</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            Ni programov
          </CardTitle>
          <CardDescription>
            Za vašo šolo še ni ustvarjenih programov. Ko bodo na voljo, se bodo
            prikazali tukaj.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeachersPanel teachers={teachers} />
        </CardContent>
      </Card>
    );
  }

  const defaultTab = programs[0].id.toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nadzorna plošča
        </h1>
        <p className="text-sm text-muted-foreground">
          Pregled programov, predmetov in učiteljev vaše šole.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Tabs defaultValue={defaultTab} className="min-w-0 gap-4">
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {programs.map((program) => (
              <TabsTrigger key={program.id} value={program.id.toString()}>
                {program.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {programs.map((program) => (
            <TabsContent key={program.id} value={program.id.toString()}>
              <ProgramClasses program={program} assignments={assignments} />
            </TabsContent>
          ))}
        </Tabs>

        <TeachersPanel teachers={teachers} />
      </div>
    </div>
  );
}
