"use client";
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground/40">
          {formattedTime}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
        {result}
      </p>
    </div>
  );
}
