"use client";

import { useMemo } from "react";
import { CalendarClock, Check, ChevronDown } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms } from "@/lib/queries/programs/queries";
import { cn } from "@/lib/utils";

type ProgramsSelectProps = {
    selectedProgramId: number;
    onSelectProgram: (programId: number) => void;
};

export function ProgramsSelect({
    selectedProgramId,
    onSelectProgram,
}: ProgramsSelectProps) {
    const { data: programs = [], isLoading, isError } = usePrograms();

    const selectedProgram = programs.find(
        (program) => program.id === selectedProgramId,
    );

    if (isLoading) {
        return <Skeleton className="h-9 w-64 max-w-full" />;
    }

    if (isError) {
        return (
            <h1 className="text-2xl font-semibold text-destructive">
                Programov ni bilo mogoče naložiti.
            </h1>
        );
    }

    if (programs.length === 0) {
        return <h1 className="text-2xl font-semibold">Ni programov</h1>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "w-fit inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg text-left text-2xl font-semibold transition-colors border border-muted bg-card px-3 py-3 border-b-primary border-b-2",
                    "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Izberi program"
            >
                <h1>
                    {selectedProgram?.name ?? "Izberi program"}
                </h1>
                <ChevronDown className="size-5 shrink-0 hover:text-primary" />
            </DropdownMenuTrigger>


            <DropdownMenuContent
                align="start"
                className="max-h-80 w-(--anchor-width) min-w-64"
            >
                {programs.map((program) => {
                    const isSelected = program.id === selectedProgramId;

                    return (
                        <DropdownMenuItem
                            key={program.id}
                            onClick={() => {
                                if (program.id === selectedProgramId) {
                                    return;
                                }
                                onSelectProgram(program.id);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={cn(
                                "cursor-pointer gap-2",
                                isSelected && "bg-accent font-medium text-accent-foreground",
                            )}
                        >
                            <span className="min-w-0 flex-1 truncate">{program.name}</span>
                            {isSelected ? <Check className="size-4 shrink-0" /> : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
