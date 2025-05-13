import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { WashRequestCard } from "@/components/shared/WashRequestCard";

interface CustomerCalendarViewProps {
  washRequests: WashRequest[];
  onSelectRequest: (request: WashRequest) => void;
}

export const CustomerCalendarView = ({ washRequests, onSelectRequest }: CustomerCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Sort wash requests by createdAt date (most recent first)
  const sortedWashRequests = [...washRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Group wash requests by date
  const washRequestsByDate = sortedWashRequests.reduce((acc, request) => {
    if (!request.preferredDates?.start) return acc;
    
    const dateKey = format(new Date(request.preferredDates.start), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(request);
    return acc;
  }, {} as Record<string, WashRequest[]>);
  
  // Get dates with wash requests for highlighting on calendar
  const datesWithWashes = Object.keys(washRequestsByDate).map(dateStr => new Date(dateStr));
  
  // Get wash requests for the selected date
  const selectedDateRequests = washRequestsByDate[format(selectedDate, "yyyy-MM-dd")] || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border p-3 pointer-events-auto"
              modifiers={{
                hasWash: datesWithWashes
              }}
              modifiersStyles={{
                hasWash: {
                  fontWeight: 'bold',
                  position: 'relative'
                }
              }}
              components={{
                Day: (props: any) => {
                  const date = props.date;
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hasWash = washRequestsByDate[dateStr] && washRequestsByDate[dateStr].length > 0;
                  const isSelected = isSameDay(date, selectedDate);
                  const washCount = washRequestsByDate[dateStr]?.length || 0;
                  
                  return (
                    <div 
                      {...props} 
                      className={`${props.className} ${hasWash ? 'cursor-pointer font-medium' : ''} ${isSelected ? 'bg-primary text-white' : ''}`}
                    >
                      {date.getDate()}
                      {hasWash && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          {washCount > 1 && (
                            <span className="text-[0.6rem] ml-1 absolute -right-3 -bottom-0.5 text-primary font-medium">
                              {washCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-md font-medium mb-3">
          Washes on {format(selectedDate, "MMMM d, yyyy")}
        </h3>
        
        {selectedDateRequests.length > 0 ? (
          <div className="space-y-3">
            {selectedDateRequests.map(request => (
              <WashRequestCard 
                key={request.id} 
                washRequest={request}
                onClick={() => onSelectRequest(request)}
                showDetailsButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted rounded-md">
            <p className="text-muted-foreground">No washes scheduled for this date</p>
          </div>
        )}
      </div>
    </div>
  );
};
