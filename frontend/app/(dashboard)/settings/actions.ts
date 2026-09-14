"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const organization = (formData.get("organization") as string) ?? "";
  const address = (formData.get("address") as string) ?? "";

  if (!name || name.trim().length === 0) {
    return { error: "Name cannot be empty" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: name.trim(),
      organization: organization.trim(),
      address: address.trim(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout"); // header avatar/initials also depend on full_name
  return { success: true };
}
