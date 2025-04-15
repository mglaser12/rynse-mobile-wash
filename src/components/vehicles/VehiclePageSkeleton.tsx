
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function VehiclePageSkeleton() {
  return (
    <>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Your Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your vehicle details</p>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-9 w-[120px]" />
          </div>
          
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        
        <Skeleton className="h-[1px] w-full my-6" />
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    </>
  );
}
