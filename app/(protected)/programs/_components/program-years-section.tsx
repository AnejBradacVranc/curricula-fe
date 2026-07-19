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
import { cn } from "@/lib/utils";
import type {
  ProgramClass,
  ProgramWithRelations,
  ProgramYear,
  Year,
} from "@/types";
import { ProgramYearDialog } from "./program-year-dialog";
import { CreateClassDialog } from "./create-class-dialog";
import { DeleteClassDialog } from "./delete-class-dialog";

type ProgramYearsSectionProps = {
  program: ProgramWithRelations;
  years: Year[];
  onProgramYearSaved?: () => void | Promise<void>;
};

type DeleteClassTarget = {
  programYear: ProgramYear;
  programClass: ProgramClass;
};

export function ProgramYearsSection({
  program,
  years,
  onProgramYearSaved,
}: ProgramYearsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgramYear, setEditingProgramYear] =
    useState<ProgramYear | null>(null);
  const [addingProgramYear, setAddingProgramYear] =
    useState<ProgramYear | null>(null);
  const [deletingTarget, setDeletingTarget] =
    useState<DeleteClassTarget | null>(null);

  const programYears = program.programYears;

  function openCreateDialog() {
    setEditingProgramYear(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(programYear: ProgramYear) {
    setEditingProgramYear(programYear);
    setIsDialogOpen(true);
  }

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
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              Dodaj letnik
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
                className="min-w-[160px] flex-1 rounded-lg border bg-muted p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">
                      {programYear.year.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {programYear.numWeeks} tednov
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground"
                    aria-label={`Uredi ${programYear.year.name}`}
                    onClick={() => openEditDialog(programYear)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {programYear.classes.map((programClass) => {
                    const label = `${programYear.year.name.slice(0, 1)}. ${programClass.label.toUpperCase()}`;

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
                        aria-label={`Dodaj razred v ${programYear.year.name}`}
                        onClick={() => setAddingProgramYear(programYear)}
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

      <ProgramYearDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        programId={program.id}
        years={years}
        programYears={program.programYears}
        editingProgramYear={editingProgramYear}
        onProgramYearSaved={onProgramYearSaved}
      />

      <CreateClassDialog
        open={addingProgramYear !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddingProgramYear(null);
          }
        }}
        programId={program.id}
        programYear={addingProgramYear}
        onCreated={onProgramYearSaved}
      />

      <DeleteClassDialog
        open={deletingTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTarget(null);
          }
        }}
        programId={program.id}
        target={deletingTarget}
        onDeleted={onProgramYearSaved}
      />
    </>
  );
}
