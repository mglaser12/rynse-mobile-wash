
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';

interface MetricStats {
  totalWashes: number;
  completedWashes: number;
  scheduledWashes: number;
  cancelledWashes: number;
  averageRating: number;
  washCompletionRate: number;
  totalVehicles?: number;
  washGrowth?: string;
  averageCompletionTime?: number;
}

interface TechnicianPerformance {
  id: string;
  name: string;
  totalWashes: number;
  completedWashes: number;
  averageRating: number;
  averageCompletionTime: number;
}

interface VehicleFrequency {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  totalWashes: number;
  lastWashed: string;
  daysBetweenWashes: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

interface TrendsData {
  date: string;
  completed: number;
  scheduled: number;
  cancelled: number;
}

interface WashStatistics {
  overview: MetricStats;
  technicianPerformance: TechnicianPerformance[];
  vehicleFrequency: VehicleFrequency[];
  statusDistribution: StatusDistribution[];
  trends: TrendsData[];
}

const defaultStats: WashStatistics = {
  overview: {
    totalWashes: 0,
    completedWashes: 0,
    scheduledWashes: 0,
    cancelledWashes: 0,
    averageRating: 0,
    washCompletionRate: 0,
    totalVehicles: 0,
    washGrowth: "0%",
    averageCompletionTime: 0
  },
  technicianPerformance: [],
  vehicleFrequency: [],
  statusDistribution: [
    { name: 'Completed', value: 0, color: '#22c55e' },
    { name: 'Scheduled', value: 0, color: '#3b82f6' },
    { name: 'Cancelled', value: 0, color: '#ef4444' },
    { name: 'In Progress', value: 0, color: '#f59e0b' }
  ],
  trends: []
};

export function useWashStatistics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [washStats, setWashStats] = useState<WashStatistics>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchStatistics() {
      setIsLoading(true);
      try {
        // Fetch data based on time range
        const timeRangeFilter = getTimeFilter(timeRange);
        
        // Get wash requests - FIXED QUERY to use proper join through wash_request_vehicles
        const { data: washRequests, error } = await supabase
          .from('wash_requests')
          .select(`
            *,
            wash_request_vehicles!inner(
              vehicle_id,
              vehicles:vehicle_id(*)
            ),
            technician:technician_id(id, profiles(id, name))
          `)
          .gte('created_at', timeRangeFilter);

        if (error) {
          console.error("Error fetching wash statistics:", error);
          setIsLoading(false);
          return;
        }

        // Calculate statistics
        if (washRequests) {
          const stats = calculateStatistics(washRequests);
          setWashStats(stats);
        }

      } catch (err) {
        console.error("Unexpected error in fetch statistics:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatistics();
  }, [timeRange]);

  return { isLoading, washStats, timeRange, setTimeRange };
}

function getTimeFilter(range: TimeRange): string {
  const now = new Date();
  
  switch (range) {
    case '7days':
      now.setDate(now.getDate() - 7);
      break;
    case '30days':
      now.setDate(now.getDate() - 30);
      break;
    case '90days':
      now.setDate(now.getDate() - 90);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return '2000-01-01'; // Far back in time to get all records
  }
  
  return now.toISOString();
}

function calculateStatistics(washRequests: any[]): WashStatistics {
  // Process the raw data into statistics
  
  // Overview metrics
  const totalWashes = washRequests.length;
  const completedWashes = washRequests.filter(w => w.status === 'completed').length;
  const scheduledWashes = washRequests.filter(w => ['scheduled', 'pending'].includes(w.status)).length;
  const cancelledWashes = washRequests.filter(w => w.status === 'cancelled').length;
  const inProgressWashes = washRequests.filter(w => w.status === 'in_progress').length;
  
  // Calculate average rating from completed washes with ratings
  const ratingsSum = washRequests
    .filter(w => w.status === 'completed' && w.rating)
    .reduce((sum, w) => sum + (w.rating || 0), 0);
  
  const ratedWashesCount = washRequests
    .filter(w => w.status === 'completed' && w.rating).length;
  
  const averageRating = ratedWashesCount > 0 ? ratingsSum / ratedWashesCount : 0;
  
  // Wash completion rate
  const washCompletionRate = totalWashes > 0 
    ? (completedWashes / totalWashes) * 100 
    : 0;

  // Get unique vehicles
  const uniqueVehicleIds = new Set();
  washRequests.forEach(wash => {
    if (wash.vehicles && wash.vehicles.id) {
      uniqueVehicleIds.add(wash.vehicles.id);
    }
  });
  const totalVehicles = uniqueVehicleIds.size;

  // Calculate average completion time
  const completionTimes = washRequests
    .filter(w => w.status === 'completed' && w.completed_at && w.started_at)
    .map(w => {
      const completionTime = new Date(w.completed_at).getTime() - new Date(w.started_at).getTime();
      return completionTime / (1000 * 60); // in minutes
    });

  const averageCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    : 0;

  // Calculate wash growth (dummy calculation for now)
  const washGrowth = "5%"; // Placeholder for actual growth calculation

  // Technician performance
  const technicianMap = new Map<string, any>();
  
  washRequests.forEach(wash => {
    if (wash.technician && wash.technician.profiles) {
      const techId = wash.technician.profiles.id;
      const techName = wash.technician.profiles.name;
      
      if (!technicianMap.has(techId)) {
        technicianMap.set(techId, {
          id: techId,
          name: techName,
          totalWashes: 0,
          completedWashes: 0,
          ratings: [],
          completionTimes: []
        });
      }
      
      const techData = technicianMap.get(techId);
      techData.totalWashes++;
      
      if (wash.status === 'completed') {
        techData.completedWashes++;
        
        if (wash.rating) {
          techData.ratings.push(wash.rating);
        }
        
        if (wash.completed_at && wash.started_at) {
          const completionTime = new Date(wash.completed_at).getTime() - new Date(wash.started_at).getTime();
          techData.completionTimes.push(completionTime / (1000 * 60)); // in minutes
        }
      }
    }
  });
  
  const technicianPerformance = Array.from(technicianMap.values()).map(tech => {
    const avgRating = tech.ratings.length > 0 
      ? tech.ratings.reduce((sum: number, r: number) => sum + r, 0) / tech.ratings.length
      : 0;
    
    const avgCompletionTime = tech.completionTimes.length > 0
      ? tech.completionTimes.reduce((sum: number, t: number) => sum + t, 0) / tech.completionTimes.length
      : 0;
    
    return {
      id: tech.id,
      name: tech.name,
      totalWashes: tech.totalWashes,
      completedWashes: tech.completedWashes,
      averageRating: Number(avgRating.toFixed(1)),
      averageCompletionTime: Number(avgCompletionTime.toFixed(0))
    };
  });
  
  // Vehicle frequency
  const vehicleMap = new Map<string, any>();
  
  washRequests.forEach(wash => {
    const vehicle = wash.vehicles;
    if (vehicle) {
      if (!vehicleMap.has(vehicle.id)) {
        vehicleMap.set(vehicle.id, {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          licensePlate: vehicle.license_plate,
          washes: [],
        });
      }
      
      vehicleMap.get(vehicle.id).washes.push({
        date: wash.created_at,
        status: wash.status
      });
    }
  });
  
  const vehicleFrequency = Array.from(vehicleMap.values()).map(vehicle => {
    // Sort washes by date
    const sortedWashes = [...vehicle.washes].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastWashed = sortedWashes.length > 0 ? sortedWashes[0].date : 'Never';
    const totalWashes = sortedWashes.length;
    
    // Calculate average days between washes
    let daysBetweenWashes = 0;
    if (sortedWashes.length > 1) {
      let totalDays = 0;
      for (let i = 0; i < sortedWashes.length - 1; i++) {
        const daysDiff = (
          new Date(sortedWashes[i].date).getTime() - 
          new Date(sortedWashes[i+1].date).getTime()
        ) / (1000 * 3600 * 24);
        totalDays += daysDiff;
      }
      daysBetweenWashes = Math.round(totalDays / (sortedWashes.length - 1));
    }
    
    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      totalWashes: totalWashes,
      lastWashed: new Date(lastWashed).toLocaleDateString(),
      daysBetweenWashes: daysBetweenWashes
    };
  });
  
  // Status distribution
  const statusDistribution = [
    { name: 'Completed', value: completedWashes, color: '#22c55e' },
    { name: 'Scheduled', value: scheduledWashes, color: '#3b82f6' },
    { name: 'Cancelled', value: cancelledWashes, color: '#ef4444' },
    { name: 'In Progress', value: inProgressWashes, color: '#f59e0b' }
  ];
  
  // Generate trends data
  const trendData = generateTrendData(washRequests);
  
  return {
    overview: {
      totalWashes,
      completedWashes,
      scheduledWashes,
      cancelledWashes,
      averageRating: Number(averageRating.toFixed(1)),
      washCompletionRate: Number(washCompletionRate.toFixed(1)),
      totalVehicles,
      washGrowth,
      averageCompletionTime: Number(averageCompletionTime.toFixed(0))
    },
    technicianPerformance: technicianMap ? Array.from(technicianMap.values()).map(tech => {
      const avgRating = tech.ratings && tech.ratings.length > 0 
        ? tech.ratings.reduce((sum: number, r: number) => sum + r, 0) / tech.ratings.length
        : 0;
      
      const avgCompletionTime = tech.completionTimes && tech.completionTimes.length > 0
        ? tech.completionTimes.reduce((sum: number, t: number) => sum + t, 0) / tech.completionTimes.length
        : 0;
      
      return {
        id: tech.id,
        name: tech.name,
        totalWashes: tech.totalWashes,
        completedWashes: tech.completedWashes,
        averageRating: Number(avgRating.toFixed(1)),
        averageCompletionTime: Number(avgCompletionTime.toFixed(0))
      };
    }) : [],
    vehicleFrequency: vehicleMap ? Array.from(vehicleMap.values()).map(vehicle => {
      // Sort washes by date
      const sortedWashes = [...vehicle.washes].sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastWashed = sortedWashes.length > 0 ? sortedWashes[0].date : 'Never';
      const totalWashes = sortedWashes.length;
      
      // Calculate average days between washes
      let daysBetweenWashes = 0;
      if (sortedWashes.length > 1) {
        let totalDays = 0;
        for (let i = 0; i < sortedWashes.length - 1; i++) {
          const daysDiff = (
            new Date(sortedWashes[i].date).getTime() - 
            new Date(sortedWashes[i+1].date).getTime()
          ) / (1000 * 3600 * 24);
          totalDays += daysDiff;
        }
        daysBetweenWashes = Math.round(totalDays / (sortedWashes.length - 1));
      }
      
      return {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        totalWashes: vehicle.washes?.length || 0,
        lastWashed: vehicle.washes && vehicle.washes.length > 0 
          ? new Date(vehicle.washes[0].date).toLocaleDateString() 
          : 'Never',
        daysBetweenWashes: vehicle.daysBetweenWashes || 0
      };
    }) : [],
    statusDistribution,
    trends: trendData
  };
}

function generateTrendData(washRequests: any[]): TrendsData[] {
  const dateMap = new Map<string, TrendsData>();
  
  // Group washes by date
  washRequests.forEach(wash => {
    const date = new Date(wash.created_at).toISOString().split('T')[0];
    
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date: date,
        completed: 0,
        scheduled: 0,
        cancelled: 0
      });
    }
    
    const dateData = dateMap.get(date)!;
    
    if (wash.status === 'completed') {
      dateData.completed++;
    } else if (['scheduled', 'pending'].includes(wash.status)) {
      dateData.scheduled++;
    } else if (wash.status === 'cancelled') {
      dateData.cancelled++;
    }
  });
  
  // Convert to array and sort by date
  let trendArray = Array.from(dateMap.values());
  trendArray.sort((a, b) => a.date.localeCompare(b.date));
  
  // For nicer display, limit to max 15 data points
  if (trendArray.length > 15) {
    // Group by larger time periods
    const groupedData: TrendsData[] = [];
    const chunkSize = Math.ceil(trendArray.length / 15);
    
    for (let i = 0; i < trendArray.length; i += chunkSize) {
      const chunk = trendArray.slice(i, i + chunkSize);
      const firstDate = chunk[0].date;
      const lastDate = chunk[chunk.length - 1].date;
      const displayDate = `${firstDate} - ${lastDate}`;
      
      const aggregatedData = {
        date: displayDate,
        completed: chunk.reduce((sum, item) => sum + item.completed, 0),
        scheduled: chunk.reduce((sum, item) => sum + item.scheduled, 0),
        cancelled: chunk.reduce((sum, item) => sum + item.cancelled, 0)
      };
      
      groupedData.push(aggregatedData);
    }
    
    trendArray = groupedData;
  }
  
  return trendArray;
}
