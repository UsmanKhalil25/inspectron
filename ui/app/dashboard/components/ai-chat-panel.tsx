"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AiMessage, CrawlStatus } from "../types";

interface AiChatPanelProps {
  messages: AiMessage[];
  pendingQuestion: string | null;
  onResponse: (response: string) => void;
  crawlStatus: CrawlStatus;
}

export function AiChatPanel({
  messages,
  pendingQuestion,
  onResponse,
  crawlStatus,
}: AiChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onResponse(input);
    setInput("");
  };

  const quickResponses = [
    "Skip this section",
    "Continue with defaults",
    "Show more details",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <div className="flex size-6 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="size-3 text-primary" />
        </div>
        <span className="text-sm font-medium">AI Assistant</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary mb-4">
              <Bot className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">AI Crawler Assistant</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              I&apos;ll help guide the crawl and ask for your input when needed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    message.role === "assistant"
                      ? "bg-primary/20"
                      : "bg-secondary",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="size-4 text-primary" />
                  ) : (
                    <User className="size-4 text-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm",
                    message.role === "assistant"
                      ? "bg-secondary"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Quick Responses */}
      {pendingQuestion && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2">Quick responses:</p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response) => (
              <Button
                key={response}
                variant="outline"
                size="sm"
                className="text-xs h-7 bg-transparent"
                onClick={() => onResponse(response)}
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder={
              crawlStatus === "idle"
                ? "Start a crawl to chat..."
                : "Type your response..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={crawlStatus === "idle"}
            className="bg-secondary/50 border-border focus:bg-secondary"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || crawlStatus === "idle"}
            className="shrink-0"
          >
            <Send className="size-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
