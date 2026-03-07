"use client";

import { motion } from "motion/react";
import {
  Clock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Send,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const summaryData = [
  {
    title: "Active Campaigns",
    value: "12",
    description: "3 more than last month",
    icon: Target,
    trend: "up",
  },
  {
    title: "Messages Sent Today",
    value: "2,847",
    description: "18% increase from yesterday",
    icon: Send,
    trend: "up",
  },
  {
    title: "Average Delivery Time",
    value: "2.4s",
    description: "0.3s faster than average",
    icon: Clock,
    trend: "down",
  },
];

const recentCampaigns = [
  {
    name: "Summer Sale 2024",
    type: "Email",
    status: "Active",
    sent: 1250,
    total: 1500,
    lastUpdated: "2 hours ago",
  },
  {
    name: "Product Launch SMS",
    type: "SMS",
    status: "Completed",
    sent: 890,
    total: 890,
    lastUpdated: "1 day ago",
  },
  {
    name: "Newsletter Weekly",
    type: "Email",
    status: "Scheduled",
    sent: 0,
    total: 2300,
    lastUpdated: "3 hours ago",
  },
  {
    name: "Flash Sale Alert",
    type: "SMS",
    status: "Active",
    sent: 456,
    total: 600,
    lastUpdated: "30 minutes ago",
  },
  {
    name: "Customer Survey",
    type: "Email",
    status: "Draft",
    sent: 0,
    total: 1800,
    lastUpdated: "5 hours ago",
  },
];

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    case "scheduled":
      return "outline";
    case "draft":
      return "secondary";
    default:
      return "secondary";
  }
}
export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, Usman
        </h2>
        <p className="text-muted-foreground">
          {"Here's what's happening with your campaigns today."}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {summaryData.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Campaign Activity Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Recent Campaign Activity</CardTitle>
            <CardDescription>
              A summary of your recent campaign performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((campaign, index) => (
                  <motion.tr
                    key={campaign.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group"
                  >
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {campaign.type === "Email" ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                        {campaign.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {campaign.sent.toLocaleString()} /{" "}
                          {campaign.total.toLocaleString()}
                        </span>
                        <div className="h-2 w-20 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{
                              width: `${(campaign.sent / campaign.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {campaign.lastUpdated}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit campaign</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
