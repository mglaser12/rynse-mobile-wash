
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

interface VehicleFrequencyData {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  totalWashes: number;
  lastWashed: string;
  daysBetweenWashes: number;
}

interface VehicleWashFrequencyTableProps {
  data: VehicleFrequencyData[];
}

export function VehicleWashFrequencyTable({ data }: VehicleWashFrequencyTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Wash Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead className="text-right">Total Washes</TableHead>
              <TableHead className="text-right">Last Washed</TableHead>
              <TableHead className="text-right">Avg. Days Between</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.make} {vehicle.model}</TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell className="text-right">{vehicle.totalWashes}</TableCell>
                <TableCell className="text-right">{vehicle.lastWashed}</TableCell>
                <TableCell className="text-right">{vehicle.daysBetweenWashes}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No vehicle data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
