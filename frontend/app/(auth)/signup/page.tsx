"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Activity, Loader2, MailCheck } from "lucide-react";

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
import { signup } from "./actions";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 transition-transform group-hover:scale-105">
          <Activity className="h-4 w-4 font-bold" />
        </div>
        <span className="text-lg font-bold tracking-tight">AgentFlow</span>
      </Link>

      <Card className="w-full max-w-[380px] border-border/40 bg-background/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-5 pt-6">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your details to set up your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
                <MailCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Confirm your email</p>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">
                  We sent a confirmation link to your inbox. Click it to
                  activate your account, then sign in.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* OAuth Button */}
              <Button
                variant="outline"
                className="w-full h-9 bg-background/50 text-sm"
                disabled={isPending}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-medium">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Form */}
              <form action={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className="h-9 bg-background/50 text-sm"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-9 bg-background/50 text-sm"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="h-9 bg-background/50 text-sm"
                    required
                    disabled={isPending}
                  />
                </div>

                {error && (
                  <div className="text-[11px] font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-9 mt-2 font-medium text-sm"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center border-t border-border/40 bg-muted/10 py-4">
          <div className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center max-w-[280px] leading-relaxed">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
