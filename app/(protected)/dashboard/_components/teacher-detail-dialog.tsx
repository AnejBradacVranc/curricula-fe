"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Mail,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createAdditionalActivityAssignment,
  deleteAdditionalActivityAssignment,
  getAdditionalActivities,
  getTeacher,
} from "@/lib/api";
import { formatHours } from "@/lib/curriculum/format-hours";
import type { AdditionalActivity, TeacherDetail } from "@/types";

type TeacherDetailDialogProps = {
  teacherId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherUpdated?: () => void;
};

function TeacherDetailSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export function TeacherDetailDialog({
  teacherId,
  open,
  onOpenChange,
  onTeacherUpdated,
}: TeacherDetailDialogProps) {
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [activities, setActivities] = useState<AdditionalActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null,
  );
  const [hoursInput, setHoursInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const loadTeacher = useCallback(async (id: number) => {
    const data = await getTeacher(id);
    setTeacher(data);
    return data;
  }, []);

  useEffect(() => {
    if (!open || teacherId === null) {
      return;
    }

    const selectedTeacherId = teacherId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setTeacher(null);
      setSelectedActivityId(null);
      setHoursInput("");
      setValidationError(null);

      try {
        const [teacherData, activitiesData] = await Promise.all([
          getTeacher(selectedTeacherId),
          getAdditionalActivities(),
        ]);

        if (!cancelled) {
          setTeacher(teacherData);
          setActivities(activitiesData);
        }
      } catch {
        if (!cancelled) {
          toast.error("Podatkov o učitelju ni bilo mogoče naložiti.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, teacherId]);

  const handleAddAdditionalHours = async () => {
    if (!teacher || selectedActivityId === null) {
      setValidationError("Izberite dejavnost.");
      return;
    }

    const hoursAmount = Number(hoursInput);
    if (Number.isNaN(hoursAmount) || hoursAmount < 0) {
      setValidationError("Vnesite veljavno število ur.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await createAdditionalActivityAssignment({
        teacherId: teacher.id,
        additionalActivityId: selectedActivityId,
        hoursAmount,
      });
      await loadTeacher(teacher.id);
      onTeacherUpdated?.();
      setSelectedActivityId(null);
      setHoursInput("");
      toast.success("Dodatne ure so bile uspešno dodane.");
    } catch {
      toast.error("Dodajanje dodatnih ur ni uspelo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdditionalHours = async (additionalActivityId: number) => {
    if (!teacher) {
      return;
    }

    const key = String(additionalActivityId);
    setRemovingKey(key);

    try {
      await deleteAdditionalActivityAssignment({
        teacherId: teacher.id,
        additionalActivityId,
      });
      await loadTeacher(teacher.id);
      onTeacherUpdated?.();
      toast.success("Dodatne ure so bile odstranjene.");
    } catch {
      toast.error("Odstranitev dodatnih ur ni uspela.");
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(88vh,800px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {isLoading ? (
          <>
            <DialogHeader className="shrink-0 border-b px-4 pt-4 pb-3">
              <DialogTitle>Nalaganje učitelja</DialogTitle>
              <DialogDescription>Prosimo počakajte …</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <TeacherDetailSkeleton />
              </ScrollArea>
            </div>
          </>
        ) : teacher ? (
          <>
            <DialogHeader className="shrink-0 border-b px-4 pt-4 pb-3">
              <div className="space-y-1 pr-8">
                <DialogTitle className="text-lg">
                  {teacher.name} {teacher.surname}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" />
                  {teacher.email}
                </DialogDescription>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border">
                <div className="bg-muted/30 px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Predmeti</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatHours(teacher.assignedHours)}h
                  </p>
                </div>
                <div className="bg-muted/30 px-2 py-2 text-center">
                  <p className="text-[11px] text-muted-foreground">Dodatno</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatHours(teacher.additionalActivityHours)}h
                  </p>
                </div>
                <div className="bg-primary/10 px-2 py-2 text-center">
                  <p className="text-[11px] font-semibold text-primary/80">
                    Skupaj
                  </p>
                  <p className="text-sm font-semibold text-primary tabular-nums">
                    {formatHours(teacher.totalHours)}h
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 px-4 py-3">
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="size-4 text-primary" />
                      Dodelitve ({teacher.assignments.length})
                    </div>

                    {teacher.assignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ta učitelj še nima dodeljenih predmetov.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border rounded-lg border">
                        {teacher.assignments.map((assignment, index) => {
                          const { class: classRoom, programSubject } = assignment;
                          const assignmentKey = [
                            classRoom.programYear.year.name,
                            classRoom.label,
                            programSubject.subject.name,
                            index,
                          ].join("-");

                          return (
                            <li
                              key={assignmentKey}
                              className="space-y-1 px-3 py-3 text-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-medium">
                                  {programSubject.subject.name}
                                </p>
                                <Badge variant="outline" className="shrink-0">
                                  {formatHours(programSubject.requiredHours)} h/teden
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {classRoom.programYear.year.name} · razred{" "}
                                {classRoom.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {programSubject.subject.category.name}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>

                  <Separator />

                  <section className="space-y-3 pb-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="size-4 text-primary" />
                      Dodatne ure ({teacher.additionalActivityAssignments.length})
                    </div>

                    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                      <div className="space-y-2">
                        <Label htmlFor="additional-activity">Dejavnost</Label>
                        <Select
                          value={selectedActivityId}
                          onValueChange={setSelectedActivityId}
                          disabled={isSubmitting || activities.length === 0}
                          modal={false}
                          items={activities.map((activity) => ({
                            value: activity.id,
                            label: activity.name,
                          }))}
                        >
                          <SelectTrigger
                            id="additional-activity"
                            className="w-full"
                          >
                            <SelectValue placeholder="Izberite dejavnost …" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional-hours">Število ur</Label>
                        <Input
                          id="additional-hours"
                          type="number"
                          min={0}
                          step="0.0001"
                          inputMode="decimal"
                          placeholder="npr. 12"
                          value={hoursInput}
                          onChange={(event) => setHoursInput(event.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>

                      {validationError && (
                        <p className="text-sm text-destructive" role="alert">
                          {validationError}
                        </p>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        disabled={isSubmitting || !selectedActivityId || !hoursInput}
                        onClick={() => void handleAddAdditionalHours()}
                      >
                        <Plus className="size-4" />
                        Dodaj
                      </Button>
                    </div>

                    {teacher.additionalActivityAssignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ni dodatnih ur.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border rounded-lg border">
                        {teacher.additionalActivityAssignments.map(
                          (assignment) => (
                            <li
                              key={assignment.additionalActivityId}
                              className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {assignment.additionalActivity.name}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant="outline">
                                  {formatHours(assignment.hoursAmount)}h
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Odstrani ${assignment.additionalActivity.name}`}
                                  disabled={removingKey !== null}
                                  onClick={() =>
                                    void handleRemoveAdditionalHours(
                                      assignment.additionalActivityId,
                                    )
                                  }
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </section>
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <DialogHeader className="px-4 py-4">
            <DialogTitle>Učitelj ni najden</DialogTitle>
            <DialogDescription>
              Izbranega učitelja ni mogoče prikazati.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
