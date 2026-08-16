"use client";

import { useState } from "react";
import { BookOpen, Pencil, Plus } from "lucide-react";

import { SubjectDialog } from "@/app/(protected)/subjects/_components/subject-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSubjects } from "@/lib/queries/subjects/queries";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

function SubjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function groupSubjectsByCategory(subjects: Subject[]) {
  const sections: { categoryName: string; subjects: Subject[] }[] = [];

  const byCategory = new Map<string, Subject[]>();

  for (const subject of subjects) {
    byCategory.set(subject.category.name, [
      ...(byCategory.get(subject.category.name) ?? []),
      subject,
    ]);
  }

  byCategory.forEach((value: Subject[], key: string) => {
    sections.push({ categoryName: key, subjects: value });
  });

  return sections;
}

export default function SubjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const isMobile = useIsMobile();

  const {
    data: subjects = [],
    isLoading,
    isError,
  } = useSubjects();

  function openCreateDialog() {
    setEditingSubject(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(subject: Subject) {
    setEditingSubject(subject);
    setIsDialogOpen(true);
  }

  const sections = groupSubjectsByCategory(subjects);

  if (isLoading) {
    return (
      <div className="container py-8">
        <SubjectsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>
              Podatkov ni bilo mogoče naložiti. Poskusite znova.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Predmeti
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Seznam vseh predmetov na šoli.
            </p>
          </div>

          <div className={cn("space-x-2", isMobile && "flex self-end")}>
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              {!isMobile && "Dodaj predmet"}
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          {subjects.length === 0 ? (
            <CardContent className="px-4 py-8 text-center text-sm text-muted-foreground">
              Šola še nima dodanih predmetov.
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <Accordion
                multiple
                defaultValue={sections
                  .slice(0, 1)
                  .map((section) => section.categoryName)}
                className="w-full"
              >
                {sections.map((section) => (
                  <AccordionItem
                    key={section.categoryName}
                    value={section.categoryName}
                    className="border-b px-4 last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline cursor-pointer items-center gap-4">
                      <span className="flex items-center gap-2 w-full justify-between md:justify-normal">
                        <span className="text-md font-semibold tracking-wide text-primary uppercase max-w-48 md:max-w-none">
                          {section.categoryName}
                        </span>
                        <span className="text-xs font-normal overflow-hidden text-ellipsis text-nowrap text-muted-foreground/80">
                          <span className="hidden md:inline">·</span>{" "}
                          {section.subjects.length}{" "}
                          {section.subjects.length === 1
                            ? "predmet"
                            : "predmetov"}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <ul className="divide-y divide-border/70 rounded-md border">
                        {section.subjects.map((subject) => (
                          <li
                            key={subject.id}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/10"
                          >
                            <div className="flex min-w-0 flex-1 items-baseline gap-2 text-sm">
                              <span className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {subject.abbrevation}
                              </span>
                              <span className="min-w-0 truncate font-medium">
                                {subject.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0 text-muted-foreground"
                              aria-label={`Uredi ${subject.name}`}
                              onClick={() => openEditDialog(subject)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          )}
        </Card>
      </div>

      <SubjectDialog
        open={isDialogOpen}
        editingSubject={editingSubject}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSubject(null);
          }
        }}
      />
    </div>
  );
}
