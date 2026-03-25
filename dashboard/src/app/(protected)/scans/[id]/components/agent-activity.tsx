"use client";

import { useSubscription, useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { Bot, Terminal, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCAN_EVENTS } from "@/graphql/subscriptions/scan-events";
import { SCAN } from "@/graphql/queries/scan";

interface AgentActivityProps {
  scanId: string;
  isScanning?: boolean;
}

export function AgentActivity({
  scanId,
  isScanning = true,
}: AgentActivityProps) {
  const { data: subscriptionData } = useSubscription(SCAN_EVENTS, {
    variables: { scanId },
  });

  const { data: scanData } = useQuery(SCAN, {
    variables: { id: scanId },
  });

  const [streamedEvents, setStreamedEvents] = useState<
    Array<{
      type: "step";
      data: {
        step?: number;
        action?: string;
        goal?: string;
        url?: string;
        timestamp?: string;
      };
    }>
  >([]);

  useEffect(() => {
    if (subscriptionData?.scanEvents) {
      const newEvent = subscriptionData.scanEvents;
      if (newEvent.type === "step") {
        setStreamedEvents((prev) => {
          const step = (newEvent.data as { step?: number }).step;
          if (step && !prev.some((e) => e.data.step === step)) {
            return [
              ...prev,
              {
                type: "step" as const,
                data: newEvent.data as {
                  step?: number;
                  action?: string;
                  goal?: string;
                  url?: string;
                  timestamp?: string;
                },
              },
            ];
          }
          return prev;
        });
      }
    }
  }, [subscriptionData]);

  const historicalActions = scanData?.scan?.actions || [];

  const events: Array<{
    type: "step";
    data: {
      step?: number;
      action?: string;
      goal?: string;
      url?: string;
      timestamp?: string;
    };
  }> = [
    ...historicalActions.map((action) => ({
      type: "step" as const,
      data: action,
    })),
    ...streamedEvents,
  ];

  return (
    <div className="flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden xl:w-[420px]">
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

type NormalizedEvent = {
  type: "step";
  data: {
    step?: number;
    action?: string;
    goal?: string;
    url?: string;
    timestamp?: string;
  };
};

function EventItem({ event }: { event: NormalizedEvent }) {
  if (event.type === "step") {
    return (
      <>
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Bot className="h-3 w-3 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {event.data.goal || `Executing ${event.data.action || "action"}...`}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="h-3 w-3" />
            <span className="font-medium text-violet-400">
              {event.data.action || "action"}()
            </span>
          </div>
          {event.data.url && (
            <div className="rounded-md border border-violet-500/20 bg-violet-500/5 px-3 py-2">
              <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {JSON.stringify({ url: event.data.url }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
}
