"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { ProgramYearDialog } from "@/app/(protected)/programs/_components/program-year-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProgramWithRelations, ProgramYear } from "@/types";

type ProgramYearsSectionProps = {
  program: ProgramWithRelations;
  onProgramYearSaved?: () => void | Promise<void>;
};

export function ProgramYearsSection({
  program,
  onProgramYearSaved,
}: ProgramYearsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgramYear, setEditingProgramYear] =
    useState<ProgramYear | null>(null);

  const programYears = [...program.programYears].sort(
    (a, b) => a.yearId - b.yearId,
  );

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

                {programYear.classes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {programYear.classes.map((programClass) => (
                      <Badge
                        key={programClass.id}
                        variant="default"
                        className="font-normal"
                      >
                        {programYear.year.name.slice(0, 1)}.{" "}
                        {programClass.label.label.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <ProgramYearDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        programId={program.id}
        programYears={program.programYears}
        editingProgramYear={editingProgramYear}
        onProgramYearSaved={onProgramYearSaved}
      />
    </>
  );
}
