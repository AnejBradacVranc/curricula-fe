"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeacher, updateTeacher } from "@/lib/api";
import { formatHours } from "@/lib/curriculum/format-hours";
import { hasColor, isHexColor } from "@/lib/teacher-color";
import { cn } from "@/lib/utils";
import type { TeacherDetail } from "@/types";

function TeacherDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = Number(params.id);

  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function syncForm(data: TeacherDetail) {
    setName(data.name);
    setSurname(data.surname);
    setEmail(data.email);
    setColor(data.color ?? "");
    setValidationError(null);
  }

  useEffect(() => {
    if (Number.isNaN(teacherId)) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setTeacher(null);

      try {
        const data = await getTeacher(teacherId);

        if (!cancelled) {
          if (!data) {
            setError("Učitelj ni bil najden.");
          } else {
            setTeacher(data);
            syncForm(data);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Učitelja ni bilo mogoče naložiti.");
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
  }, [teacherId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teacher) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const trimmedEmail = email.trim();
    const trimmedColor = color.trim();

    if (!trimmedName) {
      setValidationError("Vnesite ime.");
      return;
    }

    if (!trimmedSurname) {
      setValidationError("Vnesite priimek.");
      return;
    }

    if (!trimmedEmail) {
      setValidationError("Vnesite e-pošto.");
      return;
    }

    if (trimmedColor && !isHexColor(trimmedColor)) {
      setValidationError("Barva mora biti v obliki #RGB ali #RRGGBB.");
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateTeacher(teacher.id, {
        name: trimmedName,
        surname: trimmedSurname,
        email: trimmedEmail,
        color: trimmedColor || null,
      });
      setTeacher(updated);
      syncForm(updated);
      toast.success("Podatki učitelja so posodobljeni.");
    } catch {
      setValidationError(
        "Podatkov ni bilo mogoče shraniti. Preverite, ali e-pošta že obstaja.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <TeacherDetailSkeleton />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container py-8">
        <Link
          href="/teachers"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Nazaj na učitelje
        </Link>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Učitelj ni na voljo</CardTitle>
            <CardDescription>
              {error ?? "Učitelj ni bil najden."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <Link
          href="/teachers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Nazaj na učitelje
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {hasColor(teacher.color) ? (
              <span
                className="size-6 shrink-0 rounded-full ring-1 ring-border"
                style={{ backgroundColor: teacher.color }}
                aria-hidden
              />
            ) : (
              <User className="size-6 text-primary" />
            )}
            <h1 className="text-2xl font-semibold tracking-tight">
              {teacher.name} {teacher.surname}
            </h1>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            {teacher.email}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 py-0">
              <CardDescription className="flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-primary" />
                Predmeti
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatHours(teacher.assignedHours)}h
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 py-0">
              <CardDescription className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Dodatno
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatHours(teacher.additionalActivityHours)}h
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="gap-2 py-4">
            <CardHeader className="px-4 py-0">
              <CardDescription className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Skupaj
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {formatHours(teacher.totalHours)}h
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Osnovni podatki</CardTitle>
            <CardDescription>
              Uredite ime, priimek, e-pošto in barvo učitelja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Ime</Label>
                  <Input
                    id="teacher-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-surname">Priimek</Label>
                  <Input
                    id="teacher-surname"
                    value={surname}
                    onChange={(event) => setSurname(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-email">E-pošta</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-color">Barva</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="teacher-color-picker"
                    type="color"
                    className="h-9 w-12 cursor-pointer p-1"
                    value={isHexColor(color) ? color : "#64748b"}
                    onChange={(event) => setColor(event.target.value)}
                    disabled={isSubmitting}
                    aria-label="Izberi barvo"
                  />
                  <Input
                    id="teacher-color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    placeholder="#RRGGBB"
                    disabled={isSubmitting}
                    className="font-mono"
                  />
                  {color ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => setColor("")}
                    >
                      Odstrani
                    </Button>
                  ) : null}
                </div>
              </div>

              {validationError ? (
                <p className="text-sm text-destructive" role="alert">
                  {validationError}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Shranjevanje..." : "Shrani spremembe"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              Dodelitve ({teacher.assignments.length})
            </CardTitle>
            <CardDescription>
              Predmeti, dodeljeni temu učitelju.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn(teacher.assignments.length === 0 && "pt-0")}>
            {teacher.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ta učitelj še nima dodeljenih predmetov.
              </p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border">
                {teacher.assignments.map((assignment, index) => {
                  const { class: classRoom, programSubject } = assignment;
                  const key = [
                    classRoom.programYear.year.name,
                    classRoom.label,
                    programSubject.subject.name,
                    index,
                  ].join("-");

                  return (
                    <li key={key} className="space-y-1 px-3 py-3 text-sm">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Dodatne ure ({teacher.additionalActivityAssignments.length})
            </CardTitle>
            <CardDescription>
              Dodatne dejavnosti učitelja.
            </CardDescription>
          </CardHeader>
          <CardContent
            className={cn(
              teacher.additionalActivityAssignments.length === 0 && "pt-0",
            )}
          >
            {teacher.additionalActivityAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ni dodatnih ur.</p>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border">
                {teacher.additionalActivityAssignments.map((assignment) => (
                  <li
                    key={assignment.additionalActivityId}
                    className="flex items-center justify-between gap-3 px-3 py-3 text-sm"
                  >
                    <p className="font-medium">
                      {assignment.additionalActivity.name}
                    </p>
                    <Badge variant="outline">
                      {formatHours(assignment.hoursAmount)}h
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
