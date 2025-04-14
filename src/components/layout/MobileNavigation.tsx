
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Car, Calendar, User, Clock } from "lucide-react";
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
    <nav className="bottom-navigation bg-white">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex flex-col items-center pt-1 pb-0.5 px-4 text-xs font-medium",
            pathname === item.href
              ? "text-brand-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}
