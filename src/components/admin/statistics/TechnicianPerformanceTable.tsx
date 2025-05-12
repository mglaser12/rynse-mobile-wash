
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TechnicianData {
  id: string;
  name: string;
  completedWashes: number;
  averageCompletionTime: string;
  rating?: number;
  vehiclesWashed: number;
}

interface TechnicianPerformanceTableProps {
  data: TechnicianData[];
}

export function TechnicianPerformanceTable({ data }: TechnicianPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Completed Washes</TableHead>
              <TableHead className="text-right">Avg. Completion Time</TableHead>
              <TableHead className="text-right">Vehicles Washed</TableHead>
              <TableHead className="text-right">Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((technician) => (
              <TableRow key={technician.id}>
                <TableCell className="font-medium">{technician.name}</TableCell>
                <TableCell className="text-right">{technician.completedWashes}</TableCell>
                <TableCell className="text-right">{technician.averageCompletionTime}</TableCell>
                <TableCell className="text-right">{technician.vehiclesWashed}</TableCell>
                <TableCell className="text-right">{technician.rating || 'N/A'}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No technician data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
