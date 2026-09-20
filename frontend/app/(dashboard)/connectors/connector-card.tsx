"use client";

import { useTransition } from "react";
import { Plus, Unplug, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Connector } from "./mock-data";
import { BrandIcon } from "./BrandIcon";
import { disconnectTool } from "@/actions/connectors";
import { getOAuthUrl } from "@/lib/connector";

interface ConnectorCardProps {
  connector: Connector;
}

export function ConnectorCard({ connector }: ConnectorCardProps) {
  const isConnected = connector.status === "connected";
  const [isPending, startTransition] = useTransition();

  const handleConnect = () => {
    try {
      window.location.assign(getOAuthUrl(connector.id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDisconnect = () => {
    // Adding a confirmation step prevents accidental disconnects
    if (
      !window.confirm(`Are you sure you want to disconnect ${connector.name}?`)
    )
      return;

    startTransition(async () => {
      try {
        await disconnectTool(connector.id);
      } catch (error) {
        alert("Failed to disconnect tool.");
      }
    });
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border/40 bg-background/40 p-4 backdrop-blur-md transition-colors hover:border-border/80 hover:bg-zinc-900/40">
      <div>
        {/* Top Row: App Icon (Left) + Primary Action (Right) */}
        <div className="flex items-start justify-between">
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
                onClick={handleDisconnect}
                disabled={isPending}
                className="h-8 w-8 border-border/40 text-muted-foreground transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                title="Disconnect tool"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
                <span className="sr-only">Disconnect</span>
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

      {/* Configuration Footer */}
      <div className="mt-4 rounded-lg border border-border/30 bg-black/20 p-3 text-xs">
        <div className="flex flex-col gap-2">
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
