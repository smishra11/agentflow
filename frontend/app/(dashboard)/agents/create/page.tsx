import { createClient } from "@/lib/supabase/server";
import { CreateAgentForm } from "./create-agent-form";

export const dynamic = "force-dynamic";

export default async function CreateAgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's currently active tool connections
  let activeConnections: string[] = [];
  if (user) {
    const { data } = await supabase
      .from("user_connectors")
      .select("provider")
      .eq("user_id", user.id)
      .eq("status", "connected");

    if (data) {
      activeConnections = data.map((row) => row.provider);
    }
  }

  return (
    // ADDED w-full here to force the container to span the available width
    <div className="mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Deploy New Agent
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your autonomous agent, assign its toolkit, and deploy it to
          the engine.
        </p>
      </div>

      <CreateAgentForm activeConnections={activeConnections} />
    </div>
  );
}
