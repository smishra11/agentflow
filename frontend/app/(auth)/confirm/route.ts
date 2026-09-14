import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect from Supabase auth emails (password reset, signup confirm, etc.)
// Supabase's @supabase/ssr client uses PKCE by default, so the email link lands here
// with a `code` param that must be exchanged server-side for a real session/cookie
// before the user can be sent to a page that expects to be authenticated.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code missing or invalid/expired — send back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
