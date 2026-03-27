"use client";

import { useSubscription, useMutation } from "@apollo/client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Terminal,
  Loader2,
  ChevronRight,
  Send,
  HelpCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCAN_EVENTS } from "@/graphql/subscriptions/scan-events";
import { SEND_AGENT_MESSAGE } from "@/graphql/mutations/send-agent-message";
import { FinalResult, type VulnerabilityItem } from "./final-result";
import type { GetScanQuery } from "@/__generated__/graphql";

interface AgentActivityProps {
  scan: GetScanQuery["scan"];
  fullWidth?: boolean;
}

interface ScanAction {
  step: number;
  timestamp: string;
  thinking: string | null;
  action: {
    name: string;
    params: string;
    display: string;
  };
  context: {
    url: string;
    title: string;
  };
}

type StreamedEvent =
  | { type: "step"; data: ScanAction }
  | { type: "completed"; result: string; timestamp: string }
  | { type: "error"; message: string; timestamp: string }
  | { type: "user_message"; message: string; timestamp: string }
  | { type: "question"; message: string; timestamp: string };

export function AgentActivity({ scan, fullWidth = false }: AgentActivityProps) {
  const isScanning = scan.status === "ACTIVE" || scan.status === "QUEUED";

  const { data: subscriptionData } = useSubscription(SCAN_EVENTS, {
    variables: { scanId: scan.id },
  });

  const [streamedEvents, setStreamedEvents] = useState<StreamedEvent[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [sendAgentMessage, { loading: sending }] =
    useMutation(SEND_AGENT_MESSAGE);

  useEffect(() => {
    if (subscriptionData?.scanEvents) {
      const newEvent = subscriptionData.scanEvents;

      if (newEvent.type === "step") {
        setStreamedEvents((prev) => {
          const step = (newEvent.data as ScanAction).step;
          if (
            step &&
            !prev.some((e) => e.type === "step" && e.data.step === step)
          ) {
            return [
              ...prev,
              { type: "step" as const, data: newEvent.data as ScanAction },
            ];
          }
          return prev;
        });
      } else if (newEvent.type === "completed") {
        const ts = newEvent.timestamp ?? new Date().toISOString();
        setStreamedEvents((prev) => {
          if (
            prev.some(
              (e) =>
                e.type === "completed" &&
                (e as { type: "completed"; timestamp: string }).timestamp ===
                  ts,
            )
          )
            return prev;
          return [
            ...prev,
            {
              type: "completed" as const,
              result: newEvent.result ?? "",
              timestamp: ts,
            },
          ];
        });
      } else if (newEvent.type === "error") {
        const ts = newEvent.timestamp ?? new Date().toISOString();
        setStreamedEvents((prev) => {
          if (
            prev.some(
              (e) =>
                e.type === "error" &&
                (e as { type: "error"; timestamp: string }).timestamp === ts,
            )
          )
            return prev;
          return [
            ...prev,
            {
              type: "error" as const,
              message: newEvent.message ?? "",
              timestamp: ts,
            },
          ];
        });
      } else if (newEvent.type === "user_message") {
        const ts = newEvent.timestamp ?? new Date().toISOString();
        setStreamedEvents((prev) => {
          if (
            prev.some(
              (e) =>
                e.type === "user_message" &&
                (e as { type: "user_message"; timestamp: string }).timestamp ===
                  ts,
            )
          )
            return prev;
          return [
            ...prev,
            {
              type: "user_message" as const,
              message: newEvent.message ?? "",
              timestamp: ts,
            },
          ];
        });
      } else if (newEvent.type === "question") {
        const ts = newEvent.timestamp ?? new Date().toISOString();
        setStreamedEvents((prev) => {
          if (
            prev.some(
              (e) =>
                e.type === "question" &&
                (e as { type: "question"; timestamp: string }).timestamp === ts,
            )
          )
            return prev;
          return [
            ...prev,
            {
              type: "question" as const,
              message: newEvent.message ?? "",
              timestamp: ts,
            },
          ];
        });
      }
    }
  }, [subscriptionData]);

  // Auto-scroll when events change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedEvents.length]);

  const historicalActions = (scan.actions as ScanAction[]) || [];
  const isCompleted = scan.status === "COMPLETED";
  const isFailed = scan.status === "FAILED";
  const isTerminal = isCompleted || isFailed;

  // Once terminal, drop ephemeral completed/error events — they'll come from scan.result
  const liveEvents = isTerminal
    ? streamedEvents.filter((e) => e.type !== "completed" && e.type !== "error")
    : streamedEvents;

  const events: StreamedEvent[] = [
    ...historicalActions.map((action) => ({
      type: "step" as const,
      data: action,
    })),
    ...liveEvents,
    // Persisted result — survives refresh and remount
    ...(isCompleted && scan.result
      ? [
          {
            type: "completed" as const,
            result: scan.result,
            timestamp: String(scan.updatedAt),
          },
        ]
      : []),
    ...(isFailed
      ? [
          {
            type: "error" as const,
            message: scan.result ?? "Scan failed",
            timestamp: String(scan.updatedAt),
          },
        ]
      : []),
  ];

  const handleSend = useCallback(async () => {
    const content = messageInput.trim();
    if (!content || sending) return;
    setMessageInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendAgentMessage({
      variables: { input: { scanId: scan.id, content } },
    });
  }, [messageInput, sending, sendAgentMessage, scan.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden ${fullWidth ? "flex-1 w-full" : "w-[360px] shrink-0 xl:w-[420px]"}`}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Agent Activity
        </span>
        {isScanning && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Running
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4">
            {events.length === 0 && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Waiting for agent to start...
                </p>
              </div>
            )}

            {events.map((event, index) => (
              <EventItem
                key={index}
                event={event}
                vulnerabilities={
                  isTerminal && event.type === "completed"
                    ? (scan.vulnerabilities as VulnerabilityItem[] | null)
                    : null
                }
              />
            ))}

            {isScanning && events.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {isScanning && (
        <div className="shrink-0 border-t bg-muted/20 p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Queue message..."
              rows={1}
              className="flex-1 resize-none overflow-hidden rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              style={{ minHeight: "36px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventItem({
  event,
  vulnerabilities,
}: {
  event: StreamedEvent;
  vulnerabilities?: VulnerabilityItem[] | null;
}) {
  if (event.type === "step") {
    const action = event.data;
    return (
      <>
        {action.thinking && <ThinkingSection thinking={action.thinking} />}

        <div className="flex gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Bot className="h-3 w-3 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {action.action.display}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="h-3 w-3" />
            <span className="font-medium text-violet-400">
              {action.action.name}()
            </span>
          </div>
          <div className="rounded-md border border-violet-500/20 bg-violet-500/5 px-3 py-2">
            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(
                {
                  url: action.context.url,
                  title: action.context.title,
                  params: action.action.params
                    ? JSON.parse(action.action.params)
                    : null,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </>
    );
  }

  if (event.type === "completed") {
    return (
      <FinalResult
        result={event.result}
        type="completed"
        timestamp={event.timestamp}
        vulnerabilities={vulnerabilities}
      />
    );
  }

  if (event.type === "error") {
    return (
      <FinalResult
        result={event.message}
        type="error"
        timestamp={event.timestamp}
      />
    );
  }

  if (event.type === "user_message") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-foreground/90">
          {event.message}
        </div>
      </div>
    );
  }

  if (event.type === "question") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <p className="text-sm leading-relaxed text-amber-200/90">
          {event.message}
        </p>
      </div>
    );
  }

  return null;
}

function ThinkingSection({ thinking }: { thinking: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="text-sm">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronRight
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <span>Thinking</span>
      </button>

      <div
        className={`grid transition-all duration-200 ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden text-gray-600 leading-relaxed">
          {thinking}
        </div>
      </div>
    </div>
  );
}
