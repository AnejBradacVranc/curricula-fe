"use client";

import { Fragment, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { AssignSubjectDialog } from "@/app/(protected)/programs/_components/assign-subject-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, sumHours } from "@/lib/curriculum/format-hours";
import type { ProgramSubjectItem, ProgramWithRelations } from "@/types";

type ProgramSubjectsTableProps = {
  program: ProgramWithRelations;
  onSubjectSaved?: () => void | Promise<void>;
};

export function ProgramSubjectsTable({
  program,
  onSubjectSaved,
}: ProgramSubjectsTableProps) {
  const years = [...program.programYears].sort((a, b) => a.yearId - b.yearId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgramSubject, setEditingProgramSubject] =
    useState<ProgramSubjectItem | null>(null);

  const sections = years
    .map((programYear) => {
      const subjects = program.programSubjects
        .filter((item) => item.yearId === programYear.yearId)
        .sort((a, b) => a.subject.name.localeCompare(b.subject.name, "sl"));

      return {
        programYear,
        subjects,
        totalHours: sumHours(subjects.map((item) => item.requiredHours)),
      };
    })
    .filter((section) => section.subjects.length > 0);

  function openCreateDialog() {
    setEditingProgramSubject(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(programSubject: ProgramSubjectItem) {
    setEditingProgramSubject(programSubject);
    setIsDialogOpen(true);
  }

  return (
    <>
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Predmeti</CardTitle>
              <p className="text-sm text-muted-foreground">
                Predmeti po letnikih z zahtevanimi urami na teden.
              </p>
            </div>
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              Dodaj
            </Button>
          </div>
        </CardHeader>

        {sections.length === 0 ? (
          <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
            Ta program še nima dodeljenih predmetov.
          </CardContent>
        ) : (
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-4 py-2.5 text-left text-xs font-medium">
                    Predmet
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium">
                    Kategorija
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium">
                    Ure / teden
                  </th>
                  <th className="w-12 px-2 py-2.5">
                    <span className="sr-only">Dejanja</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, sectionIndex) => (
                  <Fragment key={section.programYear.yearId}>
                    <tr className="border-b bg-muted/40">
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                      >
                        {section.programYear.year.name}
                        <span className="ml-2 font-normal normal-case text-muted-foreground/80">
                          · {section.programYear.numWeeks} tednov
                        </span>
                      </td>
                    </tr>

                    {section.subjects.map((item) => (
                      <tr
                        key={`${item.subjectId}-${item.yearId}`}
                        className="border-b border-border/70 hover:bg-muted/10"
                      >
                        <td className="px-4 py-2.5 align-top">
                          <div className="flex items-baseline gap-2">
                            <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                              {item.subject.abbrevation}
                            </span>
                            <span className="min-w-0 truncate font-medium">
                              {item.subject.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 align-top text-muted-foreground">
                          {item.subject.category?.name ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right align-top tabular-nums font-medium">
                          {formatHours(item.requiredHours)}
                        </td>
                        <td className="px-2 py-2.5 text-right align-top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
                            aria-label={`Uredi ${item.subject.name}`}
                            onClick={() => openEditDialog(item)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}

                    <tr className="border-b bg-muted/20 font-medium">
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-xs text-muted-foreground"
                      >
                        Skupaj ur / teden
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatHours(section.totalHours)}
                      </td>
                      <td />
                    </tr>

                    {sectionIndex < sections.length - 1 && (
                      <tr aria-hidden="true">
                        <td colSpan={4} className="h-1 bg-muted/10 p-0" />
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </CardContent>
        )}
      </Card>

      <AssignSubjectDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProgramSubject(null);
          }
        }}
        programYears={program.programYears}
        programSubjects={program.programSubjects}
        programId={program.id}
        editingProgramSubject={editingProgramSubject}
        onSubjectSaved={onSubjectSaved}
      />
    </>
  );
}
