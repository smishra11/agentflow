"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchDashboardData() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/dashboard", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Crucial for live dashboards
    });

    if (!response.ok) {
      return { success: false, error: "Backend rejected request" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return { success: false, error: "Failed to connect to backend" };
  }
}