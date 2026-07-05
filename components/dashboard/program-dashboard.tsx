"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getPrograms,
  getTeachers,
} from "@/lib/api";
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingSubjectId, setPendingSubjectId] = useState<number | null>(null);
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );

  const refreshAssignmentsAndTeachers = useCallback(async () => {
    const [assignmentsData, teachersData] = await Promise.all([
      getAssignments(),
      getTeachers(),
    ]);

    setAssignments(assignmentsData);
    setTeachers(teachersData);
  }, []);

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

  const handleAssignTeacher = useCallback(
    async ({
      programId,
      subjectId,
      teacherId,
    }: {
      programId: number;
      subjectId: number;
      teacherId: number;
    }) => {
      const existing = assignments.find(
        (assignment) => assignment.subjectId === subjectId,
      );

      if (existing?.teacherId === teacherId) {
        return;
      }

      setActionError(null);
      setPendingSubjectId(subjectId);

      try {
        if (existing) {
          await deleteAssignment({
            programId,
            subjectId,
            teacherId: existing.teacherId,
          });
        }

        await createAssignment({ programId, subjectId, teacherId });
        await refreshAssignmentsAndTeachers();
      } catch {
        setActionError(
          "Dodelitev učitelja ni uspela. Preverite, ali je predmet že zaseden ali poskusite znova.",
        );
      } finally {
        setPendingSubjectId(null);
      }
    },
    [assignments, refreshAssignmentsAndTeachers],
  );

  const handleRemoveAssignment = useCallback(
    async ({
      programId,
      subjectId,
      teacherId,
    }: {
      programId: number;
      subjectId: number;
      teacherId: number;
    }) => {
      setActionError(null);
      setPendingSubjectId(subjectId);

      try {
        await deleteAssignment({ programId, subjectId, teacherId });
        await refreshAssignmentsAndTeachers();
      } catch {
        setActionError("Odstranitev dodelitve ni uspela. Poskusite znova.");
      } finally {
        setPendingSubjectId(null);
      }
    },
    [refreshAssignmentsAndTeachers],
  );

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
          <TeachersPanel
            teachers={teachers}
            draggingTeacherId={draggingTeacherId}
            onDragStart={setDraggingTeacherId}
            onDragEnd={() => setDraggingTeacherId(null)}
          />
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
          Povlecite učitelja na predmet za dodelitev ali odstranite obstoječo
          dodelitev.
        </p>
      </div>

      {actionError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 text-sm text-destructive">
            {actionError}
          </CardContent>
        </Card>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Tabs defaultValue={defaultTab} className="min-w-0 gap-4">
          <div className="scrollbar-x min-w-0 overscroll-x-contain pb-1">
            <TabsList className="h-auto w-max max-w-none flex-nowrap justify-start">
              {programs.map((program) => (
                <TabsTrigger
                  key={program.id}
                  value={program.id.toString()}
                  className="shrink-0 flex-none px-3"
                >
                  {program.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {programs.map((program) => (
            <TabsContent key={program.id} value={program.id.toString()}>
              <ProgramClasses
                program={program}
                assignments={assignments}
                pendingSubjectId={pendingSubjectId}
                onAssignTeacher={handleAssignTeacher}
                onRemoveAssignment={handleRemoveAssignment}
              />
            </TabsContent>
          ))}
        </Tabs>

        <TeachersPanel
          teachers={teachers}
          draggingTeacherId={draggingTeacherId}
          onDragStart={setDraggingTeacherId}
          onDragEnd={() => setDraggingTeacherId(null)}
        />
      </div>
    </div>
  );
}
