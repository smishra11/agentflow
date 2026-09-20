"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_CONNECTORS } from "../../connectors/mock-data";
import { PreflightCheck } from "@/components/deploy/preflight-check";
import { BrandIcon } from "../../connectors/BrandIcon";
import { CheckCircle2, ChevronRight, Box, Wrench, Rocket } from "lucide-react";
import { deployAgent } from "@/actions/agents";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, Clock } from "lucide-react";

const STEPS = [
  { id: 1, name: "Configure", desc: "Agent Brain", icon: Box },
  { id: 2, name: "Tools", desc: "Capabilities", icon: Wrench },
  { id: 3, name: "Pre-flight", desc: "Deploy", icon: Rocket },
];

const SCHEDULE_OPTIONS = [
  { id: "once", label: "Only Once", cron: "once" },
  { id: "hourly", label: "Every Hour", cron: "0 * * * *" },
  { id: "every-6h", label: "Every 6 Hours", cron: "0 */6 * * *" },
  { id: "daily-9", label: "Every Day at 9:00 AM", cron: "0 9 * * *" },
  { id: "daily-17", label: "Every Day at 5:00 PM", cron: "0 17 * * *" },
  { id: "weekly", label: "Every Monday at 9:00 AM", cron: "0 9 * * 1" },
];

interface CreateAgentFormProps {
  activeConnections: string[];
}

export function CreateAgentForm({ activeConnections }: CreateAgentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedule, setSchedule] = useState(SCHEDULE_OPTIONS[0]);

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((t) => t !== toolId)
        : [...prev, toolId],
    );
  };

  // 1. Load saved draft when returning from OAuth or navigating back
  useEffect(() => {
    const saved = sessionStorage.getItem("agentDraft");

    setTimeout(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as {
            name?: string;
            prompt?: string;
            tools?: string[];
            step?: number;
            schedule?: (typeof SCHEDULE_OPTIONS)[0];
          };

          if (parsed.name) setName(parsed.name);
          if (parsed.prompt) setPrompt(parsed.prompt);
          if (parsed.tools) setSelectedTools(parsed.tools);
          if (parsed.schedule) setSchedule(parsed.schedule);
          if (parsed.step) setStep(parsed.step);
        } catch (error) {
          console.error("Failed to parse agent draft:", error);
        }
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  // 2. Auto-save draft whenever inputs OR the current step changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem(
        "agentDraft",
        JSON.stringify({
          name,
          prompt,
          tools: selectedTools,
          step,
          schedule,
        }),
      );
    }
  }, [name, prompt, selectedTools, schedule, step, isLoaded]);

  const handleDeploy = () => {
    startTransition(async () => {
      try {
        await deployAgent({
          name,
          systemPrompt: prompt,
          tools: selectedTools,
          schedule: schedule.cron, // Only send the CRON string to the backend
        });

        // 3. Clear the draft on successful deployment
        sessionStorage.removeItem("agentDraft");
        router.push("/agents");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Deployment failed: ${errorMessage}`);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Premium Stepper */}
      <div className="relative flex w-full items-center justify-between rounded-2xl border border-border/40 bg-background/40 p-4 backdrop-blur-md">
        {STEPS.map((s, index) => {
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          const Icon = s.icon;

          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-500/10 text-blue-500"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : "border-border/50 bg-background/50 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-sm font-semibold leading-none ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && (
                <div className="mx-4 flex-1">
                  <div
                    className={`h-px w-full transition-colors ${isCompleted ? "bg-emerald-500/50" : "bg-border/50"}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Area - Locked w-full ensures it matches the stepper above perfectly */}
      <div className="w-full">
        {/* Step 1: Configuration */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col space-y-6 rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-md">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Agent Configuration
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Define the identity and core instructions for your agent.
              </p>
            </div>

            <div className="space-y-4 w-full">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Agent Name
                </label>
                <Input
                  placeholder="e.g., SDR Outreach Bot, Inbox Triage..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full bg-background/50 transition-colors hover:bg-background/80 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  System Prompt (Instructions)
                </label>
                <Textarea
                  placeholder="You are an autonomous assistant that will..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-45 w-full resize-none bg-background/50 text-sm leading-relaxed transition-colors hover:bg-background/80 focus:bg-background"
                />
              </div>

              {/* Premium shadcn Dropdown for Schedule */}
              <div className="space-y-3 pt-4 border-t border-border/40 mt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  Execution Schedule
                </label>
                <p className="mb-3 text-xs text-muted-foreground">
                  When should this agent wake up and run its tasks?
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex h-10 w-full items-center justify-between border-border/40 bg-background/50 px-3 text-foreground backdrop-blur-md hover:bg-zinc-900/50 hover:text-foreground"
                    >
                      <div className="flex items-center text-sm font-normal">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {schedule.label}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] border-border/40 bg-zinc-950/90 backdrop-blur-md"
                  >
                    {SCHEDULE_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.id}
                        onClick={() => setSchedule(opt)}
                        className="flex cursor-default items-center justify-between text-sm font-medium focus:bg-zinc-900/50"
                      >
                        {opt.label}
                        {schedule.id === opt.id && (
                          <Check className="h-4 w-4 text-foreground" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex justify-end border-t border-border/40 pt-4">
              <Button
                disabled={!name || !prompt}
                onClick={() => setStep(2)}
                className="h-9 shadow-sm"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tool Selection */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col space-y-6 rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-md">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Assign Tools
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select the capabilities this agent is authorized to use.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              {MOCK_CONNECTORS.map((tool) => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-border/40 bg-background/50 hover:border-border/80 hover:bg-background/80"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                        isSelected
                          ? "border-blue-500/50 bg-blue-500/20"
                          : "border-border/50 bg-zinc-800/50"
                      }`}
                    >
                      <BrandIcon id={tool.id} className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {tool.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <Button
                className="h-9 shadow-sm"
                variant="ghost"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="h-9 shadow-sm">
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pre-flight Gate */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 w-full">
            <PreflightCheck
              agentName={name}
              requiredTools={selectedTools}
              activeConnections={activeConnections}
              onDeploy={handleDeploy}
            />
            <div className="pt-4">
              <Button
                className="h-9 shadow-sm"
                variant="ghost"
                onClick={() => setStep(2)}
              >
                Back to Tools
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
