
import React from "react";
import { WashRequest } from "@/models/types";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobHistoryProps {
  completedJobs: WashRequest[];
  onViewJobDetails: (requestId: string) => void;
}

export const JobHistory = ({ completedJobs, onViewJobDetails }: JobHistoryProps) => {
  // Function to get customer name based on ID
  const getCustomerName = (customerId: string) => {
    // Map the specific customer ID to the name
    if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
      return "ABC Denver";
    }
    // Default to customer ID if no mapping exists
    return customerId;
  };

  if (completedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            No completed jobs found in your history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    {format(job.updatedAt, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{getCustomerName(job.customerId)}</TableCell>
                  <TableCell>{job.vehicles.length}</TableCell>
                  <TableCell>${job.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewJobDetails(job.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
