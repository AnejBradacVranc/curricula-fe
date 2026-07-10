"use client";

import { Fragment } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, sumHours } from "@/lib/curriculum/format-hours";
import type { ProgramWithRelations } from "@/types";

type ProgramSubjectsTableProps = {
  program: ProgramWithRelations;
};

export function ProgramSubjectsTable({ program }: ProgramSubjectsTableProps) {
  const years = [...program.programYears].sort((a, b) => a.yearId - b.yearId);

  const sections = years
    .map((programYear) => {
      const subjects = program.programSubjects
        .filter((item) => item.yearId === programYear.yearId)
        .sort((a, b) =>
          a.subject.name.localeCompare(b.subject.name, "sl"),
        );

      return {
        programYear,
        subjects,
        totalHours: sumHours(subjects.map((item) => item.requiredHours)),
      };
    })
    .filter((section) => section.subjects.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Predmeti</CardTitle>
        <p className="text-sm text-muted-foreground">
          Predmeti po letnikih z zahtevanimi urami na teden.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[480px] border-collapse text-sm">
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
            </tr>
          </thead>
          <tbody>
            {sections.map((section, sectionIndex) => (
              <Fragment key={section.programYear.yearId}>
                <tr className="border-b bg-muted/40">
                  <td
                    colSpan={3}
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
                </tr>

                {sectionIndex < sections.length - 1 && (
                  <tr aria-hidden="true">
                    <td colSpan={3} className="h-1 bg-muted/10 p-0" />
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
