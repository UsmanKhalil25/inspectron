"use client";

import { useSubscription } from "@apollo/client";
import { Bot, Terminal, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCAN_EVENTS } from "@/graphql/subscriptions/scan-events";
import { ScanEventsSubscription } from "@/__generated__/graphql";

interface AgentActivityProps {
	scanId: string;
	isScanning?: boolean;
}

export function AgentActivity({ scanId, isScanning = true }: AgentActivityProps) {
	const { data } = useSubscription(SCAN_EVENTS, {
		variables: { scanId },
	});

	const events = data?.scanEvents ? [data.scanEvents] : [];

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

type ScanEvent = NonNullable<ScanEventsSubscription["scanEvents"]>;

function EventItem({ event }: { event: ScanEvent }) {
	if (event.type === "step") {
		return (
			<>
				<div className="flex gap-3">
					<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
						<Bot className="h-3 w-3 text-primary" />
					</div>
					<p className="text-sm leading-relaxed text-foreground/90">
						{event.data?.goal || `Executing ${event.data?.action || "action"}...`}
					</p>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Terminal className="h-3 w-3" />
						<span className="font-medium text-violet-400">
							{event.data?.action || "action"}()
						</span>
					</div>
					{event.data?.url && (
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

	if (event.type === "completed") {
		return (
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<CheckCircle className="h-3 w-3 text-emerald-400" />
					<span className="text-emerald-400 font-medium">Completed</span>
				</div>
				{event.data?.result && (
					<div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
						<p className="text-[12px] text-muted-foreground leading-relaxed">
							{event.data.result}
						</p>
					</div>
				)}
			</div>
		);
	}

	if (event.type === "error") {
		return (
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<AlertCircle className="h-3 w-3 text-red-400" />
					<span className="text-red-400 font-medium">Error</span>
				</div>
				<div className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
					<p className="text-[12px] text-red-300/80 leading-relaxed">
						{event.data?.message || "An error occurred"}
					</p>
				</div>
			</div>
		);
	}

	return null;
}
