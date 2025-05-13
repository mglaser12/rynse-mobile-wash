
import React from "react";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WashMetricsOverview } from "@/components/admin/statistics/WashMetricsOverview";
import { WashTrendsChart } from "@/components/admin/statistics/WashTrendsChart";
import { TechnicianPerformanceTable } from "@/components/admin/statistics/TechnicianPerformanceTable";
import { VehicleWashFrequencyTable } from "@/components/admin/statistics/VehicleWashFrequencyTable";
import { WashStatusDistribution } from "@/components/admin/statistics/WashStatusDistribution";
import { useWashStatistics } from "@/hooks/admin/useWashStatistics";
import { PageHeader } from "@/components/admin/PageHeader";

export default function WashStatisticsPage() {
  const { user } = useAuth();
  const { 
    isLoading, 
    washStats, 
    timeRange, 
    setTimeRange 
  } = useWashStatistics();

  if (!user) {
    return <div className="flex items-center justify-center h-screen">
      <div>Not authenticated</div>
    </div>;
  }
  
  // Modified to allow customer role to access this page
  if (user.role !== "admin" && user.role !== "fleet_manager" && user.role !== "customer") {
    return <div className="flex items-center justify-center h-screen">
      <div>Access denied. Admin permission required.</div>
    </div>;
  }

  // Create complete stats object that matches the expected structure
  const completeStats = {
    overview: {
      totalWashes: washStats.overview?.totalWashes || 0,
      completedWashes: washStats.overview?.completedWashes || 0,
      pendingWashes: washStats.overview?.scheduledWashes || 0,
      averageCompletionTime: washStats.overview?.averageCompletionTime ? 
        `${washStats.overview.averageCompletionTime} mins` : "N/A",
      totalVehicles: washStats.overview?.totalVehicles || 0,
      washGrowth: washStats.overview?.washGrowth || "0%",
      completionRate: `${washStats.overview?.washCompletionRate || 0}%`,
      averageRating: washStats.overview?.averageRating
    }
  };

  // Transform technician performance data to include vehiclesWashed and convert averageCompletionTime to string
  const technicianData = washStats.technicianPerformance?.map(tech => ({
    ...tech,
    vehiclesWashed: tech.completedWashes || 0,
    averageCompletionTime: tech.averageCompletionTime ? 
      `${tech.averageCompletionTime} mins` : "N/A"
  })) || [];

  return (
    <div className="container py-6 space-y-6 max-w-7xl">
      <PageHeader heading="Wash Statistics Dashboard" text="Track and analyze wash metrics over time" />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <select 
          className="bg-background border rounded p-2"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="year">Last 12 months</option>
          <option value="all">All time</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading statistics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <WashMetricsOverview stats={completeStats.overview} />
          
          <Tabs defaultValue="trends">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Wash Trends</TabsTrigger>
              <TabsTrigger value="technicians">Technician Performance</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicle Frequency</TabsTrigger>
              <TabsTrigger value="status">Status Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="p-4 border rounded-md mt-2">
              <WashTrendsChart data={washStats.trends || []} />
            </TabsContent>
            
            <TabsContent value="technicians" className="p-4 border rounded-md mt-2">
              <TechnicianPerformanceTable data={technicianData} />
            </TabsContent>
            
            <TabsContent value="vehicles" className="p-4 border rounded-md mt-2">
              <VehicleWashFrequencyTable data={washStats.vehicleFrequency || []} />
            </TabsContent>
            
            <TabsContent value="status" className="p-4 border rounded-md mt-2">
              <WashStatusDistribution data={washStats.statusDistribution || []} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
