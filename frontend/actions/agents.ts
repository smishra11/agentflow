"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface DeployAgentPayload {
  name: string;
  systemPrompt: string;
  tools: string[];
  schedule: string;
}

export async function deployAgent(payload: DeployAgentPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Insert the agent into the database
  const { data, error } = await supabase
    .from("agents")
    .insert([
      {
        user_id: user.id,
        name: payload.name,
        system_prompt: payload.systemPrompt,
        tools: payload.tools,
        cron_schedule: payload.schedule,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Failed to deploy agent:", error);
    throw new Error(error.message);
  }

  // Refresh the agents dashboard so the new agent appears immediately
  revalidatePath("/agents");

  // Later, we will add a fetch() call here to ping the FastAPI backend
  // to register this agent's schedule/CRON job.

  console.log("Successfully deployed agent:", data);
  return data;
}
