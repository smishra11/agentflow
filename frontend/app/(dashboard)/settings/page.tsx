import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = (user?.user_metadata?.full_name as string) ?? "";
  const organization = (user?.user_metadata?.organization as string) ?? "";
  const address = (user?.user_metadata?.address as string) ?? "";
  const email = user?.email ?? "";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account details.
        </p>
      </div>

      <Card className="border-border/40 bg-background/40">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Profile</CardTitle>
          <CardDescription className="text-xs">
            Your name is shown across the dashboard and in your avatar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialName={name}
            initialOrganization={organization}
            initialAddress={address}
            email={email}
          />
        </CardContent>
      </Card>

      <Card
        id="account"
        className="border-border/40 bg-background/40 scroll-mt-20"
      >
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account</CardTitle>
          <CardDescription className="text-xs">
            Read-only details about your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">Email verified</span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{createdAt}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
