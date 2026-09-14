"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatInput } from "./chat-input";
import { ToolStatusCard } from "./tool-status-card";

type Message =
  | { id: string; role: "user"; content: string; time: string }
  | { id: string; role: "agent"; content: string; time: string }
  | {
      id: string;
      role: "tool";
      label: string;
      detail: string;
      status: "running" | "done";
      time: string;
    };

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content:
      "Pull the latest pricing pages for our top 3 competitors and summarize what changed this week.",
    time: "10:02 AM",
  },
  {
    id: "2",
    role: "agent",
    content:
      "On it — I'll scrape their pricing pages and diff against last week's snapshot.",
    time: "10:02 AM",
  },
  {
    id: "3",
    role: "tool",
    label: "Web Scrape",
    detail: "competitor-a.com/pricing",
    status: "done",
    time: "10:03 AM",
  },
  {
    id: "4",
    role: "tool",
    label: "Web Scrape",
    detail: "competitor-b.com/pricing",
    status: "done",
    time: "10:03 AM",
  },
  {
    id: "5",
    role: "tool",
    label: "Web Scrape",
    detail: "competitor-c.com/pricing",
    status: "running",
    time: "10:04 AM",
  },
];

function formatNow() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  function handleSend(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        time: formatNow(),
      },
    ]);
    // No backend/model wired yet — this only appends locally for now.
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      {/* Conversation context bar */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">
            Competitor Research Agent
          </p>
          <p className="text-xs text-muted-foreground">
            Web Scrape · RAG Pipeline
          </p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {messages.map((message, i) => {
          if (message.role === "tool") {
            return (
              <div key={message.id} className="mt-4">
                <ToolStatusCard
                  label={message.label}
                  detail={message.detail}
                  status={message.status}
                  time={message.time}
                />
              </div>
            );
          }

          const isUser = message.role === "user";
          const prev = messages[i - 1];
          const next = messages[i + 1];

          const isFirstInGroup = !prev || prev.role !== message.role;
          const isLastInGroup = !next || next.role !== message.role;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""} ${
                isFirstInGroup ? "mt-4" : "mt-1"
              }`}
            >
              <div className="w-7 shrink-0">
                {isFirstInGroup && (
                  <Avatar className="h-7 w-7">
                    {isUser ? (
                      <AvatarFallback className="bg-zinc-100 text-zinc-950 text-[11px] font-semibold">
                        SB
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary/25 to-primary/5 text-primary">
                        <Bot className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/10 rounded-tr-sm"
                    : "bg-zinc-900/60 border border-white/5 shadow-sm rounded-tl-sm"
                } ${isUser ? "" : "backdrop-blur-sm"}`}
              >
                <p>{message.content}</p>
                {isLastInGroup && (
                  <p
                    className={`mt-1 text-[10px] ${
                      isUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.time}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="pt-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
