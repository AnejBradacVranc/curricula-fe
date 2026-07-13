"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { createProgramSubject, getSubjects } from "@/lib/api";
import { ProgramYear, Subject } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type CreateProgramDialogProps = {
    open: boolean;
    programId: number
    programYears: ProgramYear[]
    onOpenChange: (open: boolean) => void;
    onSubjectAdded?: () => void | Promise<void>;
};

function AssignSubjectSkeleton() {
    return (
        <div className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-5 w-24" />
            </div>

        </div>
    );
}

export function AssignSubjectDialog({
    open,
    programId,
    programYears,
    onOpenChange,
    onSubjectAdded
}: CreateProgramDialogProps) {

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [requiredHours, setRequiredHours] = useState("");

    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;

        async function load() {
            setIsLoading(true);
            resetForm();

            try {
                const subjects = await getSubjects();

                if (!cancelled) {
                    setSubjects(subjects);
                }
            } catch {
                if (!cancelled) {
                    toast.error("Predmetov ni bilo mogoče pridobiti.");
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
    }, [open]);

    function resetForm() {
        setSelectedSubjectId(null);
        setSelectedYearId(null);
        setRequiredHours("");

        setValidationError(null);
        setIsSubmitting(false);
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            resetForm();
        }
        onOpenChange(nextOpen);
    }

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const hoursAmount = Number(requiredHours);
        if (Number.isNaN(hoursAmount) || hoursAmount < 0) {
            setValidationError("Vnesite veljavno število ur na teden.");
            return;
        }

        if (!programId || !selectedSubjectId || !selectedYearId || !requiredHours) {
            setValidationError("Izpolnite vsa vnosna polja.");
            return;
        }

        setValidationError(null);
        setIsSubmitting(true);

        try {
            await createProgramSubject({
                programId,
                subjectId: selectedSubjectId,
                yearId: selectedYearId,
                requiredHours: hoursAmount,
            });
            handleOpenChange(false);
            toast.success("Predmet je bil uspešno dodan na predmetnik.");
            await onSubjectAdded?.();
        } catch {
            toast.error("Predmeta ni bilo mogoče dodati programu. Poskusite znova.");
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                {isLoading ? (
                    <>
                        <DialogHeader className="shrink-0 border-b px-4 pt-4 pb-3">
                            <DialogTitle>Nalaganje predmetov</DialogTitle>
                            <DialogDescription>Prosimo počakajte …</DialogDescription>
                        </DialogHeader>
                        <div className="min-h-0 flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <AssignSubjectSkeleton />
                            </ScrollArea>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Dodajanje predmeta</DialogTitle>
                            <DialogDescription>
                                Izberite predmet, ki ga želite dodati temu programu.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Predmet</Label>
                                <Select
                                    value={selectedSubjectId}
                                    onValueChange={setSelectedSubjectId}
                                    disabled={isSubmitting || subjects.length === 0}
                                    modal={false}
                                    items={subjects.map((subject) => ({
                                        value: subject.id,
                                        label: subject.name,
                                    }))}
                                >
                                    <SelectTrigger
                                        id="subject"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Izberite predmet …" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Letnik</Label>
                                <Select
                                    value={selectedYearId}
                                    onValueChange={setSelectedYearId}
                                    disabled={isSubmitting || programYears.length === 0}
                                    modal={false}
                                    items={programYears.map((programYear) => ({
                                        value: programYear.yearId,
                                        label: programYear.year.name,
                                    }))}
                                >
                                    <SelectTrigger
                                        id="year"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Izberite letnik …" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programYears.map((programYear) => (
                                            <SelectItem key={programYear.yearId} value={programYear.yearId}>
                                                {programYear.year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hours-per-week">Število ur na teden</Label>
                                <Input
                                    id="hours-per-week"
                                    type="number"
                                    min={0}
                                    max={10}
                                    step="1"
                                    inputMode="numeric"
                                    placeholder="npr. 2"
                                    value={requiredHours}
                                    onChange={(event) => setRequiredHours(event.target.value)}
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
                                    <Plus />
                                    {isSubmitting ? "Dodajanje..." : "Dodaj predmet"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
