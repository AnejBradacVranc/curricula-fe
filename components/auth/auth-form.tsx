"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin, useRegister } from "@/lib/queries";
import {
  type LoginFormValues,
  type RegisterFormInput,
  type RegisterFormValues,
  loginSchema,
  registerSchema,
} from "@/lib/schemas/auth";
import { Role } from "@/types/enums/role";

//TODO better error message handling
function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Prišlo je do napake. Poskusite znova.";
}

export function AuthForm() {
  const router = useRouter();
  const { markAuthenticated } = useAuth();

  const { mutateAsync: loginUser, isPending: isPendingLogin } = useLogin();
  const { mutateAsync: registerUser, isPending: isPendingRegister } =
    useRegister();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      schoolId: "1",
    },
  });

  const loading = isPendingLogin || isPendingRegister;

  async function handleLogin(values: LoginFormValues) {
    try {
      await loginUser(values);
      markAuthenticated();
      router.push("/");
    } catch (err) {
      toast.error(getErrorMessage(err), {
        description: "Prišlo je do napake. Poskusite znova.",
      });
    }
  }

  async function handleRegister(values: RegisterFormValues) {
    try {
      await registerUser({
        ...values,
        schoolId: Number(values.schoolId),
        role: Role.USER,
      });
      toast.success("Račun je bil uspešno ustvarjen.", {
        description: "Zdaj se lahko prijavite.",
      });
      registerForm.reset();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        description: "Prišlo je do napake. Poskusite znova.",
      });
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Dobrodošli</CardTitle>
        <CardDescription>
          Prijavite se ali ustvarite nov račun za dostop do aplikacije.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Prijava</TabsTrigger>
            <TabsTrigger value="register">Registracija</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              id="auth-login-form"
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="pt-4"
              noValidate
            >
              <FieldGroup>
                <Controller
                  name="email"
                  control={loginForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="login-email">E-pošta</FieldLabel>
                      <Input
                        {...field}
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        disabled={loading}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={loginForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="login-password">Geslo</FieldLabel>
                      <Input
                        {...field}
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                        disabled={loading}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {isPendingLogin ? "Prijava..." : "Prijava"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              id="auth-register-form"
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="pt-4"
              noValidate
            >
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={registerForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="register-name">Ime</FieldLabel>
                        <Input
                          {...field}
                          id="register-name"
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          disabled={loading}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                  <Controller
                    name="surname"
                    control={registerForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="register-surname">
                          Priimek
                        </FieldLabel>
                        <Input
                          {...field}
                          id="register-surname"
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          disabled={loading}
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
                  control={registerForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-email">E-pošta</FieldLabel>
                      <Input
                        {...field}
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                        disabled={loading}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  name="password"
                  control={registerForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-password">Geslo</FieldLabel>
                      <Input
                        {...field}
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                        disabled={loading}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Controller
                  name="schoolId"
                  control={registerForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="register-school-id">
                        ID šole
                      </FieldLabel>
                      <Input
                        {...field}
                        id="register-school-id"
                        type="number"
                        min={1}
                        aria-invalid={fieldState.invalid}
                        disabled={loading}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </Field>
                  )}
                />
                <Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {isPendingRegister ? "Ustvarjanje..." : "Ustvari račun"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
