
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
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface JobHistoryProps {
  completedJobs: WashRequest[];
  onViewJobDetails: (requestId: string) => void;
}

export const JobHistory = ({ completedJobs = [], onViewJobDetails }: JobHistoryProps) => {
  const isMobile = useIsMobile();
  
  // Function to get customer name based on ID
  const getCustomerName = (customerId: string) => {
    // Map the specific customer ID to the name
    if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
      return "ABC Denver";
    }
    // Default to customer ID if no mapping exists
    return customerId;
  };

  // Function to get appropriate badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case "confirmed":
        return <Badge className="bg-brand-primary hover:bg-brand-secondary">Scheduled</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!completedJobs || completedJobs.length === 0) {
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

  // Responsive table layout
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {isMobile ? (
            // Mobile card-based layout
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <Card key={job.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{getCustomerName(job.customerId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(job.updatedAt, "MMM dd, yyyy")}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Vehicles:</p>
                      <p>{job.vehicles ? job.vehicles.length : 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price:</p>
                      <p>${job.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onViewJobDetails(job.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop table layout
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{job.vehicles ? job.vehicles.length : 0}</TableCell>
                    <TableCell>${job.price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};
