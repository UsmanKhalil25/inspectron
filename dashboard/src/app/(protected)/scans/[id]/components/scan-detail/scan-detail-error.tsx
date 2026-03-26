"use client";

import { AlertTriangle } from "lucide-react";

interface ScanDetailErrorProps {
  title?: string;
  description?: string;
}

export function ScanDetailError({
  title = "Failed to load scan",
  description = "We're having trouble connecting to our servers. Please check your connection and try again.",
}: ScanDetailErrorProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
