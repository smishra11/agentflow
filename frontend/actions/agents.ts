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

  // Ping the FastAPI backend to register this agent's schedule/trigger immediate run
  try {
    await fetch("http://127.0.0.1:8000/api/engine/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: data.id,
        user_id: data.user_id,
        name: data.name,
        cron_schedule: data.cron_schedule,
      }),
    });
  } catch (webhookError) {
    console.error("Failed to ping execution engine:", webhookError);
    // Do not throw here. We want the user UI to succeed even if the scheduler misses the ping.
  }

  console.log("Successfully deployed agent:", data);
  return data;
}
