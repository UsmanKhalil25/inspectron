"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Globe } from "lucide-react";

interface CrawlResultsProps {
  urls: string[];
}

export function CrawlResults({ urls }: CrawlResultsProps) {
  if (urls.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Discovered URLs
          </CardTitle>
          <Badge variant="secondary">{urls.length} URLs</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 border"
              >
                <span className="text-sm truncate flex-1">{url}</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-slate-500 hover:text-slate-900"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

