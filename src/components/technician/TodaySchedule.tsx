
import React from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarClock, SquarePlay, CheckCircle, Wrench } from "lucide-react";
import { EmptySchedule } from "./EmptySchedule";
import { format } from "date-fns";

interface TodayScheduleProps {
  inProgressRequests: WashRequest[];
  assignedRequests: WashRequest[];
  onRequestClick: (requestId: string) => void;
  onStartWash: (requestId: string) => void;
  onReopenWash: (requestId: string) => void;
  onCompleteWash: (requestId: string) => void;
}

export const TodaySchedule = ({ 
  inProgressRequests, 
  assignedRequests, 
  onRequestClick,
  onStartWash,
  onReopenWash,
  onCompleteWash
}: TodayScheduleProps) => {
  // Filter assigned requests for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayAssigned = assignedRequests.filter(req => {
    if (!req.preferredDates?.start) return false;
    
    const reqDate = new Date(req.preferredDates.start);
    reqDate.setHours(0, 0, 0, 0);
    
    return reqDate.getTime() === today.getTime();
  });
  
  const hasJobsToday = inProgressRequests.length > 0 || todayAssigned.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasJobsToday ? (
          <EmptySchedule />
        ) : (
          <div className="space-y-4">
            {/* In progress jobs */}
            {inProgressRequests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                  <Wrench className="h-4 w-4 mr-1 text-yellow-600" />
                  In Progress
                </h3>
                <div className="space-y-2">
                  {inProgressRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="border rounded-md p-3 flex justify-between items-center bg-yellow-50"
                    >
                      <div>
                        <h4 className="font-medium">
                          Wash for {request.vehicleDetails?.length || 0} vehicle(s)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.location?.name || "Unknown location"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onRequestClick(request.id)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onReopenWash(request.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          Continue Wash
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Today's assigned jobs */}
            {todayAssigned.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary" />
                  Scheduled Today
                </h3>
                <div className="space-y-2">
                  {todayAssigned.map((request) => (
                    <div 
                      key={request.id} 
                      className="border rounded-md p-3 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-medium">
                          Wash for {request.vehicleDetails?.length || 0} vehicle(s)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.preferredDates?.start ? (
                            format(new Date(request.preferredDates.start), "h:mm a")
                          ) : (
                            "No time specified"
                          )}
                          {" | "}
                          {request.location?.name || "Unknown location"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onRequestClick(request.id)}
                        >
                          Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => onStartWash(request.id)}
                          className="gap-1"
                        >
                          <SquarePlay className="h-4 w-4" />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
