"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Activity, KeyRound, Loader2 } from "lucide-react";

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
import { resetPassword } from "./actions";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      // Success case redirects server-side and never reaches here
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950 transition-transform group-hover:scale-105">
          <Activity className="h-4 w-4 font-bold" />
        </div>
        <span className="text-lg font-bold tracking-tight">AgentFlow</span>
      </Link>

      <Card className="w-full max-w-[380px] border-border/40 bg-background/40 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-5 pt-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Set a new password
            </CardTitle>
            <CardDescription className="text-xs">
              Choose a strong password you haven&apos;t used before
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <form action={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                New password
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
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
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
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
