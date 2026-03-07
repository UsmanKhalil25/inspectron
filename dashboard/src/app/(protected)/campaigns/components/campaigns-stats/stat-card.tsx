import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: React.ReactNode;
}

export function StatCard({ title, icon: Icon, value }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-5 w-5 text-inherit" />
        </CardHeader>
        <CardContent className="text-2xl font-bold flex items-center justify-start gap-2">
          {value}
        </CardContent>
      </Card>
    </motion.div>
  );
}
