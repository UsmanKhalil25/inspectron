import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Scan Details",
  description: "View scan progress and results",
};

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 border-b px-6 py-4">
        <Link href="/scans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Scan Details</h1>
          <p className="text-sm text-muted-foreground">
            https://example.com
          </p>
        </div>
        <Badge variant="secondary">ACTIVE</Badge>
        <Button variant="destructive" size="sm">
          Cancel
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Browser View - Left Side */}
        <div className="flex-1 border-r">
          <Card className="h-full rounded-none border-0">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm font-medium">Browser Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[calc(100%-3.5rem)] items-center justify-center p-0">
              <div className="text-center text-muted-foreground">
                <p>Browser preview will appear here</p>
                <p className="text-xs">Screenshots from the agent will be displayed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel - Right Side */}
        <div className="w-[400px] flex flex-col">
          <Card className="h-full rounded-none border-0 flex flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm font-medium">Agent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Agent messages and tool calls will appear here
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Send a message to the agent..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            disabled
          />
          <Button disabled>Send</Button>
        </div>
      </div>
    </div>
  );
}
