"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

interface TerminalOutputProps {
  logs: string[];
}

export function TerminalOutput({ logs }: TerminalOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="border rounded-lg bg-slate-950 text-slate-50">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900">
        <Terminal className="h-4 w-4" />
        <span className="text-sm font-medium">Console Output</span>
      </div>
      <ScrollArea className="h-[400px]">
        <div ref={scrollRef} className="p-4 font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <div className="text-slate-500">Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-slate-300 break-all">
                {log}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

