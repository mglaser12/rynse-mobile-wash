
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarRange } from "lucide-react";

export const EmptySchedule = () => {
  return (
    <div className="border border-dashed rounded-lg p-6 mt-3 text-center">
      <CalendarRange className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
      <h3 className="font-medium">No active jobs</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        You don't have any active jobs at the moment
      </p>
      <Button
        variant="outline"
        onClick={() => {}}
        className="mx-auto"
      >
        View Available Jobs
      </Button>
    </div>
  );
};
