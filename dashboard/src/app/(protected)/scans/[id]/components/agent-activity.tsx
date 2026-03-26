"use client";

import { useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import { Bot, Terminal, Loader2, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCAN_EVENTS } from "@/graphql/subscriptions/scan-events";
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

export function AgentActivity({ scan, fullWidth = false }: AgentActivityProps) {
  const isScanning = scan.status === "ACTIVE" || scan.status === "QUEUED";

  const { data: subscriptionData } = useSubscription(SCAN_EVENTS, {
    variables: { scanId: scan.id },
  });

  const [streamedEvents, setStreamedEvents] = useState<
    Array<{
      type: "step";
      data: ScanAction;
    }>
  >([]);

  useEffect(() => {
    if (subscriptionData?.scanEvents) {
      const newEvent = subscriptionData.scanEvents;
      if (newEvent.type === "step") {
        setStreamedEvents((prev) => {
          const step = (newEvent.data as ScanAction).step;
          if (step && !prev.some((e) => e.data.step === step)) {
            return [
              ...prev,
              {
                type: "step" as const,
                data: newEvent.data as ScanAction,
              },
            ];
          }
          return prev;
        });
      }
    }
  }, [subscriptionData]);

  const historicalActions = (scan.actions as ScanAction[]) || [];

  const events: Array<{
    type: "step";
    data: ScanAction;
  }> = [
    ...historicalActions.map((action) => ({
      type: "step" as const,
      data: action,
    })),
    ...streamedEvents,
  ];

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
              <EventItem key={index} event={event} />
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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function EventItem({ event }: { event: { type: "step"; data: ScanAction } }) {
  if (event.type === "step") {
    const action = event.data;
    return (
      <>
        {/* Thinking (collapsible) */}
        {action.thinking && <ThinkingSection thinking={action.thinking} />}

        {/* Action display */}
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Bot className="h-3 w-3 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {action.action.display}
          </p>
        </div>

        {/* Action details */}
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
