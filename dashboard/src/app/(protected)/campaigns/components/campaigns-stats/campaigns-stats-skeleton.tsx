"use client";

import { Target, Play, Calendar, Edit } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { StatCard } from "./stat-card";

const SKELETON_CLASS = "h-8 w-8 rounded-md";

export function CampaignsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Campaigns"
        icon={Target}
        value={<Skeleton className={SKELETON_CLASS} />}
      />

      <StatCard
        title="Active"
        icon={Play}
        value={<Skeleton className={SKELETON_CLASS} />}
      />

      <StatCard
        title="Scheduled"
        icon={Calendar}
        value={<Skeleton className={SKELETON_CLASS} />}
      />

      <StatCard
        title="Drafts"
        icon={Edit}
        value={<Skeleton className={SKELETON_CLASS} />}
      />
    </div>
  );
}
