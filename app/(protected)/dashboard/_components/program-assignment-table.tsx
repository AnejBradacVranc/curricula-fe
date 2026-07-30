"use client";

import { Fragment } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  buildCurriculumSections,
  getAssignmentKey,
  getClassesForYear,
} from "@/lib/curriculum/build-curriculum-rows";
import type { ProgramWithRelations } from "@/types";
import { CurriculumCell } from "./curriculum-cell";
import { CalendarClock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";

type ProgramAssignmentTableProps = {
  program: ProgramWithRelations;
  pendingAssignmentKey: string | null;
  onAssignTeacher: (input: {
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
    teacherId: number;
  }) => void;
  onRemoveAssignment: (input: {
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
    teacherId: number;
  }) => void;
  onSelectSlot: (input: {
    programId: number;
    subjectId: number;
    yearId: number;
    classId: number;
  }) => void;
};

export function ProgramAssignmentTable({
  program,
  pendingAssignmentKey,
  onAssignTeacher,
  onRemoveAssignment,
  onSelectSlot
}: ProgramAssignmentTableProps) {
  const years = program.programYears;
  const sections = buildCurriculumSections(program);
  const isMobile = useIsMobile();


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
                <th className="sticky  left-0 z-10 w-10 min-w-10 max-w-10 border-r bg-muted px-1 py-2 text-center text-xs font-medium md:w-16 md:min-w-16 md:max-w-20 md:px-2">
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
                      className="px-3 py-2 text-xs font-semibold tracking-wide text-primary-foreground bg-primary/50 uppercase"
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
                        const classes = getClassesForYear(
                          program,
                          programYear.yearId,
                        );
                        const cellHasPending = classes.some(
                          (programClass) =>
                            pendingAssignmentKey ===
                            getAssignmentKey(
                              program.id,
                              row.subjectId,
                              programYear.yearId,
                              programClass.id,
                            ),
                        );

                        return (
                          <td
                            key={programYear.yearId}
                            className="border-r px-1 py-1 align-top last:border-r-0"
                          >
                            <CurriculumCell
                              programSubject={programSubject}
                              classes={classes}
                              onClick={(programClassId: number) => {
                                onSelectSlot({
                                  programId: program.id,
                                  subjectId: row.subjectId,
                                  yearId: programYear.yearId,
                                  classId: programClassId,
                                })
                              }}
                              pendingClassId={
                                classes.find(
                                  (programClass) =>
                                    pendingAssignmentKey ===
                                    getAssignmentKey(
                                      program.id,
                                      row.subjectId,
                                      programYear.yearId,
                                      programClass.id,
                                    ),
                                )?.id ?? null
                              }
                              disabled={
                                pendingAssignmentKey !== null && !cellHasPending
                              }
                              onAssign={(classId, teacherId) =>
                                onAssignTeacher({
                                  programId: program.id,
                                  subjectId: row.subjectId,
                                  yearId: programYear.yearId,
                                  classId,
                                  teacherId,
                                })
                              }
                              onRemove={(classId, teacherId) =>
                                onRemoveAssignment({
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
  );
}
