import { Terminal, CheckCircle2 } from "lucide-react";

export function ToolStatusCard({
  label,
  detail,
  status,
  time,
}: {
  label: string;
  detail: string;
  status: "running" | "done";
  time: string;
}) {
  const isRunning = status === "running";

  return (
    <div
      className={`ml-10 flex items-center justify-between rounded-xl border bg-gradient-to-r from-background/70 to-background/30 px-3.5 py-3 max-w-[75%] backdrop-blur-sm transition-colors ${
        isRunning
          ? "border-blue-500/25 shadow-[0_0_0_1px_rgba(59,130,246,0.05)]"
          : "border-emerald-500/15"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          {isRunning && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isRunning ? "bg-blue-500" : "bg-emerald-500"
            }`}
          />
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            isRunning ? "bg-blue-500/10" : "bg-emerald-500/10"
          }`}
        >
          <Terminal
            className={`h-3.5 w-3.5 ${isRunning ? "text-blue-400" : "text-emerald-500"}`}
          />
        </div>
        <div>
          <p className="text-xs font-medium leading-tight">{label}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {detail}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        {!isRunning && (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        )}
        <span
          className={
            isRunning
              ? "text-blue-400 font-medium"
              : "text-emerald-500 font-medium"
          }
        >
          {isRunning ? "Running" : "Done"}
        </span>
        <span className="text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}
