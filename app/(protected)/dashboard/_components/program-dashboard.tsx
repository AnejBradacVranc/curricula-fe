"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

import { getAssignmentKey } from "@/lib/curriculum/build-curriculum-rows";
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
  assignTeacher,
  getAdditionalActivities,
  getPrograms,
  getTeachers,
  unassignTeacher,
} from "@/lib/api";
import type {
  AdditionalActivity,
  ProgramWithRelations,
  Teacher,
} from "@/types";
import { TeachersPanel } from "./teachers-panel";
import { ProgramAssignmentTable } from "./program-assignment-table";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export function ProgramDashboard() {
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [additionalActivities, setAdditionalActivities] = useState<
    AdditionalActivity[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAssignmentKey, setPendingAssignmentKey] = useState<
    string | null
  >(null);
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );

  const refreshDashboard = useCallback(async () => {
    const [programsData, teachersData] = await Promise.all([
      getPrograms(),
      getTeachers(),
    ]);

    setPrograms(programsData);
    setTeachers(teachersData);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [programsData, teachersData, activitiesData] = await Promise.all([
          getPrograms(),
          getTeachers(),
          getAdditionalActivities(),
        ]);

        if (!cancelled) {
          setPrograms(programsData);
          setTeachers(teachersData);
          setAdditionalActivities(activitiesData);
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
      yearId,
      classId,
      teacherId,
    }: {
      programId: number;
      subjectId: number;
      yearId: number;
      classId: number;
      teacherId: number;
    }) => {
      const assignmentKey = getAssignmentKey(
        programId,
        subjectId,
        yearId,
        classId,
      );

      if (pendingAssignmentKey === assignmentKey) {
        return;
      }

      const program = programs.find((item) => item.id === programId);
      const programSubject = program?.programSubjects.find(
        (item) => item.subjectId === subjectId && item.yearId === yearId,
      );
      const existingAssignment = programSubject?.assignments.find(
        (assignment) => assignment.classId === classId,
      );

      if (existingAssignment?.teacherId === teacherId) {
        return;
      }

      setActionError(null);
      setPendingAssignmentKey(assignmentKey);

      try {
        await assignTeacher({
          programId,
          subjectId,
          yearId,
          classId,
          teacherId,
        });
        await refreshDashboard();
      } catch {
        setActionError(
          "Dodelitev učitelja ni uspela. Preverite, ali je razred že zaseden ali poskusite znova.",
        );
      } finally {
        setPendingAssignmentKey(null);
      }
    },
    [programs, pendingAssignmentKey, refreshDashboard],
  );

  const handleRemoveAssignment = useCallback(
    async ({
      programId,
      subjectId,
      yearId,
      classId,
      teacherId,
    }: {
      programId: number;
      subjectId: number;
      yearId: number;
      classId: number;
      teacherId: number;
    }) => {
      setActionError(null);
      setPendingAssignmentKey(
        getAssignmentKey(programId, subjectId, yearId, classId),
      );

      try {
        await unassignTeacher({
          programId,
          subjectId,
          yearId,
          classId,
          teacherId,
        });
        await refreshDashboard();
      } catch {
        setActionError("Odstranitev dodelitve ni uspela. Poskusite znova.");
      } finally {
        setPendingAssignmentKey(null);
      }
    },
    [refreshDashboard],
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
            additionalActivities={additionalActivities}
            draggingTeacherId={draggingTeacherId}
            onDragStart={setDraggingTeacherId}
            onDragEnd={() => setDraggingTeacherId(null)}
            onTeacherUpdated={refreshDashboard}
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
          Dodeljevanje ur
        </h1>
        <p className="text-sm text-muted-foreground">
          Izvedbeni predmetnik po letnikih — povlecite učitelja v celico za
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
              <ProgramAssignmentTable
                program={program}
                pendingAssignmentKey={pendingAssignmentKey}
                onAssignTeacher={handleAssignTeacher}
                onRemoveAssignment={handleRemoveAssignment}
              />
            </TabsContent>
          ))}
        </Tabs>

        <TeachersPanel
          teachers={teachers}
          additionalActivities={additionalActivities}
          draggingTeacherId={draggingTeacherId}
          onDragStart={setDraggingTeacherId}
          onDragEnd={() => setDraggingTeacherId(null)}
          onTeacherUpdated={refreshDashboard}
        />
      </div>
    </div>
  );
}
