"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "./actions";

export function ProfileForm({
  initialName,
  initialOrganization,
  initialAddress,
  email,
}: {
  initialName: string;
  initialOrganization: string;
  initialAddress: string;
  email: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialName}
            className="h-9 bg-background/50 text-sm"
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="organization" className="text-xs">
            Organization
          </Label>
          <Input
            id="organization"
            name="organization"
            defaultValue={initialOrganization}
            placeholder="Company or team name"
            className="h-9 bg-background/50 text-sm"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs">
          Address
        </Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={initialAddress}
          placeholder="Street, city, state, ZIP"
          className="min-h-[72px] bg-background/50 text-sm resize-none"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="h-9 bg-muted/30 text-sm max-w-sm text-muted-foreground"
        />
        <p className="text-[11px] text-muted-foreground">
          Contact support to change your email address.
        </p>
      </div>

      {error && (
        <div className="text-[11px] font-medium text-destructive">{error}</div>
      )}
      {saved && (
        <div className="text-[11px] font-medium text-emerald-500">Saved.</div>
      )}

      <Button type="submit" className="h-9 text-sm" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}
