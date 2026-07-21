"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { CalendarClock } from "lucide-react";

import { ProgramAssignmentTable } from "@/app/(protected)/dashboard/_components/program-assignment-table";
import { TeachersPanel } from "@/app/(protected)/dashboard/_components/teachers-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssignmentKey } from "@/lib/curriculum/build-curriculum-rows";
import {
  assignTeacher,
  getAdditionalActivities,
  getPrograms,
  getTeachers,
  unassignTeacher,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AdditionalActivity,
  ProgramWithRelations,
  Teacher,
} from "@/types";

//Probably temporary sollution

function DraggableTabsList({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setIsDragging(false);

    if (scrollerRef.current?.hasPointerCapture(event.pointerId)) {
      scrollerRef.current.releasePointerCapture(event.pointerId);
    }
  }, []);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag || !el || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 4) {
      drag.moved = true;
    }

    el.scrollLeft = drag.scrollLeft - deltaX;
  }

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none",
        "select-none touch-pan-y",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        suppressClickRef.current = false;
      }}
    >
      <TabsList className="h-9 w-max max-w-none cursor-grab">
        {children}
      </TabsList>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
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

export default function DashboardPage() {
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

  const pageHeader = (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <CalendarClock className="size-6 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Dodeljevanje ur
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Izvedbeni predmetnik po letnikih — povlecite učitelja v celico za
        dodelitev.
      </p>
    </div>
  );

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
          {pageHeader}
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

  const defaultTab = programs[0].id.toString();

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {pageHeader}

        {actionError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-3 text-sm text-destructive">
              {actionError}
            </CardContent>
          </Card>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Tabs defaultValue={defaultTab} className="min-w-0 gap-4">
            <DraggableTabsList>
              {programs.map((program) => (
                <TabsTrigger
                  key={program.id}
                  value={program.id.toString()}
                  className="shrink-0 flex-none px-5 cursor-grab"
                >
                  {program.name}
                </TabsTrigger>
              ))}
            </DraggableTabsList>

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
    </div>
  );
}
