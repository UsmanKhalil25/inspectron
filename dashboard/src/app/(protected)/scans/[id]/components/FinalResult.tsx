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
      <div className="flex flex-col gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error</span>
          <span className="text-sm text-red-400">{formattedTime}</span>
        </div>
        <div className="text-sm text-red-700 whitespace-pre-wrap">{result}</div>
      </div>
    );
  }

  // Format result as markdown-like content
  const formatResult = (text: string): string => {
    // Handle basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Bold
      .replace(/\*(.*?)\*/g, "*$1*") // Italic
      .replace(/`(.*?)`/g, "`$1`") // Code
      .replace(/\n/g, "\n\n"); // Paragraphs
  };

  const formattedResult = formatResult(result);

  return (
    <div className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Task Completed</span>
        <span className="text-sm text-green-400">{formattedTime}</span>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {formattedResult}
        </div>
      </div>
    </div>
  );
}
