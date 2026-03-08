"use client";

import { useSuspenseQuery } from "@apollo/client";

import { Target, Play, XCircle, Calendar } from "lucide-react";

import { StatCard } from "./stat-card";
import { SCAN_STATS } from "@/graphql/queries/scan-stats";

interface ScansStatsImplData {
  total?: number;
  active?: number;
  queued?: number;
  completed?: number;
  failed?: number;
  draft?: number;
}

function ScansStatsImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data, error } = useSuspenseQuery(SCAN_STATS, {
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const stats: ScansStatsImplData = {
    total: data?.scanStats.totalScans,
    active: data?.scanStats.scansByStatus.active,
    queued: data?.scanStats.scansByStatus.queued,
    completed: data?.scanStats.scansByStatus.completed,
    failed: data?.scanStats.scansByStatus.failed,
    draft: data?.scanStats.scansByStatus.draft,
  };

  if (error) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Scans"
        icon={Target}
        value={<div className="text-2xl font-bold">{stats.total}</div>}
      />

      <StatCard
        title="Active"
        icon={Play}
        value={
          <div className="text-2xl font-bold text-yellow-600">
            {stats.active}
          </div>
        }
      />

      <StatCard
        title="Completed"
        icon={Calendar}
        value={
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
        }
      />

      <StatCard
        title="Failed"
        icon={XCircle}
        value={
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        }
      />
    </div>
  );
}

export { ScansStatsImpl };
