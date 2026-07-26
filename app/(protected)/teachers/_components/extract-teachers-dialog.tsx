"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, Trash2, Upload } from "lucide-react";
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
import { createTeachers, extractTeachers } from "@/lib/api";
import type { ExtractedTeacher } from "@/types";

type ExtractTeachersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtracted?: () => void | Promise<void>;
};

export function ExtractTeachersDialog({
  open,
  onOpenChange,
  onExtracted,
}: ExtractTeachersDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ExtractedTeacher[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setError(null);
      setIsExtracting(false);
      setIsSaving(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [open]);

  async function handleExtract() {
    if (!file) {
      setError("Izberite datoteko.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setPreview(null);

    try {
      const teachers = await extractTeachers(file);
      setPreview(teachers);
    } catch {
      setError(
        "Učiteljev ni bilo mogoče razbrati iz datoteke. Poskusite znova.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function removePreviewRow(index: number) {
    setPreview((current) =>
      current ? current.filter((_, i) => i !== index) : current,
    );
  }

  async function handleSave() {
    if (!preview?.length) {
      setError("Ni učiteljev za shranjevanje.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createTeachers({
        teachers: preview.map((teacher) => ({
          ...teacher,
          assignedHours: 0,
        })),
      });
      toast.success("Učitelji so bili uspešno shranjeni.", {
        description: `${preview.length} učiteljev`,
      });
      onOpenChange(false);
      await onExtracted?.();
    } catch {
      setError(
        "Učiteljev ni bilo mogoče shraniti. Preverite, ali e-poštni naslovi že obstajajo.",
      );
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Uvoz učiteljev</DialogTitle>
          <DialogDescription>
            Naložite PDF, CSV, Excel ali Word datoteko. AI bo razbral ime,
            priimek in e-pošto. Pred shranjevanjem lahko pregledate rezultate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                setError(null);
              }}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Izbrano: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {preview && preview.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-md border">
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
                      key={`${teacher.email}-${index}`}
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-3 py-2">{teacher.name}</td>
                      <td className="px-3 py-2">{teacher.surname}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {teacher.email}
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
            disabled={isExtracting || isSaving}
          >
            Prekliči
          </Button>
          {!preview ? (
            <Button
              type="button"
              onClick={() => void handleExtract()}
              disabled={!file || isExtracting}
            >
              {isExtracting ? <Loader2 className="animate-spin" /> : <Upload />}
              {isExtracting ? "Razbiranje..." : "Razberi iz datoteke"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!preview.length || isSaving}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <FileUp />}
              {isSaving
                ? "Shranjevanje..."
                : `Shrani`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
