"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  formatClassLabel,
  formatYearLabel,
} from "@/lib/curriculum/format-year";
import { useProgram } from "@/lib/queries/programs/queries";
import { cn } from "@/lib/utils";
import type { ProgramClass, ProgramYear } from "@/types";

import { CreateClassDialog } from "./create-class-dialog";
import { CreateProgramYearDialog } from "./create-program-year-dialog";
import { DeleteClassDialog } from "./delete-class-dialog";
import { DeleteProgramYearDialog } from "./delete-program-year-dialog";
import { UpdateProgramYearDialog } from "./update-program-year-dialog";

type ProgramYearsSectionProps = {
  programId: number;
};

type DeleteClassTarget = {
  programYear: ProgramYear;
  programClass: ProgramClass;
};

export function ProgramYearsSection({ programId }: ProgramYearsSectionProps) {
  const [isCreateProgramYearOpen, setIsCreateProgramYearOpen] = useState(false);
  const [updatingProgramYear, setUpdatingProgramYear] =
    useState<ProgramYear | null>(null);
  const [creatingClassForYear, setCreatingClassForYear] =
    useState<ProgramYear | null>(null);
  const [deletingProgramYear, setDeletingProgramYear] =
    useState<ProgramYear | null>(null);
  const [deletingTarget, setDeletingTarget] =
    useState<DeleteClassTarget | null>(null);

  const { data: program } = useProgram(programId);
  const programYears = program?.programYears ?? [];
  const isMobile = useIsMobile();

  return (
    <>
      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Letniki</CardTitle>
              <CardDescription>
                Pregled letnikov in razredov v programu.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={() => setIsCreateProgramYearOpen(true)}
            >
              <Plus />
              {!isMobile && "Dodaj letnik"}
            </Button>
          </div>
        </CardHeader>

        {programYears.length === 0 ? (
          <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
            Ta program še nima dodeljenih letnikov.
          </CardContent>
        ) : (
          <CardContent className="flex flex-wrap gap-3 p-4">
            {programYears.map((programYear) => (
              <div
                key={programYear.yearId}
                className="min-w-40 flex-1 rounded-lg border bg-muted p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      {formatYearLabel(programYear.year.year)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {programYear.numWeeks} tednov
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      aria-label={`Uredi ${formatYearLabel(programYear.year.year)}`}
                      onClick={() => setUpdatingProgramYear(programYear)}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      aria-label={`Odstrani ${formatYearLabel(programYear.year.year)}`}
                      onClick={() => setDeletingProgramYear(programYear)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {programYear.classes.map((programClass) => {
                    const label = formatClassLabel(
                      programYear.year.year,
                      programClass.label,
                    );

                    return (
                      <Badge
                        key={programClass.id}
                        variant="default"
                        render={
                          <button
                            type="button"
                            aria-label={`Izbriši razred ${label}`}
                            onClick={() =>
                              setDeletingTarget({ programYear, programClass })
                            }
                          />
                        }
                        className={cn(
                          "cursor-pointer font-normal transition-[filter,opacity] duration-200",
                          "hover:brightness-110",
                        )}
                      >
                        <span className="relative inline-flex items-center justify-center">
                          <span
                            className={cn(
                              "transition-opacity duration-200",
                              "group-hover/badge:opacity-0 group-focus-visible/badge:opacity-0",
                            )}
                          >
                            {label}
                          </span>
                          <Trash2
                            className={cn(
                              "pointer-events-none absolute size-3! opacity-0 transition-opacity duration-200",
                              "group-hover/badge:opacity-100 group-focus-visible/badge:opacity-100",
                            )}
                            aria-hidden
                          />
                        </span>
                        <span className="sr-only">Izbriši</span>
                      </Badge>
                    );
                  })}

                  <Badge
                    variant="outline"
                    render={
                      <button
                        type="button"
                        aria-label={`Dodaj razred v ${formatYearLabel(programYear.year.year)}`}
                        onClick={() => setCreatingClassForYear(programYear)}
                      />
                    }
                    className={cn(
                      "min-w-8 cursor-pointer px-1.5 transition-[transform,background-color,border-color,color,box-shadow] duration-200",
                      "hover:scale-[1.06] hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                      "active:scale-[0.96]",
                    )}
                  >
                    <Plus className="size-3!" />
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <CreateProgramYearDialog
        open={isCreateProgramYearOpen}
        onOpenChange={setIsCreateProgramYearOpen}
        programId={programId}
      />

      <UpdateProgramYearDialog
        open={updatingProgramYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUpdatingProgramYear(null);
          }
        }}
        programId={programId}
        programYear={updatingProgramYear}
      />

      <CreateClassDialog
        open={creatingClassForYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreatingClassForYear(null);
          }
        }}
        programId={programId}
        programYear={creatingClassForYear}
      />

      <DeleteClassDialog
        open={deletingTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTarget(null);
          }
        }}
        programId={programId}
        target={deletingTarget}
      />

      <DeleteProgramYearDialog
        open={deletingProgramYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProgramYear(null);
          }
        }}
        programId={programId}
        programYear={deletingProgramYear}
      />
    </>
  );
}
