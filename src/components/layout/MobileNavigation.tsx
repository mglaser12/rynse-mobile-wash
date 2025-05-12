
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Car, Calendar, User, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.FC<{ className?: string }>;
}

export function MobileNavigation() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  // Always show Locations for all customers, not just fleet managers
  const customerNavItems: NavigationItem[] = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Vehicles",
      href: "/vehicles",
      icon: Car,
    },
    {
      name: "Bookings",
      href: "/bookings",
      icon: Calendar,
    },
    // Always include Locations tab for all customers
    {
      name: "Locations",
      href: "/locations",
      icon: MapPin,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  const technicianNavItems: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: Calendar,
    },
    {
      name: "History",
      href: "/history",
      icon: Clock,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  const navItems = user?.role === "technician" ? technicianNavItems : customerNavItems;

  return (
    <nav className="bottom-navigation bg-white pb-safe-ios">
      <div className="flex justify-center items-center">
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center pt-1 pb-0.5 px-4 text-xs font-medium transition-all duration-150",
              pathname === item.href
                ? "text-brand-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon 
              className={cn(
                "h-5 w-5 mb-1",
                pathname === item.href && "text-brand-primary"
              )} 
            />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
