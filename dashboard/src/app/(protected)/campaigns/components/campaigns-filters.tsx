"use client";

import { Calendar, Tag, Filter } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { SortByFilter } from "@/components/ui/sort-by-filter";
import { SortOrderButton } from "@/components/ui/sort-order-button";
import { CampaignsStatusFilter } from "./campaigns-status-filters";

const sortOptions = [
  { value: "created_at", label: "Created Date", icon: Calendar },
  { value: "updated_at", label: "Updated Date", icon: Calendar },
  { value: "name", label: "Name", icon: Tag },
  { value: "status", label: "Status", icon: Filter },
];

function CampaignsFilters() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <CampaignsStatusFilter />
      <div className="flex items-center bg-muted/40 rounded-lg border border-border/60 overflow-hidden">
        <SortByFilter paramKey="sortBy" options={sortOptions} />
        <Separator orientation="vertical" className="h-6" />
        <SortOrderButton
          paramKey="sortOrder"
          labels={{ asc: "Oldest", desc: "Newest" }}
        />
      </div>
    </div>
  );
}

export { CampaignsFilters };
