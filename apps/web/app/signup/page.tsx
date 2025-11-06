// app/signup/page.tsx
"use client";

import { signUpAction } from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
    </Button>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Hesap Oluştur</CardTitle>
          <CardDescription>
            Yeni bir hesap oluşturmak için kayıt olun.
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
              <Label htmlFor="name">İsim Soyisim</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>

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
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Şifreniz en az 6 karakter uzunluğunda olmalıdır.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifreyi Doğrula</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <SubmitButton />

            <p className="text-sm text-center text-muted-foreground">
              Hesabınız var mı?{" "}
              <Link
                href="/signin"
                className="text-primary hover:underline font-medium"
              >
                Giriş Yap
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
