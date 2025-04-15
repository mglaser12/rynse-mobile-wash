import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ChevronRight, Settings, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getAvatarFallback = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png" 
            alt="Rynse Logo" 
            className="h-8 mr-3" 
          />
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in">
        <div className="flex flex-col items-center mb-6 py-4">
          <Avatar className="h-24 w-24 mb-4">
            {user?.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user?.name || "User"} />
            ) : null}
            <AvatarFallback className="text-2xl">{getAvatarFallback()}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Badge className="mt-2" variant="outline">
            {user?.role === "technician" ? "Wash Technician" : "Fleet Manager"}
          </Badge>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="divide-y">
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Personal Information</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Notifications</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="divide-y">
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>Help & Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>About Rynse</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
