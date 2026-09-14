"use server";

import { createClient } from "@/lib/supabase/server";

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Route through the code-exchange handler first, THEN land on /reset-password
    // with a real session established. Going straight to /reset-password would
    // leave the user unauthenticated since the link only carries a `code` param.
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase returns success even for unregistered emails (anti-enumeration).
  // Always show a generic "check your inbox" message on the client.
  return { success: true };
}
