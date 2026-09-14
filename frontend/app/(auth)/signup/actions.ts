"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/login`,
    },
  });

  if (error) {
    // Covers the case where the email is already registered AND confirmed
    return { error: error.message };
  }

  // Supabase quirk: if the email already exists but was never confirmed,
  // signUp() returns success with NO error — but data.user.identities is
  // an empty array instead of containing the new identity. This is the
  // only reliable signal to detect a duplicate in that case.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error:
        "An account with this email already exists. Try logging in or resetting your password.",
    };
  }

  revalidatePath("/");
  return { success: true };
}
