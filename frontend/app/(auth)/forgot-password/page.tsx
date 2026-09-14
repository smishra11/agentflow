"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Loader2, MailCheck } from "lucide-react";

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
import { forgotPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSentTo(formData.get("email") as string);
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
        {success ? (
          <>
            <CardHeader className="space-y-3 text-center pb-4 pt-6">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
                <MailCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  Check your inbox
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed px-2">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{sentTo}</span>,
                  we&apos;ve sent a link to reset your password.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <p className="text-[11px] text-muted-foreground text-center">
                Didn&apos;t get it? Check spam, or try again in a few minutes.
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center pb-5 pt-6">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Reset password
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your email and we&apos;ll send you a reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-5">
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
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
        <CardFooter className="flex flex-col gap-4 text-center border-t border-border/40 bg-muted/10 py-4">
          <div className="text-xs text-muted-foreground">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-primary font-medium hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
