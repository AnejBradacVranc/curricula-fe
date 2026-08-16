"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/queries/categories/queries";
import {
  useCreateSubject,
  useUpdateSubject,
} from "@/lib/queries/subjects/mutations";
import type { Subject } from "@/types";

type SubjectDialogProps = {
  open: boolean;
  editingSubject: Subject | null;
  onOpenChange: (open: boolean) => void;
};

export function SubjectDialog({
  open,
  editingSubject,
  onOpenChange,
}: SubjectDialogProps) {
  const isEditing = editingSubject !== null;

  const { data: categories = [] } = useCategories({ enabled: open });
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

  const [name, setName] = useState("");
  const [abbrevation, setAbbrevation] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValidationError(null);
    setName(editingSubject?.name ?? "");
    setAbbrevation(editingSubject?.abbrevation ?? "");
    setCategoryId(editingSubject?.categoryId ?? null);
  }, [open, editingSubject]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setValidationError(null);
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedAbbrevation = abbrevation.trim();

    if (!trimmedName) {
      setValidationError("Vnesite ime predmeta.");
      return;
    }

    if (!trimmedAbbrevation) {
      setValidationError("Vnesite kratico predmeta.");
      return;
    }

    if (!categoryId) {
      setValidationError("Izberite kategorijo.");
      return;
    }

    setValidationError(null);

    try {
      if (isEditing && editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          name: trimmedName,
          abbrevation: trimmedAbbrevation,
          categoryId,
        });
        toast.success("Predmet je bil uspešno posodobljen.");
      } else {
        await createSubjectMutation.mutateAsync({
          name: trimmedName,
          abbrevation: trimmedAbbrevation,
          categoryId,
        });
        toast.success("Predmet je bil uspešno ustvarjen.");
      }

      handleOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? "Predmeta ni bilo mogoče posodobiti. Poskusite znova."
          : "Predmeta ni bilo mogoče ustvariti. Poskusite znova.",
      );
    }
  }

  const isSubmitting =
    createSubjectMutation.isPending || updateSubjectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Urejanje predmeta" : "Nov predmet"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Posodobite ime, kratico ali kategorijo predmeta."
              : "Izberite kategorijo in vnesite ime ter kratico predmeta."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-category">Kategorija</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isSubmitting || categories.length === 0}
              modal={false}
              items={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            >
              <SelectTrigger id="subject-category" className="w-full">
                <SelectValue placeholder="Izberite kategorijo …" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={`category-${category.id}`}
                    value={category.id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-name">Ime predmeta</Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="npr. Matematika"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-abbrevation">Kratica</Label>
            <Input
              id="subject-abbrevation"
              value={abbrevation}
              onChange={(event) => setAbbrevation(event.target.value)}
              placeholder="npr. MAT"
              disabled={isSubmitting}
            />
          </div>

          {validationError && (
            <p className="text-sm text-destructive" role="alert">
              {validationError}
            </p>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Prekliči
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? <Pencil /> : <Plus />}
              {isSubmitting
                ? "Shranjevanje..."
                : isEditing
                  ? "Shrani spremembe"
                  : "Ustvari predmet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
