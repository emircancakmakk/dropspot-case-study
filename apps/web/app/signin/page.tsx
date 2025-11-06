// app/signin/page.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </Button>
  );
}

export default function SignInPage() {
  const [state, formAction] = useFormState(signInAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
          <CardDescription>
            Hesabınıza erişmek için giriş yapın.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Şifrenizi girin"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <SubmitButton />

            <p className="text-sm text-center text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Kayıt Ol
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
