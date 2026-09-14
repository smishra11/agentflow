"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Activity, Loader2 } from "lucide-react";

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
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
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
            Welcome back
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-5">
          <Button
            variant="outline"
            className="w-full h-9 bg-background/50 text-sm"
          >
            {/* Google SVG hidden for brevity, keep your existing SVG here */}
            Continue with Google
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

          {/* Email / Password Form */}
          <form action={onSubmit} className="space-y-3">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                className="h-9 bg-background/50 text-sm"
                required
                disabled={isPending}
              />
            </div>

            {/* Error Message Display */}
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center border-t border-border/40 bg-muted/10 py-4">
          <div className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center max-w-[280px] leading-relaxed">
        By clicking continue, you agree to our Terms of Service and Privacy
        Policy.
      </p>
    </div>
  );
}
