"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { BrandIcon } from "@/app/(dashboard)/connectors/BrandIcon";
import { getOAuthUrl } from "@/lib/connector";

interface PreflightCheckProps {
  agentName: string;
  requiredTools: string[];
  activeConnections: string[];
  onDeploy: () => void;
}

export function PreflightCheck({
  agentName,
  requiredTools,
  activeConnections,
  onDeploy,
}: PreflightCheckProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  // HELPER: Maps specific tools to their master DB provider
  const getDbProvider = (toolId: string) => {
    const normalized = toolId.toLowerCase();
    if (["gmail", "googlecalendar", "googledrive"].includes(normalized)) {
      return "google";
    }
    return normalized;
  };

  // FIXED: Check using the mapped DB provider name
  const allConnected = requiredTools.every((tool) =>
    activeConnections.includes(getDbProvider(tool)),
  );

  const handleConnect = (toolId: string) => {
    try {
      const authUrl = getOAuthUrl(toolId);

      const urlWithReturn = new URL(authUrl);
      urlWithReturn.searchParams.set("state", "/agents/create");

      window.location.assign(urlWithReturn.toString());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    await onDeploy();
    setIsDeploying(false);
  };

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-md">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Pre-flight Check
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {agentName || "This agent"} requires access to the following services
          before it can be deployed.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {requiredTools.length === 0 ? (
          <div className="rounded-lg border border-border/40 bg-background/50 p-4 text-center text-sm text-muted-foreground">
            No tools assigned. This agent will run on text-only capabilities.
          </div>
        ) : (
          requiredTools.map((tool) => {
            // FIXED: Check connection status using the helper
            const isConnected = activeConnections.includes(getDbProvider(tool));

            return (
              <div
                key={tool}
                className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
                  isConnected
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                      isConnected
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    <BrandIcon id={tool} className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {tool.replace("google", "Google ")}
                      </p>
                      {isConnected && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isConnected
                        ? "Connection verified"
                        : "Authorization required"}
                    </p>
                  </div>
                </div>

                {!isConnected && (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(tool)}
                    className="bg-amber-500 text-amber-950 hover:bg-amber-600"
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-6">
        <div className="flex items-center gap-2 text-sm">
          {!allConnected && requiredTools.length > 0 && (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-amber-500/90 font-medium text-xs">
                Connect all tools to continue
              </span>
            </>
          )}
        </div>

        <Button
          disabled={!allConnected || isDeploying}
          onClick={handleDeploy}
          className="w-32 bg-foreground text-background hover:bg-foreground/90"
        >
          {isDeploying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Deploy Agent"
          )}
        </Button>
      </div>
    </div>
  );
}
