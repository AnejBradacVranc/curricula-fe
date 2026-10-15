"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrograms } from "@/lib/queries/programs/queries";
import { cn } from "@/lib/utils";

type ProgramsPanelProps = {
  selectedProgramId: number;
  onSelectProgram: (programId: number) => void;
};

export function ProgramsPanel({
  selectedProgramId,
  onSelectProgram,
}: ProgramsPanelProps) {
  const [query, setQuery] = useState("");
  const { data: programs = [], isLoading, isError } = usePrograms();

  const filteredPrograms = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return programs;
    }

    return programs.filter((program) =>
      program.name.toLowerCase().includes(normalized),
    );
  }, [programs, query]);

  return (
    <Card className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="shrink-0 space-y-3 border-b py-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="size-4 text-primary" />
              Programi
            </CardTitle>
            <Badge variant="secondary">{filteredPrograms.length}</Badge>
          </div>
          <CardDescription>Izberite program za urejanje.</CardDescription>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Išči po imenu …"
            className="pl-8"
            aria-label="Išči programe"
          />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : isError ? (
          <p className="px-(--card-spacing) py-8 text-center text-sm text-destructive">
            Programov ni bilo mogoče naložiti.
          </p>
        ) : filteredPrograms.length === 0 ? (
          <p className="px-(--card-spacing) py-8 text-center text-sm text-muted-foreground">
            {programs.length === 0
              ? "Ni programov."
              : "Noben program ne ustreza iskanju."}
          </p>
        ) : (
          <div className="h-full overflow-y-auto overscroll-y-contain">
            <ul className="divide-y divide-border p-1">
              {filteredPrograms.map((program) => {
                const isSelected = program.id === selectedProgramId;

                return (
                  <li key={program.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (program.id === selectedProgramId) {
                          return;
                        }
                        onSelectProgram(program.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      aria-current={isSelected ? "true" : undefined}
                      className={cn(
                        "w-full cursor-pointer px-3 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSelected
                          ? "bg-primary/50 font-medium text-foreground hover:bg-primary/25"
                          : "text-muted-foreground",
                      )}
                    >
                      <span className="line-clamp-2">{program.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
