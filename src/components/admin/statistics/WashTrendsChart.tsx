
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WashTrendsData {
  date: string;
  completed: number;
  scheduled: number;
  cancelled: number;
}

interface WashTrendsChartProps {
  data: WashTrendsData[];
}

export function WashTrendsChart({ data }: WashTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wash Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#22c55e" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="scheduled" 
                stroke="#3b82f6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cancelled" 
                stroke="#ef4444" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
