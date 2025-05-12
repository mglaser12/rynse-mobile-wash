
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { WashStatus } from '@/models/types';

type TimeRange = '7days' | '30days' | '90days' | 'year' | 'all';

interface WashStatistics {
  overview: {
    totalWashes: number;
    completedWashes: number;
    pendingWashes: number;
    averageCompletionTime: string;
    totalVehicles: number;
    washGrowth: string;
    completionRate: string;
    averageRating?: number;
  };
  trends: Array<{
    date: string;
    completed: number;
    scheduled: number;
    cancelled: number;
  }>;
  technicianPerformance: Array<{
    id: string;
    name: string;
    completedWashes: number;
    averageCompletionTime: string;
    vehiclesWashed: number;
    rating?: number;
  }>;
  vehicleFrequency: Array<{
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    totalWashes: number;
    lastWashed: string;
    daysBetweenWashes: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function useWashStatistics() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [washStats, setWashStats] = useState<WashStatistics>({
    overview: {
      totalWashes: 0,
      completedWashes: 0,
      pendingWashes: 0,
      averageCompletionTime: '0h 0m',
      totalVehicles: 0,
      washGrowth: '0%',
      completionRate: '0%',
    },
    trends: [],
    technicianPerformance: [],
    vehicleFrequency: [],
    statusDistribution: [],
  });

  useEffect(() => {
    const fetchWashStatistics = async () => {
      setIsLoading(true);
      try {
        // Calculate date range based on selected time range
        const now = new Date();
        let startDate: Date;
        
        switch (timeRange) {
          case '7days':
            startDate = subDays(now, 7);
            break;
          case '30days':
            startDate = subDays(now, 30);
            break;
          case '90days':
            startDate = subDays(now, 90);
            break;
          case 'year':
            startDate = subDays(now, 365);
            break;
          case 'all':
          default:
            startDate = new Date(2000, 0, 1); // A date far in the past
            break;
        }
        
        // Fetch wash requests for the date range
        const { data: washRequests, error: washError } = await supabase
          .from('wash_requests')
          .select(`
            *,
            wash_request_vehicles(
              vehicle_id,
              vehicles:vehicle_id(make, model, license_plate)
            ),
            profiles:technician_id(name)
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (washError) {
          console.error('Error fetching wash requests:', washError);
          throw washError;
        }

        // Process overview metrics
        const totalWashes = washRequests?.length || 0;
        const completedWashes = washRequests?.filter(req => req.status === 'completed')?.length || 0;
        const pendingWashes = washRequests?.filter(req => req.status === 'pending')?.length || 0;
        
        // Calculate completion times for completed washes
        const completionTimes = washRequests
          ?.filter(req => req.status === 'completed')
          .map(req => {
            const createdAt = new Date(req.created_at);
            const updatedAt = new Date(req.updated_at);
            return (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
          }) || [];
          
        const averageCompletionHours = completionTimes.length 
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
          : 0;
          
        const hours = Math.floor(averageCompletionHours);
        const minutes = Math.floor((averageCompletionHours - hours) * 60);
        const averageCompletionTime = `${hours}h ${minutes}m`;

        // Calculate unique vehicles
        const uniqueVehicleIds = new Set<string>();
        washRequests?.forEach(req => {
          req.wash_request_vehicles?.forEach(vehicle => {
            if (vehicle.vehicle_id) {
              uniqueVehicleIds.add(vehicle.vehicle_id);
            }
          });
        });
        
        const totalVehicles = uniqueVehicleIds.size;
        
        // Calculate growth (comparing to previous period)
        let washGrowth = '0%';
        if (washRequests && washRequests.length > 0) {
          const midPoint = new Date((startDate.getTime() + now.getTime()) / 2);
          const recentWashes = washRequests.filter(req => new Date(req.created_at) >= midPoint).length;
          const olderWashes = washRequests.filter(req => new Date(req.created_at) < midPoint).length;
          
          if (olderWashes > 0) {
            const growthRate = ((recentWashes - olderWashes) / olderWashes) * 100;
            washGrowth = `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
          } else if (recentWashes > 0) {
            washGrowth = '+100%';
          }
        }
        
        // Calculate completion rate
        const completionRate = totalWashes > 0 
          ? `${((completedWashes / totalWashes) * 100).toFixed(1)}%` 
          : '0%';
          
        // Generate trend data
        const trendData: Record<string, { completed: number; scheduled: number; cancelled: number }> = {};
        
        // Initialize dates for the trend chart
        const dateFormat = timeRange === 'year' ? 'MMM yyyy' : 'MMM dd';
        let currentDate = new Date(startDate);
        
        while (currentDate <= now) {
          const dateKey = format(currentDate, dateFormat);
          trendData[dateKey] = { completed: 0, scheduled: 0, cancelled: 0 };
          
          // Increment by day or month depending on time range
          if (timeRange === 'year') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          } else {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        
        // Populate trend data
        washRequests?.forEach(req => {
          const dateKey = format(new Date(req.created_at), dateFormat);
          if (trendData[dateKey]) {
            if (req.status === 'completed') {
              trendData[dateKey].completed += 1;
            } else if (req.status === 'cancelled') {
              trendData[dateKey].cancelled += 1;
            } else {
              trendData[dateKey].scheduled += 1;
            }
          }
        });
        
        const trends = Object.entries(trendData).map(([date, counts]) => ({
          date,
          ...counts
        }));
        
        // Process technician performance
        const technicianMap: Record<string, {
          id: string;
          name: string;
          completedWashes: number;
          completionTimes: number[];
          vehiclesWashed: Set<string>;
        }> = {};
        
        washRequests?.forEach(req => {
          if (req.technician_id && req.status === 'completed') {
            if (!technicianMap[req.technician_id]) {
              technicianMap[req.technician_id] = {
                id: req.technician_id,
                name: req.profiles?.name || 'Unknown',
                completedWashes: 0,
                completionTimes: [],
                vehiclesWashed: new Set(),
              };
            }
            
            technicianMap[req.technician_id].completedWashes += 1;
            
            const createdAt = new Date(req.created_at);
            const updatedAt = new Date(req.updated_at);
            technicianMap[req.technician_id].completionTimes.push(
              (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
            );
            
            // Add vehicles washed
            req.wash_request_vehicles?.forEach(vehicle => {
              if (vehicle.vehicle_id) {
                technicianMap[req.technician_id].vehiclesWashed.add(vehicle.vehicle_id);
              }
            });
          }
        });
        
        const technicianPerformance = Object.values(technicianMap).map(tech => {
          const avgTime = tech.completionTimes.length
            ? tech.completionTimes.reduce((sum, time) => sum + time, 0) / tech.completionTimes.length
            : 0;
            
          const hours = Math.floor(avgTime);
          const minutes = Math.floor((avgTime - hours) * 60);
          
          return {
            id: tech.id,
            name: tech.name,
            completedWashes: tech.completedWashes,
            averageCompletionTime: `${hours}h ${minutes}m`,
            vehiclesWashed: tech.vehiclesWashed.size,
          };
        });
        
        // Process vehicle frequency data
        const vehicleWashMap: Record<string, {
          id: string;
          make: string;
          model: string;
          licensePlate: string;
          washDates: Date[];
        }> = {};
        
        washRequests?.forEach(req => {
          if (req.status === 'completed') {
            req.wash_request_vehicles?.forEach(vehicle => {
              if (vehicle.vehicle_id && vehicle.vehicles) {
                if (!vehicleWashMap[vehicle.vehicle_id]) {
                  vehicleWashMap[vehicle.vehicle_id] = {
                    id: vehicle.vehicle_id,
                    make: vehicle.vehicles.make || 'Unknown',
                    model: vehicle.vehicles.model || 'Unknown',
                    licensePlate: vehicle.vehicles.license_plate || 'Unknown',
                    washDates: [],
                  };
                }
                
                vehicleWashMap[vehicle.vehicle_id].washDates.push(new Date(req.updated_at));
              }
            });
          }
        });
        
        const vehicleFrequency = Object.values(vehicleWashMap)
          .map(vehicle => {
            // Sort wash dates
            const sortedDates = [...vehicle.washDates].sort((a, b) => a.getTime() - b.getTime());
            
            // Calculate average days between washes
            let totalDaysBetween = 0;
            let countIntervals = 0;
            
            for (let i = 1; i < sortedDates.length; i++) {
              const daysDiff = differenceInDays(sortedDates[i], sortedDates[i-1]);
              totalDaysBetween += daysDiff;
              countIntervals++;
            }
            
            const avgDaysBetween = countIntervals > 0
              ? Math.round(totalDaysBetween / countIntervals)
              : 0;
              
            return {
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              licensePlate: vehicle.licensePlate,
              totalWashes: vehicle.washDates.length,
              lastWashed: vehicle.washDates.length > 0
                ? format(Math.max(...vehicle.washDates.map(d => d.getTime())), 'MMM dd, yyyy')
                : 'Never',
              daysBetweenWashes: avgDaysBetween,
            };
          })
          .sort((a, b) => b.totalWashes - a.totalWashes);
          
        // Process status distribution
        const statusCounts: Record<string, number> = {
          'Completed': 0,
          'Pending': 0,
          'In Progress': 0,
          'Cancelled': 0,
          'Confirmed': 0,
        };
        
        washRequests?.forEach(req => {
          switch (req.status) {
            case 'completed':
              statusCounts['Completed']++;
              break;
            case 'pending':
              statusCounts['Pending']++;
              break;
            case 'in_progress':
              statusCounts['In Progress']++;
              break;
            case 'cancelled':
              statusCounts['Cancelled']++;
              break;
            case 'confirmed':
              statusCounts['Confirmed']++;
              break;
          }
        });
        
        const statusColors = {
          'Completed': '#22c55e', // green
          'Pending': '#eab308',   // yellow
          'In Progress': '#6366f1', // purple
          'Cancelled': '#ef4444', // red
          'Confirmed': '#3b82f6',  // blue
        };
        
        const statusDistribution = Object.entries(statusCounts)
          .filter(([_, count]) => count > 0)
          .map(([name, value]) => ({
            name,
            value,
            color: statusColors[name as keyof typeof statusColors],
          }));
        
        // Set all statistics
        setWashStats({
          overview: {
            totalWashes,
            completedWashes,
            pendingWashes,
            averageCompletionTime,
            totalVehicles,
            washGrowth,
            completionRate,
          },
          trends,
          technicianPerformance,
          vehicleFrequency,
          statusDistribution,
        });
        
      } catch (error) {
        console.error('Error in useWashStatistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWashStatistics();
  }, [timeRange]);
  
  return { isLoading, washStats, timeRange, setTimeRange };
}
