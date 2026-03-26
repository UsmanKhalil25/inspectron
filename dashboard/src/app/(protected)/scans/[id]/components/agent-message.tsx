"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";

interface AgentMessageProps {
  step: number;
  thinking: string | null;
  action: {
    name: string;
    display: string;
  };
  context: {
    url: string;
    title: string;
  };
  timestamp: string;
  isLatest?: boolean;
}

export function AgentMessage({
  step,
  thinking,
  action,
  context,
  timestamp,
  isLatest = false,
}: AgentMessageProps) {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-gray-100 last:border-b-0">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Step {step}</span>
        <span>•</span>
        <span>{formattedTime}</span>
      </div>

      {/* Thinking section (collapsible) */}
      {thinking && (
        <div className="bg-gray-50 rounded-md">
          <button
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-1 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isThinkingExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">Thinking</span>
          </button>
          {isThinkingExpanded && (
            <div className="px-3 pb-3 text-sm text-gray-600 leading-relaxed">
              {thinking}
            </div>
          )}
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium text-gray-800">
          {action.display}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-violet-500 font-medium">{action.name}</span>
          <span>•</span>
          <span className="truncate">{context.title || "Untitled page"}</span>
        </div>
      </div>

      {/* Context */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="truncate">{context.url}</span>
      </div>

      {/* Typing indicator for latest message */}
      {isLatest && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-gray-400">Processing...</span>
        </div>
      )}
    </div>
  );
}
