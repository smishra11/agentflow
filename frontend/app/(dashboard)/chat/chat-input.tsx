"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    resize(e.target);
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter falls through to default behavior — inserts a newline
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900 p-2.5 shadow-lg shadow-black/20 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Message Competitor Research Agent..."
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground max-h-40 leading-relaxed"
      />
      <Button
        size="icon"
        className="h-8 w-8 shrink-0"
        disabled={value.trim().length === 0}
        onClick={handleSend}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
