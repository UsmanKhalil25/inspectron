"use client";

import { useSuspenseQuery } from "@apollo/client";

import { Target, Play, Calendar, Edit } from "lucide-react";

import { StatCard } from "./stat-card";
import { CAMPAIGN_STATS } from "@/graphql/queries/campaign-stats";

interface CampaignsStatsImplData {
  total?: number;
  active?: number;
  scheduled?: number;
  draft?: number;
}

function CampaignsStatsImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data, error } = useSuspenseQuery(CAMPAIGN_STATS, {
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const stats: CampaignsStatsImplData = {
    total: data?.campaignStats.totalCampaigns,
    active: data?.campaignStats.campaignsByStatus.active,
    scheduled: data?.campaignStats.campaignsByStatus.queued,
    draft: data?.campaignStats.campaignsByStatus.draft,
  };

  if (error) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Campaigns"
        icon={Target}
        value={<div className="text-2xl font-bold">{stats.total}</div>}
      />

      <StatCard
        title="Active"
        icon={Play}
        value={
          <div className="text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        }
      />

      <StatCard
        title="Scheduled"
        icon={Calendar}
        value={
          <div className="text-2xl font-bold text-blue-600">
            {stats.scheduled}
          </div>
        }
      />

      <StatCard
        title="Drafts"
        icon={Edit}
        value={
          <div className="text-2xl font-bold text-orange-600">
            {stats.draft}
          </div>
        }
      />
    </div>
  );
}

export { CampaignsStatsImpl };
