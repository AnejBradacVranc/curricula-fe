"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, register } from "@/lib/api";
import { Role } from "@/types/enums/role";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerSurname, setRegisterSurname] = useState("");
  const [registerSchoolId, setRegisterSchoolId] = useState("1");

  async function handleLogin(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await login({
        email: loginEmail,
        password: loginPassword,
      });
      markAuthenticated();
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err), {
        description: "Prišlo je do napake. Poskusite znova.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        name: registerName || undefined,
        surname: registerSurname || undefined,
        schoolId: Number(registerSchoolId),
        role: Role.USER,
      });
      toast.success("Račun je bil uspešno ustvarjen.", {
        description: "Zdaj se lahko prijavite.",
      });
    } catch (err) {
      toast.error(getErrorMessage(err), {
        description: "Prišlo je do napake. Poskusite znova.",
      });
    } finally {
      setLoading(false);
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
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">E-pošta</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Geslo</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Prijava..." : "Prijava"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Ime</Label>
                  <Input
                    id="register-name"
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-surname">Priimek</Label>
                  <Input
                    id="register-surname"
                    value={registerSurname}
                    onChange={(event) => setRegisterSurname(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">E-pošta</Label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Geslo</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-school-id">ID šole</Label>
                <Input
                  id="register-school-id"
                  type="number"
                  min={1}
                  value={registerSchoolId}
                  onChange={(event) => setRegisterSchoolId(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ustvarjanje..." : "Ustvari račun"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
