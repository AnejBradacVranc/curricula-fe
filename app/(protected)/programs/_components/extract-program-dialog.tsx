"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Loader2, ScanText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractProgram, importProgram } from "@/lib/api";
import { formatHours } from "@/lib/curriculum/format-hours";
import type {
  Category,
  ImportProgramRequest,
  ResolvedExtractProgram,
  ResolvedExtractProgramSubject,
} from "@/types";
import { toast } from "sonner";

type Step = "extract" | "configure";

type NewSubjectDraft = {
  key: string;
  name: string;
  abbrevation: string | null;
  categoryId: string;
};

type ExtractProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onImported?: () => void | Promise<void>;
};

function collectNewSubjects(
  preview: ResolvedExtractProgram,
): ResolvedExtractProgramSubject[] {
  const byName = new Map<string, ResolvedExtractProgramSubject>();

  for (const year of preview.years) {
    for (const subject of year.subjects) {
      if (!subject.isNew) {
        continue;
      }

      const key = subject.name.trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, subject);
      }
    }
  }

  return [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "sl"),
  );
}

export function ExtractProgramDialog({
  open,
  onOpenChange,
  categories,
  onImported,
}: ExtractProgramDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("extract");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ResolvedExtractProgram | null>(null);
  const [newSubjects, setNewSubjects] = useState<NewSubjectDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("extract");
      setFile(null);
      setPreview(null);
      setNewSubjects([]);
      setError(null);
      setIsExtracting(false);
      setIsImporting(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [open]);

  const newSubjectCount = useMemo(() => {
    if (!preview) {
      return 0;
    }
    return collectNewSubjects(preview).length;
  }, [preview]);

  const allNewSubjectsConfigured = useMemo(
    () =>
      newSubjects.length === 0 ||
      newSubjects.every((subject) => subject.categoryId),
    [newSubjects],
  );

  async function handleExtract() {
    if (!file) {
      setError("Izberite datoteko.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setPreview(null);
    setNewSubjects([]);
    setStep("extract");

    try {
      const program = await extractProgram(file);
      setPreview(program);
    } catch {
      setError(
        "Programa ni bilo mogoče razbrati iz datoteke. Poskusite znova.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function handleContinueToConfigure() {
    if (!preview) {
      return;
    }

    const drafts = collectNewSubjects(preview).map((subject) => ({
      key: subject.name.trim().toLowerCase(),
      name: subject.name,
      abbrevation: subject.abbrevation,
      categoryId: subject.categoryId ? String(subject.categoryId) : "",
    }));

    setNewSubjects(drafts);
    setError(null);
    setStep("configure");
  }

  function updateNewSubject(
    key: string,
    patch: Partial<Pick<NewSubjectDraft, "categoryId">>,
  ) {
    setNewSubjects((current) =>
      current.map((subject) =>
        subject.key === key ? { ...subject, ...patch } : subject,
      ),
    );
  }

  function buildImportPayload(): ImportProgramRequest | null {
    if (!preview) {
      return null;
    }

    const categoryByKey = new Map(
      newSubjects.map((subject) => [subject.key, Number(subject.categoryId)]),
    );

    const unresolvedYears = preview.years.filter((year) => year.yearId == null);
    if (unresolvedYears.length > 0) {
      setError(
        `Neznani letniki: ${unresolvedYears.map((y) => y.yearName).join(", ")}. Uvoz ni mogoč.`,
      );
      return null;
    }

    return {
      name: preview.name,
      years: preview.years.map((year) => ({
        yearId: year.yearId!,
        numWeeks: year.numWeeks,
        subjects: year.subjects.map((subject) => {
          if (!subject.isNew && subject.subjectId != null) {
            return {
              subjectId: subject.subjectId,
              requiredHours: subject.requiredHours,
            };
          }

          const key = subject.name.trim().toLowerCase();
          const categoryId =
            categoryByKey.get(key) ?? subject.categoryId ?? undefined;
          const abbrevation =
            subject.abbrevation?.trim() ||
            subject.name.trim().slice(0, 3).toUpperCase();

          return {
            name: subject.name.trim(),
            abbrevation,
            categoryId,
            requiredHours: subject.requiredHours,
          };
        }),
      })),
    };
  }

  async function handleImport() {
    if (!preview || !allNewSubjectsConfigured) {
      return;
    }

    const payload = buildImportPayload();
    if (!payload) {
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      await importProgram(payload);
      toast.success("Program je bil uspešno uvožen.", {
        description: preview.name,
      });
      onOpenChange(false);
      await onImported?.();
    } catch {
      setError("Programa ni bilo mogoče uvoziti. Poskusite znova.");
      setIsImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Uvoz programa</DialogTitle>
          <DialogDescription>
            {step === "extract"
              ? "Naložite izvedbeni predmetnik. AI bo razbral program, letnike in predmete."
              : newSubjects.length === 0
                ? "Ni manjkajočih podatkov. Vse predmete lahko povežete z obstoječimi v katalogu."
                : "Dopolnite manjkajoče podatke za nove predmete. Uvoz je mogoč šele, ko so vse kategorije izbrane."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {step === "extract" ? (
            <>
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    setFile(nextFile);
                    setPreview(null);
                    setNewSubjects([]);
                    setError(null);
                    setStep("extract");
                  }}
                />
                {file && (
                  <p className="text-xs text-muted-foreground">
                    Izbrano: {file.name} ({Math.round(file.size / 1024)} KB)
                  </p>
                )}
              </div>

              {preview && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{preview.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {preview.years.length}{" "}
                      {preview.years.length === 1 ? "letnik" : "letniki"}
                      {newSubjectCount > 0
                        ? ` · ${newSubjectCount} novih predmetov`
                        : null}
                    </p>
                  </div>

                  {preview.years.map((year) => (
                    <div
                      key={year.yearName}
                      className="overflow-hidden rounded-md border"
                    >
                      <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {year.yearName}
                          </span>
                          {year.yearId == null && (
                            <Badge variant="destructive">Neznan letnik</Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {year.numWeeks} tednov · {year.subjects.length}{" "}
                          predmetov
                        </span>
                      </div>

                      {year.subjects.length === 0 ? (
                        <p className="px-3 py-3 text-sm text-muted-foreground">
                          Ni predmetov za ta letnik.
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-xs text-muted-foreground">
                              <th className="px-3 py-2 font-medium">Predmet</th>
                              <th className="px-3 py-2 font-medium">
                                Kategorija
                              </th>
                              <th className="px-3 py-2 text-right font-medium">
                                Ure
                              </th>
                              <th className="px-3 py-2 text-right font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {year.subjects.map((subject, index) => (
                              <tr
                                key={`${year.yearName}-${subject.name}-${index}`}
                                className="border-b border-border/70 last:border-b-0"
                              >
                                <td className="px-3 py-2">
                                  <div className="flex min-w-0 items-baseline gap-2">
                                    {subject.abbrevation ? (
                                      <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {subject.abbrevation}
                                      </span>
                                    ) : null}
                                    <span className="min-w-0 truncate font-medium">
                                      {subject.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">
                                  {subject.categoryName ?? "—"}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums">
                                  {formatHours(subject.requiredHours)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {subject.isNew ? (
                                    <Badge>Nov</Badge>
                                  ) : (
                                    <Badge variant="secondary">Obstaja</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {newSubjects.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-8 text-center">
                  <CheckCircle2 className="size-8 text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium">Ničesar ni treba nastaviti</p>
                    <p className="text-sm text-muted-foreground">
                      Vsi razbrani predmeti že obstajajo. Lahko nadaljujete z
                      uvozom programa.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Za vsak nov predmet izberite kategorijo.
                  </p>
                  <ul className="space-y-3">
                    {newSubjects.map((subject) => (
                      <li
                        key={subject.key}
                        className="space-y-3 rounded-md border p-3"
                      >
                        <div className="flex min-w-0 items-baseline gap-2">
                          {subject.abbrevation ? (
                            <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                              {subject.abbrevation}
                            </span>
                          ) : null}
                          <span className="min-w-0 truncate font-medium">
                            {subject.name}
                          </span>
                          <Badge className="shrink-0">Nov</Badge>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`category-${subject.key}`}>
                            Kategorija
                          </Label>
                          <Select
                            value={subject.categoryId || undefined}
                            onValueChange={(value) =>
                              updateNewSubject(subject.key, {
                                categoryId: String(value ?? ""),
                              })
                            }
                            disabled={categories.length === 0}
                            modal={false}
                            items={categories.map((category) => ({
                              value: String(category.id),
                              label: category.name,
                            }))}
                          >
                            <SelectTrigger
                              id={`category-${subject.key}`}
                              className="w-full"
                            >
                              <SelectValue placeholder="Izberite kategorijo …" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={`category-${subject.key}-${category.id}`}
                                  value={String(category.id)}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          {step === "configure" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("extract");
                  setError(null);
                }}
                disabled={isImporting}
              >
                <ArrowLeft />
                Nazaj
              </Button>
              <Button
                type="button"
                onClick={() => void handleImport()}
                disabled={!allNewSubjectsConfigured || isImporting}
              >
                {isImporting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FileUp />
                )}
                {isImporting ? "Uvažanje..." : "Uvozi program"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isExtracting}
              >
                Prekliči
              </Button>
              {!preview ? (
                <Button
                  type="button"
                  onClick={() => void handleExtract()}
                  disabled={!file || isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ScanText />
                  )}
                  {isExtracting ? "Razbiranje..." : "Razberi iz datoteke"}
                </Button>
              ) : (
                <Button type="button" onClick={handleContinueToConfigure}>
                  Naprej
                  <ArrowRight />
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
