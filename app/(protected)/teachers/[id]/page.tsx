"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Download,
  Mail,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { TeacherAvatar } from "@/app/(protected)/teachers/_components/teacher-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours } from "@/lib/curriculum/format-hours";
import {
  useCreateAdditionalActivityAssignment,
  useDeleteAdditionalActivityAssignment,
} from "@/lib/queries/additional-activities/mutations";
import { useAdditionalActivities } from "@/lib/queries/additional-activities/queries";
import { useExportTeacherPdf } from "@/lib/queries/export/mutations";
import { useUpdateTeacher } from "@/lib/queries/teachers/mutations";
import { useTeacher } from "@/lib/queries/teachers/queries";
import {
  type CreateAdditionalActivityAssignmentFormValues,
  createAdditionalActivityAssignmentSchema,
} from "@/lib/schemas/additional-activities";
import {
  type UpdateTeacherFormValues,
  updateTeacherSchema,
} from "@/lib/schemas/teachers";
import { isHexColor } from "@/lib/teacher-color";
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

  const {
    data: teacher = null,
    isLoading,
    isError,
  } = useTeacher(teacherId);

  const updateTeacherMutation = useUpdateTeacher(teacherId);
  const exportPdfMutation = useExportTeacherPdf();
  const { data: additionalActivities = [] } = useAdditionalActivities();
  const createAdditionalActivityAssignment =
    useCreateAdditionalActivityAssignment();
  const deleteAdditionalActivityAssignment =
    useDeleteAdditionalActivityAssignment();

  const [profileImage, setProfileImage] = useState<File | null | undefined>(
    undefined,
  );
  //const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UpdateTeacherFormValues>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      color: "",
    },
  });

  const additionalHoursForm =
    useForm<CreateAdditionalActivityAssignmentFormValues>({
      resolver: zodResolver(createAdditionalActivityAssignmentSchema),
      defaultValues: {
        additionalActivityId: "",
        hoursAmount: "",
      },
    });

  const color = useWatch({ control: form.control, name: "color" });

  function prefillForm(data: TeacherDetail) {
    form.reset({
      name: data.name,
      surname: data.surname,
      email: data.email,
      color: data.color ?? "",
    });
    setProfileImage(undefined);
    //setProfileImageInputKey((key) => key + 1);
    setSubmitError(null);
  }

  useEffect(() => {
    if (teacher) {
      prefillForm(teacher);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when teacher payload changes
  }, [teacher]);

  async function handleAddAdditionalHours(
    values: CreateAdditionalActivityAssignmentFormValues,
  ) {
    if (!teacher) {
      return;
    }

    try {
      await createAdditionalActivityAssignment.mutateAsync({
        teacherId: teacher.id,
        additionalActivityId: Number(values.additionalActivityId),
        hoursAmount: Number(values.hoursAmount),
      });
      additionalHoursForm.reset({
        additionalActivityId: "",
        hoursAmount: "",
      });
      toast.success("Dodatne ure so bile uspešno dodane.");
    } catch {
      toast.error("Dodajanje dodatnih ur ni uspelo.");
    }
  }

  async function handleRemoveAdditionalHours(additionalActivityId: number) {
    if (!teacher) {
      return;
    }

    try {
      await deleteAdditionalActivityAssignment.mutateAsync({
        teacherId: teacher.id,
        additionalActivityId,
      });
      toast.success("Dodatne ure so bile odstranjene.");
    } catch {
      toast.error("Odstranitev dodatnih ur ni uspela.");
    }
  }

  async function handleSubmit(values: UpdateTeacherFormValues) {
    if (!teacher) {
      return;
    }

    setSubmitError(null);

    try {
      const updated = await updateTeacherMutation.mutateAsync({
        data: {
          name: values.name,
          surname: values.surname,
          email: values.email,
          color: values.color || null,
        },
        profileImage,
      });
      prefillForm(updated);
      toast.success("Podatki učitelja so posodobljeni.");
    } catch (error: unknown) {
      setSubmitError("Podatkov ni bilo mogoče shraniti.");
      console.error(error);
    }
  }

  async function handleExport() {
    if (!teacher) {
      return;
    }

    try {
      const blob = await exportPdfMutation.mutateAsync(teacher.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${teacher.surname}-${teacher.name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Izvoz PDF je pripravljen.");
    } catch {
      toast.error("Izvoza PDF ni bilo mogoče ustvariti.");
    }
  }

  const isSubmitting = updateTeacherMutation.isPending;
  const isExporting = exportPdfMutation.isPending;
  const isAddingAdditionalHours = createAdditionalActivityAssignment.isPending;
  const removingAdditionalActivityId =
    deleteAdditionalActivityAssignment.isPending
      ? deleteAdditionalActivityAssignment.variables?.additionalActivityId
      : null;

  const activityItems = additionalActivities.map((activity) => ({
    value: String(activity.id),
    label: activity.name,
  }));

  if (isLoading) {
    return (
      <div className="container py-8">
        <TeacherDetailSkeleton />
      </div>
    );
  }

  if (isError || !teacher) {
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
              {isError
                ? "Učitelja ni bilo mogoče naložiti."
                : "Učitelj ni bil najden."}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <TeacherAvatar
                name={teacher.name}
                surname={teacher.surname}
                profileImage={teacher.profileImage}
                color={teacher.color}
                size="md"
              />
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {teacher.name} {teacher.surname}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  {teacher.email}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              disabled={isExporting}
              onClick={() => void handleExport()}
            >
              <Download />
              {isExporting ? "Izvažanje..." : "Izvozi PDF"}
            </Button>
          </div>
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
              Uredite ime, priimek, e-pošto, barvo in profilno sliko učitelja.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <FieldLabel htmlFor="teacher-profile-image">Slika</FieldLabel>
                <div className="flex flex-wrap items-end gap-4">
                  {teacher.profileImage ? (
                    <div className="group relative size-24 shrink-0">
                      <TeacherAvatar
                        name={teacher.name}
                        surname={teacher.surname}
                        profileImage={teacher.profileImage}
                        color={teacher.color}
                        size="lg"
                      />
                      <button
                        type="button"
                        className={cn(
                          "absolute inset-0 flex cursor-pointer rounded-lg bg-black/65 text-white",
                          profileImage === null
                            ? "flex-col items-center justify-center gap-1"
                            : "items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                        )}
                        disabled={isSubmitting}
                        onClick={() => {
                          if (profileImage === null) {
                            setProfileImage(undefined);
                          } else {
                            setProfileImage(null);
                            //setProfileImageInputKey((key) => key + 1);
                          }
                        }}
                        aria-label={
                          profileImage === null
                            ? "Prekliči odstranitev slike"
                            : "Odstrani profilno sliko"
                        }
                      >
                        <Trash2 className="size-6" />
                      </button>
                    </div>
                  ) : null}
                  <div className="space-y-1.5">
                    <input
                      //key={profileImageInputKey}
                      className="block w-full cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                      id="teacher-profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      onChange={(event) => {
                        setProfileImage(event.target.files?.[0] ?? undefined);
                      }}
                      disabled={isSubmitting || profileImage === null}
                    />
                    {profileImage instanceof File ? (
                      <p className="truncate text-xs text-muted-foreground">
                        Izbrano: {profileImage.name}
                      </p>
                    ) : profileImage === null ? (
                      <p className="text-xs text-muted-foreground">
                        Slika bo odstranjena ob shranjevanju.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG ali WebP, do 2&nbsp;MB.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-name">Ime</FieldLabel>
                        <Input
                          {...field}
                          id="teacher-name"
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                          autoComplete="given-name"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    name="surname"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-surname">
                          Priimek
                        </FieldLabel>
                        <Input
                          {...field}
                          id="teacher-surname"
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                          autoComplete="family-name"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-email">E-pošta</FieldLabel>
                        <Input
                          {...field}
                          id="teacher-email"
                          type="email"
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                          autoComplete="email"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    name="color"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-color">Barva</FieldLabel>
                        <div className="flex items-center gap-3">
                          <Input
                            id="teacher-color-picker"
                            type="color"
                            className="h-9 w-12 cursor-pointer p-1"
                            value={
                              isHexColor(field.value) ? field.value : "#64748b"
                            }
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            disabled={isSubmitting}
                            aria-label="Izberi barvo"
                          />
                          <Input
                            {...field}
                            id="teacher-color"
                            placeholder="#RRGGBB"
                            aria-invalid={fieldState.invalid}
                            disabled={isSubmitting}
                            className="font-mono"
                          />
                          {color ? (
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() => field.onChange("")}
                            >
                              Odstrani
                            </Button>
                          ) : null}
                        </div>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>

              {submitError ? (
                <p className="text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  <Check />
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
          <CardContent
            className={cn(teacher.assignments.length === 0 && "pt-0")}
          >
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
            <CardDescription>Dodatne dejavnosti učitelja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="rounded-lg border bg-muted/20 p-4"
              onSubmit={additionalHoursForm.handleSubmit(
                handleAddAdditionalHours,
              )}
              noValidate
            >
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="additionalActivityId"
                    control={additionalHoursForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-additional-activity">
                          Dejavnost
                        </FieldLabel>
                        <Select
                          value={field.value || null}
                          onValueChange={(value) =>
                            field.onChange(value == null ? "" : String(value))
                          }
                          disabled={
                            isAddingAdditionalHours ||
                            additionalActivities.length === 0
                          }
                          items={activityItems}
                        >
                          <SelectTrigger
                            id="teacher-additional-activity"
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Izberite dejavnost …" />
                          </SelectTrigger>
                          <SelectContent>
                            {additionalActivities.map((activity) => (
                              <SelectItem
                                key={activity.id}
                                value={String(activity.id)}
                              >
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />

                  <Controller
                    name="hoursAmount"
                    control={additionalHoursForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="teacher-additional-hours">
                          Število ur
                        </FieldLabel>
                        <Input
                          {...field}
                          id="teacher-additional-hours"
                          type="number"
                          min={0}
                          step="0.0001"
                          inputMode="decimal"
                          placeholder="npr. 12"
                          aria-invalid={fieldState.invalid}
                          disabled={isAddingAdditionalHours}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>

                <Field>
                  <Button
                    type="submit"
                    disabled={isAddingAdditionalHours}
                    className="sm:w-auto"
                  >
                    <Plus />
                    {isAddingAdditionalHours ? "Dodajanje..." : "Dodaj"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

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
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline">
                        {formatHours(assignment.hoursAmount)}h
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Odstrani ${assignment.additionalActivity.name}`}
                        disabled={removingAdditionalActivityId != null}
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
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
