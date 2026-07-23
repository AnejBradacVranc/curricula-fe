"use client";

import { useEffect, useState } from "react";

import { ProgramAssignmentTable } from "@/app/(protected)/dashboard/_components/program-assignment-table";
import { ProgramsPanel } from "@/app/(protected)/dashboard/_components/programs-panel";
import { TeachersPanel } from "@/app/(protected)/dashboard/_components/teachers-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssignmentKey } from "@/lib/curriculum/build-curriculum-rows";
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
import { TeacherSelectDialog } from "./_components/teacher-select-dialog";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-96 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [programs, setPrograms] = useState<ProgramWithRelations[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [additionalActivities, setAdditionalActivities] = useState<
    AdditionalActivity[]
  >([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAssignmentKey, setPendingAssignmentKey] = useState<
    string | null
  >(null);
  const [draggingTeacherId, setDraggingTeacherId] = useState<number | null>(
    null,
  );

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
          setSelectedProgramId(null);
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

  const refreshDashboard = async () => {
    const [programsData, teachersData] = await Promise.all([
      getPrograms(),
      getTeachers(),
    ]);

    setPrograms(programsData);
    setTeachers(teachersData);
  }

  const handleAssignTeacher =
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
    }

  const handleRemoveAssignment =
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
    }

  const handleSelectSlot =
    (slot: {
      programId: number;
      subjectId: number;
      yearId: number;
      classId: number;
    }) => {
      setActionError(null);
      setSelectedSlot(slot);
    }


  const handleTeacherSelected =
    (teacherId: number) => {
      if (!selectedSlot) {
        return;
      }

      const slot = selectedSlot;
      setSelectedSlot(null);
      void handleAssignTeacher({ ...slot, teacherId });
    }

  if (isLoading) {
    return (
      <div className="container py-8">
        <DashboardSkeleton />
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

  if (programs.length === 0) {
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
                onTeacherUpdated={refreshDashboard}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedProgram =
    programs.find((program) => program.id === selectedProgramId) ??
    programs[0];

  return (
    <>
      <div className="container py-8">
        <div className="space-y-6">
          {actionError && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-3 text-sm text-destructive">
                {actionError}
              </CardContent>
            </Card>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <ProgramAssignmentTable
                program={selectedProgram}
                pendingAssignmentKey={pendingAssignmentKey}
                onAssignTeacher={handleAssignTeacher}
                onRemoveAssignment={handleRemoveAssignment}
                onSelectSlot={handleSelectSlot}
              />
            </div>

            <aside className="flex w-full max-w-90 flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)]">
              <ProgramsPanel
                programs={programs}
                selectedProgramId={selectedProgram.id}
                onSelectProgram={setSelectedProgramId}
              />
              <div className="min-h-0 flex-1">
                <TeachersPanel
                  teachers={teachers}
                  additionalActivities={additionalActivities}
                  draggingTeacherId={draggingTeacherId}
                  onDragStart={setDraggingTeacherId}
                  onDragEnd={() => setDraggingTeacherId(null)}
                  onTeacherUpdated={refreshDashboard}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <TeacherSelectDialog
        teachers={teachers}
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        onTeacherSelected={handleTeacherSelected}
      />
    </>
  );
}
