"use client";

import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Program } from "@/types";

type ProgramsPanelProps = {
  programs: Program[];
  selectedProgramId: number;
  onSelectProgram: (programId: number) => void;
};

export function ProgramsPanel({
  programs,
  selectedProgramId,
  onSelectProgram,
}: ProgramsPanelProps) {
  return (
    <Card className="flex w-full max-w-90 flex-col">
      <CardHeader className="shrink-0 border-b py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-4 text-primary" />
            Programi
          </CardTitle>
          <Badge variant="secondary">{programs.length}</Badge>
        </div>
        <CardDescription>Izberite program za urejanje.</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-40">
          <ul className="divide-y divide-border p-1">
            {programs.map((program) => {
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
                      "w-full cursor-pointer rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                      "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isSelected
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="line-clamp-2">{program.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
