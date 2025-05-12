
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCheck, 
  Clock, 
  Truck, 
  TrendingUp 
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

const MetricCard = ({ title, value, change, icon, trend }: MetricCardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-gray-500";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {change && (
              <p className={`text-xs mt-1 ${getTrendColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WashMetricsOverviewProps {
  stats: {
    totalWashes: number;
    completedWashes: number;
    pendingWashes: number;
    averageCompletionTime: string;
    totalVehicles: number;
    washGrowth: string;
    completionRate: string;
    averageRating?: number;
  };
}

export function WashMetricsOverview({ stats }: WashMetricsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Washes"
        value={stats.totalWashes}
        change={stats.washGrowth}
        icon={<Truck className="h-6 w-6 text-primary" />}
        trend="up"
      />
      <MetricCard
        title="Completed Washes"
        value={stats.completedWashes}
        change={`${stats.completionRate} completion rate`}
        icon={<CheckCheck className="h-6 w-6 text-primary" />}
        trend="neutral"
      />
      <MetricCard
        title="Pending Washes"
        value={stats.pendingWashes}
        icon={<Clock className="h-6 w-6 text-primary" />}
      />
      <MetricCard
        title="Avg. Completion Time"
        value={stats.averageCompletionTime}
        icon={<TrendingUp className="h-6 w-6 text-primary" />}
      />
    </div>
  );
}
