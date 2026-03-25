"use client";

import { useSubscription, useQuery } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
import { Bot, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCAN_EVENTS } from "@/graphql/subscriptions/scan-events";
import { SCAN } from "@/graphql/queries/scan";
import { AgentMessage } from "./AgentMessage";
import { FinalResult } from "./FinalResult";

interface AgentActivityChatProps {
  scanId: string;
  isScanning?: boolean;
}

interface ScanAction {
  step: number;
  timestamp: string;
  thinking: string | null;
  action: {
    name: string;
    params: Record<string, unknown>;
    display: string;
  };
  context: {
    url: string;
    title: string;
  };
}

interface ScanEvent {
  type: "step" | "completed" | "error";
  data: ScanAction;
  result?: string;
  message?: string;
  timestamp?: string;
}

export function AgentActivityChat({
  scanId,
  isScanning = true,
}: AgentActivityChatProps) {
  const { data: subscriptionData } = useSubscription(SCAN_EVENTS, {
    variables: { scanId },
  });

  const { data: scanData } = useQuery(SCAN, {
    variables: { id: scanId },
  });

  const [streamedEvents, setStreamedEvents] = useState<ScanEvent[]>([]);
  const [finalResult, setFinalResult] = useState<{
    result: string;
    timestamp: string;
    type: "completed" | "error";
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subscriptionData?.scanEvents) {
      const newEvent = subscriptionData.scanEvents;

      if (newEvent.type === "step") {
        setStreamedEvents((prev) => {
          const step = (newEvent.data as ScanAction).step;
          // Check if we already have this step
          const exists = prev.some(
            (e) => e.type === "step" && (e.data as ScanAction).step === step,
          );
          if (!exists) {
            return [
              ...prev,
              { type: "step", data: newEvent.data as ScanAction },
            ];
          }
          return prev;
        });
      } else if (newEvent.type === "completed") {
        setFinalResult({
          result: newEvent.result || "",
          timestamp: newEvent.timestamp || "",
          type: "completed",
        });
      } else if (newEvent.type === "error") {
        setFinalResult({
          result: newEvent.message || "",
          timestamp: newEvent.timestamp || "",
          type: "error",
        });
      }
    }
  }, [subscriptionData]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamedEvents, finalResult]);

  const historicalActions = (scanData?.scan?.actions as ScanAction[]) || [];

  // Combine historical and streamed events
  const allEvents: ScanEvent[] = [
    ...historicalActions.map((action) => ({
      type: "step" as const,
      data: action,
    })),
    ...streamedEvents,
  ];

  return (
    <div className="flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden xl:w-[420px]">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Agent Activity
        </span>
        {isScanning && !finalResult && (
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Running
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4 p-4">
            {allEvents.length === 0 && !finalResult && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Waiting for agent to start...
                </p>
              </div>
            )}

            {allEvents.map((event, index) => {
              if (event.type === "step") {
                const action = event.data as ScanAction;
                const isLatest =
                  index === allEvents.length - 1 && isScanning && !finalResult;
                return (
                  <AgentMessage
                    key={`${action.step}-${action.timestamp}`}
                    step={action.step}
                    thinking={action.thinking}
                    action={action.action}
                    context={action.context}
                    timestamp={action.timestamp}
                    isLatest={isLatest}
                  />
                );
              }
              return null;
            })}

            {/* Final Result */}
            {finalResult && (
              <FinalResult
                result={finalResult.result}
                type={finalResult.type}
                timestamp={finalResult.timestamp}
              />
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
