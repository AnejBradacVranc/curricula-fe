"use client";

import { Fragment, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import { TeacherSelectDialog } from "@/app/(protected)/_components/teacher-select-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  buildCurriculumSections,
  getAssignmentKey,
} from "@/lib/curriculum/build-curriculum-rows";
import {
  useAssignTeacher,
  useUnassignTeacher,
} from "@/lib/queries/assignments/mutations";
import { useProgram } from "@/lib/queries/programs/queries";
import { useTeachers } from "@/lib/queries/teachers/queries";
import { CurriculumCell } from "./curriculum-cell";

type ProgramAssignmentTableProps = {
  programId: number;
};

export function ProgramAssignmentTable({
  programId,
}: ProgramAssignmentTableProps) {
  const isMobile = useIsMobile();

  const {
    data: program,
    isLoading: programLoading,
    isError: programError,
  } = useProgram(programId);
  const { data: teachers = [] } = useTeachers();

  const assignTeacherMutation = useAssignTeacher();
  const unassignTeacherMutation = useUnassignTeacher();

  const [selectedSlot, setSelectedSlot] = useState<{
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
  } | null>(null);

  const pendingMutation =
    assignTeacherMutation.isPending && assignTeacherMutation.variables
      ? assignTeacherMutation.variables
      : unassignTeacherMutation.isPending && unassignTeacherMutation.variables
        ? unassignTeacherMutation.variables
        : null;

  const pendingAssignmentKey = pendingMutation
    ? getAssignmentKey(
        pendingMutation.programId,
        pendingMutation.subjectId,
        pendingMutation.yearId,
        pendingMutation.classId,
      )
    : null;

  const handleAssignTeacher = async ({
    programId: assignProgramId,
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
    if (!program) {
      return;
    }

    const assignmentKey = getAssignmentKey(
      assignProgramId,
      subjectId,
      yearId,
      classId,
    );

    if (pendingAssignmentKey === assignmentKey) {
      return;
    }

    const programSubject = program.programSubjects.find(
      (item) => item.subjectId === subjectId && item.yearId === yearId,
    );
    const existingAssignment = programSubject?.assignments.find(
      (assignment) => assignment.classId === classId,
    );

    if (existingAssignment?.teacherId === teacherId) {
      return;
    }

    try {
      await assignTeacherMutation.mutateAsync({
        programId: assignProgramId,
        subjectId,
        yearId,
        classId,
        teacherId,
      });
    } catch {
      toast.error(
        "Dodelitev učitelja ni uspela. Preverite, ali je razred že zaseden ali poskusite znova.",
      );
    }
  };

  const handleRemoveAssignment = async ({
    programId: assignProgramId,
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
    try {
      await unassignTeacherMutation.mutateAsync({
        programId: assignProgramId,
        subjectId,
        yearId,
        classId,
        teacherId,
      });
    } catch {
      toast.error("Odstranitev dodelitve ni uspela. Poskusite znova.");
    }
  };

  const handleTeacherSelected = (teacherId: number) => {
    if (!selectedSlot) {
      return;
    }

    const slot = selectedSlot;
    setSelectedSlot(null);
    void handleAssignTeacher({ ...slot, teacherId });
  };

  if (programLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (programError || !program) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          Programa ni bilo mogoče naložiti.
        </CardContent>
      </Card>
    );
  }

  const years = program.programYears;
  const sections = buildCurriculumSections(program);

  if (years.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Ta program še nima dodeljenih letnikov.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-6 text-primary" />
            <h1 className="text-2xl font-semibold">{program.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Število ur na teden po letnikih. Kliknite celico ali povlecite
            učitelja za dodelitev.
          </p>
        </div>

        <Card className="overflow-hidden py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-180 border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="sticky left-0 z-10 w-10 min-w-10 max-w-10 border-r bg-muted px-1 py-2 text-center text-xs font-medium md:w-16 md:min-w-16 md:max-w-20 md:px-2">
                    {isMobile ? "Pred." : "Predmet"}
                  </th>
                  {years.map((programYear) => (
                    <th
                      key={programYear.yearId}
                      className="min-w-35 border-r px-2 py-2 text-center text-xs font-medium last:border-r-0"
                    >
                      <div>{programYear.year.name}</div>
                      <div className="mt-0.5 font-normal text-muted-foreground">
                        {programYear.numWeeks} tednov
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <Fragment key={section.categoryId}>
                    <tr className="border-b border-border bg-muted/40">
                      <td
                        colSpan={years.length + 1}
                        className="bg-primary/50 px-3 py-2 text-xs font-semibold tracking-wide text-primary-foreground uppercase"
                      >
                        {section.categoryName}
                      </td>
                    </tr>

                    {section.rows.map((row) => (
                      <tr
                        key={row.subjectId}
                        className="border-b border-border/70 hover:bg-muted/10"
                      >
                        <td
                          className="sticky left-0 z-10 w-10 min-w-10 max-w-10 border-r bg-card px-1 py-2 align-top text-[10px] font-semibold tracking-wide uppercase md:w-16 md:min-w-16 md:max-w-20 md:px-2 md:text-xs"
                          title={row.subjectName}
                        >
                          <span className="line-clamp-2 break-all">
                            {row.subjectAbbrevation}
                          </span>
                        </td>

                        {years.map((programYear) => {
                          const programSubject = row.cellsByYearId.get(
                            programYear.yearId,
                          );
                          const classes = programYear.classes;
                          const isCellPending =
                            pendingMutation?.programId === program.id &&
                            pendingMutation.subjectId === row.subjectId &&
                            pendingMutation.yearId === programYear.yearId;

                          return (
                            <td
                              key={programYear.yearId}
                              className="border-r px-1 py-1 align-top last:border-r-0"
                            >
                              <CurriculumCell
                                programSubject={programSubject}
                                classes={classes}
                                isLoading={isCellPending}
                                onClick={(programClassId: number) => {
                                  setSelectedSlot({
                                    programId: program.id,
                                    subjectId: row.subjectId,
                                    yearId: programYear.yearId,
                                    classId: programClassId,
                                  });
                                }}
                                onAssign={(classId, teacherId) =>
                                  void handleAssignTeacher({
                                    programId: program.id,
                                    subjectId: row.subjectId,
                                    yearId: programYear.yearId,
                                    classId,
                                    teacherId,
                                  })
                                }
                                onRemove={(classId, teacherId) =>
                                  void handleRemoveAssignment({
                                    programId: program.id,
                                    subjectId: row.subjectId,
                                    yearId: programYear.yearId,
                                    classId,
                                    teacherId,
                                  })
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
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
