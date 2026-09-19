"use client";

import { Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Connector } from "./mock-data";
import { BrandIcon } from "./BrandIcon";

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const isConnected = connector.status === "connected";

  // Define the scopes our AI might need.
  // Adding them all into one Google consent screen prevents multiple logins.
  const GOOGLE_SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive.file",
  ].join(" ");

  const handleConnect = () => {
    if (
      ["gmail", "googlecalendar", "googledrive"].includes(
        connector.id.toLowerCase(),
      )
    ) {
      // We pass NEXT_PUBLIC_SUPABASE_URL just to get the frontend origin easily,
      // but hardcoding localhost for dev is fine too.
      const redirectUri = "http://localhost:3000/api/connect/google/callback";
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID; // Make sure to add this to .env.local!

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPES)}&access_type=offline&prompt=consent`;

      window.location.href = authUrl;
    } else {
      alert("This connector flow is not implemented yet.");
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border/40 bg-background/40 p-4 backdrop-blur-md transition-colors hover:border-border/80 hover:bg-zinc-900/40">
      <div>
        {/* Top Row: App Icon (Left) + Primary Action (Right) */}
        <div className="flex items-start justify-between">
          {/* Replace your existing icon div with this: */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-zinc-800/50 shadow-sm p-1.5">
            <BrandIcon
              id={connector.id}
              className="h-full w-full opacity-90 transition-opacity group-hover:opacity-100"
            />
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-emerald-400">
                Connected
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border/40 text-muted-foreground hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Disconnect or configure</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              className="h-8 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Connect
            </Button>
          )}
        </div>

        {/* Title Block */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {connector.name}
            </h3>
            {isConnected && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs uppercase text-muted-foreground">
            {connector.category}
          </p>
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {connector.description}
        </p>
      </div>

      {/* Configuration Footer - FIXED TEXT WRAPPING */}
      <div className="mt-4 rounded-lg border border-border/30 bg-black/20 p-3 text-xs">
        <div className="flex flex-col gap-2">
          {/* Changed items-center to items-start, added gap-3, shrink-0 on label, text-right on value */}
          <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-muted-foreground">Tier</span>
            <span className="font-medium text-foreground text-right leading-tight">
              {connector.freeTierNote}
            </span>
          </div>
          {connector.configSummary && (
            <div className="flex items-start justify-between gap-3">
              <span className="shrink-0 text-muted-foreground">Target</span>
              <span className="font-mono text-foreground text-right break-all leading-tight">
                {connector.configSummary}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
