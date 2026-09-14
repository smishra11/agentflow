"use server";

import { createClient } from "@/lib/supabase/server";

export async function testBackendHandshake() {
  // 1. Initialize your exact server client
  const supabase = await createClient();
  
  // 2. Extract the current valid session (middleware ensures it's fresh)
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { success: false, error: "Unauthorized: No active session" };
  }

  try {
    // 3. Fire the request to FastAPI, injecting the JWT into the Authorization header
    const response = await fetch("http://127.0.0.1:8000/api/protected", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      // Ensure Next.js doesn't aggressively cache this API call during testing
      cache: "no-store", 
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.detail || "Backend rejected the token" };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Backend fetch error:", err);
    return { success: false, error: "Failed to connect to Python backend. Is Uvicorn running?" };
  }
}