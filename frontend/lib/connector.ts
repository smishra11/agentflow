// frontend/lib/connectors.ts

export function getOAuthUrl(connectorId: string): string {
  // We point this to the callback route we built earlier
  const redirectUri = "http://localhost:3000/api/connect/google/callback";
  const normalizedId = connectorId.toLowerCase();

  // Handle all Google Workspace tools using the single Google OAuth flow
  if (
    ["gmail", "googlecalendar", "googledrive", "google"].includes(normalizedId)
  ) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local");
    }

    const scopes = [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" ");

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
  }

  // Placeholder for Slack (to be implemented later)
  if (normalizedId === "slack") {
    throw new Error("Slack OAuth is not configured yet.");
  }

  // Placeholder for GitHub
  if (normalizedId === "github") {
    throw new Error("GitHub OAuth is not configured yet.");
  }

  throw new Error(`OAuth flow for ${connectorId} is not supported.`);
}
