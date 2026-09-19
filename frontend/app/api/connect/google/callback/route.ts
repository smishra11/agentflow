import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // If the user clicked "Cancel" on the Google screen
  if (error) {
    return NextResponse.redirect(
      new URL("/connectors?error=access_denied", request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/connectors?error=no_code", request.url),
    );
  }

  // 1. Get the current authenticated user's session
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(
      new URL("/login?redirect=/connectors", request.url),
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
      return NextResponse.redirect(
        new URL("/connectors?error=exchange_failed", request.url),
      );
    }

    // 3. Success! Redirect the user back to the connectors dashboard
    return NextResponse.redirect(
      new URL("/connectors?success=google_connected", request.url),
    );
  } catch (err) {
    console.error("Failed to reach Python backend:", err);
    return NextResponse.redirect(
      new URL("/connectors?error=server_error", request.url),
    );
  }
}
