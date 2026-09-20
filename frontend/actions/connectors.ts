"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function disconnectTool(providerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Normalize the provider name (mapping specific google tools to the general 'google' provider)
  let dbProvider = providerId.toLowerCase();
  if (["gmail", "googlecalendar", "googledrive"].includes(dbProvider)) {
    dbProvider = "google";
  }

  // Delete the connection from the database
  const { error } = await supabase
    .from("user_connectors")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", dbProvider);

  if (error) {
    console.error("Disconnect error:", error);
    throw new Error("Failed to disconnect tool");
  }

  // Instantly refresh the UI on these pages
  revalidatePath("/connectors");
  revalidatePath("/agents/create");
}
