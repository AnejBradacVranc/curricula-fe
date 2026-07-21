"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getCategories, getSubjects } from "@/lib/api";
import type { Category, Subject } from "@/types";

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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const refreshSubjects = useCallback(async () => {
    try {
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      setError(null);
    } catch {
      setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [subjectsData, categoriesData] = await Promise.all([
          getSubjects(),
          getCategories(),
        ]);

        if (!cancelled) {
          setSubjects(subjectsData);
          setCategories(categoriesData);
        }
      } catch {
        if (!cancelled) {
          setError("Podatkov ni bilo mogoče naložiti. Poskusite znova.");
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
  }, []);

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

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Napaka pri nalaganju</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
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

          <Button type="button" onClick={openCreateDialog}>
            <Plus />
            Dodaj predmet
          </Button>
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
                defaultValue={sections.map((section) => section.categoryName)}
                className="w-full"
              >
                {sections.map((section) => (
                  <AccordionItem
                    key={section.categoryName}
                    value={section.categoryName}
                    className="border-b px-4 last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline cursor-pointer">
                      <span className="flex items-baseline gap-2">
                        <span className="text-md font-semibold tracking-wide text-primary uppercase">
                          {section.categoryName}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground/80">
                          · {section.subjects.length}{" "}
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
        categories={categories}
        editingSubject={editingSubject}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingSubject(null);
          }
        }}
        onSubjectSaved={refreshSubjects}
      />
    </div>
  );
}
