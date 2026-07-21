"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { AssignSubjectDialog } from "@/app/(protected)/programs/_components/assign-subject-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, sumHours } from "@/lib/curriculum/format-hours";
import type {
  ProgramSubjectItem,
  ProgramWithRelations,
  Subject,
} from "@/types";

type ProgramSubjectsTableProps = {
  program: ProgramWithRelations;
  subjects: Subject[];
  onSubjectSaved?: () => void | Promise<void>;
};

export function ProgramSubjectsTable({
  program,
  subjects,
  onSubjectSaved,
}: ProgramSubjectsTableProps) {
  const years = program.programYears;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgramSubject, setEditingProgramSubject] =
    useState<ProgramSubjectItem | null>(null);

  const sections = years
    .map((programYear) => {
      const yearSubjects = program.programSubjects
        .filter((item) => item.yearId === programYear.yearId)
        .sort((a, b) => a.subject.name.localeCompare(b.subject.name, "sl"));

      return {
        programYear,
        subjects: yearSubjects,
        totalHours: sumHours(yearSubjects.map((item) => item.requiredHours)),
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
              Dodaj predmet
            </Button>
          </div>
        </CardHeader>

        {sections.length === 0 ? (
          <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
            Ta program še nima dodeljenih predmetov.
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Accordion
              multiple
              defaultValue={sections.map((section) =>
                String(section.programYear.yearId),
              )}
              className="w-full"
            >
              {sections.map((section) => (
                <AccordionItem
                  key={section.programYear.yearId}
                  value={String(section.programYear.yearId)}
                  className="border-b px-4 last:border-b-0"
                >
                  <AccordionTrigger className="cursor-pointer hover:no-underline">
                    <span className="flex items-baseline gap-2">
                      <span className="text-md font-semibold tracking-wide text-primary uppercase">
                        {section.programYear.year.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground/80">
                        · {section.programYear.numWeeks} tednov
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <div className="overflow-x-auto rounded-md border">
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
                              <td className="px-4 py-2.5 text-right align-top font-medium tabular-nums">
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

                          <tr className="bg-muted/20 font-medium">
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
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
        subjects={subjects}
        programId={program.id}
        editingProgramSubject={editingProgramSubject}
        onSubjectSaved={onSubjectSaved}
      />
    </>
  );
}
