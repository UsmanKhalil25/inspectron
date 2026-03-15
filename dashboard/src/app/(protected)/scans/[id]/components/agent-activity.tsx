"use client";

import { Bot, Terminal, Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentActivityProps {
  url: string;
}

export function AgentActivity({ url }: AgentActivityProps) {
  return (
    <div className="flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden xl:w-[420px]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Agent Activity
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Running
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                Starting scan on {url}. I&apos;ll navigate to the target and
                begin reconnaissance.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Terminal className="h-3 w-3" />
                <span className="font-mono font-medium text-violet-400">
                  navigate()
                </span>
              </div>
              <div className="rounded-md border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                <pre className="font-mono text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {`{ "url": "${url}" }`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-medium">Result</span>
              </div>
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Navigated successfully. Page title: Example Domain. Status:
                  200 OK.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                Page loaded. Checking for common vulnerabilities in headers and
                cookies.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Terminal className="h-3 w-3" />
                <span className="font-mono font-medium text-violet-400">
                  check_headers()
                </span>
              </div>
              <div className="rounded-md border border-violet-500/20 bg-violet-500/5 px-3 py-2">
                <pre className="font-mono text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {`{ "target": "${url}" }`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <span className="text-red-400 font-medium">Issue detected</span>
              </div>
              <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-[12px] text-red-300/80 leading-relaxed">
                  Missing security headers: Content-Security-Policy,
                  X-Frame-Options.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <span className="text-red-400 font-medium">Issue detected</span>
              </div>
              <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-[12px] text-red-300/80 leading-relaxed">
                  Missing security headers: Content-Security-Policy,
                  X-Frame-Options.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <span className="text-red-400 font-medium">Issue detected</span>
              </div>
              <div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-[12px] text-red-300/80 leading-relaxed">
                  Missing security headers: Content-Security-Policy,
                  X-Frame-Options.
                </p>
              </div>
            </div>

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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
