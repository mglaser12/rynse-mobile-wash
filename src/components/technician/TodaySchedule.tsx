
import React from "react";
import { WashRequest } from "@/models/types";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle } from "lucide-react";
import { EmptySchedule } from "./EmptySchedule";

interface TodayScheduleProps {
  inProgressRequests: WashRequest[];
  assignedRequests: WashRequest[];
  onRequestClick: (id: string) => void;
  onStartWash: (id: string) => void;
  onCompleteWash: (id: string) => void;
}

export const TodaySchedule = ({
  inProgressRequests,
  assignedRequests,
  onRequestClick,
  onStartWash,
  onCompleteWash
}: TodayScheduleProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-brand-primary" />
        Today's Schedule
      </h2>
      
      {inProgressRequests.length > 0 ? (
        <div className="mt-3 space-y-4">
          {inProgressRequests.map(request => (
            <WashRequestCard
              key={request.id}
              washRequest={request}
              onClick={() => onRequestClick(request.id)}
              actions={
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteWash(request.id);
                  }}
                  className="w-full mt-2"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              }
            />
          ))}
        </div>
      ) : assignedRequests.length > 0 ? (
        <div className="mt-3 space-y-4">
          {assignedRequests.map(request => (
            <WashRequestCard
              key={request.id}
              washRequest={request}
              onClick={() => onRequestClick(request.id)}
              actions={
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartWash(request.id);
                  }}
                  className="w-full mt-2"
                >
                  Start Wash
                </Button>
              }
            />
          ))}
        </div>
      ) : (
        <EmptySchedule />
      )}
    </div>
  );
};
