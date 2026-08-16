"use client";

import { useEffect, useState } from "react";

import { ProgramAssignmentTable } from "@/app/(protected)/_components/program-assignment-table";
import { ProgramsPanel } from "@/app/(protected)/_components/programs-panel";
import { TeachersPanel } from "@/app/(protected)/_components/teachers-panel";
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
  getProgram,
  getPrograms,
  getTeachers,
  unassignTeacher,
} from "@/lib/api";
import type {
  AdditionalActivity,
  ProgramWithRelations,
  Teacher,
} from "@/types";
import { TeacherSelectDialog } from "@/app/(protected)/_components/teacher-select-dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useParams, useRouter } from "next/navigation";
import { ProgramLean } from "@/types/entities/program";

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

export default function AssignmentsPage() {
  const params = useParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<ProgramWithRelations>();
  const [programs, setPrograms] = useState<ProgramLean[]>([]);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [additionalActivities, setAdditionalActivities] = useState<
    AdditionalActivity[]
  >([]);

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
  const router = useRouter();

  const isMobile = useIsMobile();

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [programData, teachersData, activitiesData, programsData] =
          await Promise.all([
            getProgram(programId),
            getTeachers(),
            getAdditionalActivities(),
            getPrograms(),
          ]);

        if (!cancelled) {
          setProgram(programData);
          setTeachers(teachersData);
          setAdditionalActivities(activitiesData);
          setPrograms(programsData);
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
    const [programData, teachersData] = await Promise.all([
      getProgram(programId),
      getTeachers(),
    ]);

    setProgram(programData);
    setTeachers(teachersData);
  };

  const handleAssignTeacher = async ({
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
  };

  const handleRemoveAssignment = async ({
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
  };

  const handleSelectSlot = (slot: {
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
  }) => {
    setActionError(null);
    setSelectedSlot(slot);
  };

  const handleTeacherSelected = (teacherId: number) => {
    if (!selectedSlot) {
      return;
    }

    const slot = selectedSlot;
    setSelectedSlot(null);
    handleAssignTeacher({ ...slot, teacherId });
  };

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

  const handleNavigate = (programId: number) => {
    router.push(`/${programId}`);
  };

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

          {isMobile && (
            <ProgramsPanel
              programs={programs}
              selectedProgramId={programId}
              onSelectProgram={handleNavigate}
            />
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <ProgramAssignmentTable
                program={program!}
                pendingAssignmentKey={pendingAssignmentKey}
                onAssignTeacher={handleAssignTeacher}
                onRemoveAssignment={handleRemoveAssignment}
                onSelectSlot={handleSelectSlot}
              />
            </div>
            <aside className="hidden md:flex w-full max-w-90 shrink-0 flex-col gap-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-0">
              <ProgramsPanel
                programs={programs}
                selectedProgramId={programId}
                onSelectProgram={handleNavigate}
              />
              <TeachersPanel
                teachers={teachers}
                additionalActivities={additionalActivities}
                draggingTeacherId={draggingTeacherId}
                onDragStart={setDraggingTeacherId}
                onDragEnd={() => setDraggingTeacherId(null)}
                onTeacherUpdated={refreshDashboard}
              />
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
