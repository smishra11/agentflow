import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"; // Added for cache clearing

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state"); // Google passes this back to us

  // Determine where to send the user back to (default to connectors)
  const returnPath = state && state.startsWith("/") ? state : "/connectors";

  // If the user clicked "Cancel" on the Google screen
  if (error) {
    const errUrl = new URL(returnPath, request.url);
    errUrl.searchParams.set("error", "access_denied");
    return NextResponse.redirect(errUrl);
  }

  if (!code) {
    const errUrl = new URL(returnPath, request.url);
    errUrl.searchParams.set("error", "no_code");
    return NextResponse.redirect(errUrl);
  }

  // 1. Get the current authenticated user's session
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(returnPath)}`, request.url),
    );
  }

  // 2. Forward the code to our Python FastAPI backend
  const redirectUri = `${request.nextUrl.origin}/api/connect/google/callback`;

  try {
    const backendResponse = await fetch(
      "http://127.0.0.1:8000/api/connectors/google/exchange",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!backendResponse.ok) {
      const errData = await backendResponse.json();
      console.error("Backend OAuth Error:", errData);
      const errUrl = new URL(returnPath, request.url);
      errUrl.searchParams.set("error", "exchange_failed");
      return NextResponse.redirect(errUrl);
    }

    // 3. Clear frontend cache so the green checkmark shows immediately
    revalidatePath("/connectors");
    revalidatePath("/agents/create");

    // 4. Success! Redirect the user back to their original page
    const successUrl = new URL(returnPath, request.url);
    successUrl.searchParams.set("success", "google_connected");
    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Failed to reach Python backend:", err);
    const serverErrUrl = new URL(returnPath, request.url);
    serverErrUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(serverErrUrl);
  }
}
