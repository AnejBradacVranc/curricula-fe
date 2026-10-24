"use client";

import { useEffect, useState } from "react";
import { FileUp, Loader2, ScanText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileInput } from "@/components/ui/file-input";
import { useExtractTeachers } from "@/lib/queries/extract/mutations";
import { useCreateTeachers } from "@/lib/queries/teachers/mutations";
import type { ExtractedTeacher } from "@/types";

type ExtractTeachersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExtractTeachersDialog({
  open,
  onOpenChange,
}: ExtractTeachersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExtractedTeacher[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractTeachersMutation = useExtractTeachers();
  const createTeachersMutation = useCreateTeachers();

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setError(null);
    }
  }, [open]);

  async function handleExtract() {
    if (!file) {
      setError("Izberite datoteko.");
      return;
    }

    setError(null);
    setPreview(null);

    try {
      const teachers = await extractTeachersMutation.mutateAsync(file);
      setPreview(teachers);
    } catch {
      setError(
        "Učiteljev ni bilo mogoče razbrati iz datoteke. Poskusite znova.",
      );
    }
  }

  function removePreviewRow(index: number) {
    setPreview((current) =>
      current ? current.filter((_, i) => i !== index) : current,
    );
  }

  async function handleImport() {
    if (!preview?.length) {
      setError("Ni učiteljev za uvoz.");
      return;
    }

    setError(null);

    try {
      await createTeachersMutation.mutateAsync({
        teachers: preview.map((teacher) => ({
          ...teacher,
          assignedHours: 0,
        })),
      });
      toast.success("Učitelji so bili uspešno uvoženi.", {
        description: `${preview.length} učiteljev`,
      });
      onOpenChange(false);
    } catch {
      setError("Učiteljev ni bilo mogoče uvoziti. Poskusite znova.");
    }
  }

  const isExtracting = extractTeachersMutation.isPending;
  const isImporting = createTeachersMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,800px)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Uvoz učiteljev</DialogTitle>
          <DialogDescription>
            Naložite PDF, CSV, Excel ali Word datoteko. AI bo razbral ime,
            priimek in e-pošto, če je na voljo. Pred uvozom lahko pregledate
            rezultate.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          <FileInput
            accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            file={file}
            onFileChange={(nextFile) => {
              setFile(nextFile);
              setPreview(null);
              setError(null);
            }}
          />

          {preview && preview.length > 0 && (
            <div className="overflow-hidden rounded-md border">
              <div className="border-b bg-muted/20 px-3 py-2">
                <p className="text-sm font-medium">
                  {preview.length}{" "}
                  {preview.length === 1 ? "učitelj" : "učiteljev"}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="sticky top-0 border-b bg-muted/20 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Ime</th>
                      <th className="px-3 py-2 font-medium">Priimek</th>
                      <th className="px-3 py-2 font-medium">E-pošta</th>
                      <th className="w-10 px-2 py-2">
                        <span className="sr-only">Odstrani</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((teacher, index) => (
                      <tr
                        key={`${teacher.name}-${teacher.surname}-${index}`}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-3 py-2 font-medium">{teacher.name}</td>
                        <td className="px-3 py-2">{teacher.surname}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {teacher.email ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Odstrani ${teacher.name} ${teacher.surname}`}
                            onClick={() => removePreviewRow(index)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {preview && preview.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Vsi razbrani učitelji so bili odstranjeni.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExtracting || isImporting}
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
            <Button
              type="button"
              onClick={() => void handleImport()}
              disabled={!preview.length || isImporting}
            >
              {isImporting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FileUp />
              )}
              {isImporting ? "Uvažanje..." : "Uvozi učitelje"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
