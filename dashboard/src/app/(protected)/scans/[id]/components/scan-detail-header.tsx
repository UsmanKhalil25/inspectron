"use client";
import { ArrowLeft, ShieldAlert, Circle, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ScanDetailHeaderProps {
  url: string;
  status: string;
  scanId: string;
}

export function ScanDetailHeader({
  url,
  status,
  scanId,
}: ScanDetailHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4">
      <Link href="/scans">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
      </Link>

      <div className="h-4 w-px bg-zinc-800" />

      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="truncate  text-xs text-zinc-200">{url}</span>
        <span className="shrink-0  text-[10px] text-zinc-600">#{scanId}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1">
        <Circle className="h-1.5 w-1.5 fill-emerald-400 text-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400">{status}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </header>
  );
}
