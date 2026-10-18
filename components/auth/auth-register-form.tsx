"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { getErrorMessage } from "@/components/auth/get-error-message";
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
import { useRegister } from "@/lib/queries";
import {
  type RegisterFormInput,
  type RegisterFormValues,
  registerSchema,
} from "@/lib/schemas/auth";

export function AuthRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? "";
  const { mutateAsync: registerUser, isPending } = useRegister();

  const form = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      repeat_password: "",
    },
  });

  async function handleRegister(values: RegisterFormValues) {
    if (!inviteToken) {
      toast.error("Povezava za povabilo ni veljavna.");
      return;
    }

    const { repeat_password: _, ...account } = values;

    try {
      await registerUser({
        ...account,
        inviteToken,
      });
      toast.success("Račun je bil uspešno ustvarjen.", {
        description: "Zdaj se lahko prijavite.",
      });
      router.push("/login");
    } catch (err) {
      toast.error(getErrorMessage(err), {
        description: "Prišlo je do napake. Poskusite znova.",
      });
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Registracija</CardTitle>
        <CardDescription>
          Ustvarite račun s povezavo za povabilo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="auth-register-form"
          onSubmit={form.handleSubmit(handleRegister)}
          noValidate
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-name">Ime</FieldLabel>
                    <Input
                      {...field}
                      id="register-name"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
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
                    <FieldLabel htmlFor="register-surname">Priimek</FieldLabel>
                    <Input
                      {...field}
                      id="register-surname"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email">E-pošta</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-password">Geslo</FieldLabel>
                  <Input
                    {...field}
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="repeat_password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-repeat-password">
                    Ponovite geslo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="register-repeat-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Ustvarjanje..." : "Ustvari račun"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
