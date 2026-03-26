"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

interface FinalResultProps {
  result: string;
  type: "completed" | "error";
  timestamp: string;
}

export function FinalResult({ result, type, timestamp }: FinalResultProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (type === "error") {
    return (
      <div className="flex flex-col gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error</span>
          <span className="text-sm text-red-400/60">{formattedTime}</span>
        </div>
        <div className="text-sm text-red-400/80 whitespace-pre-wrap leading-relaxed">
          {result}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
      <div className="flex items-center gap-2 text-emerald-400">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Task Completed</span>
        <span className="text-sm text-emerald-400/60">{formattedTime}</span>
      </div>
      <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
        {result}
      </div>
    </div>
  );
}
