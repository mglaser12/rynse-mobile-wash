import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Car } from "lucide-react";
import { useVehicles } from "@/contexts/VehicleContext";

export const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssigningVehicles, setIsAssigningVehicles] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [defaultOrg, setDefaultOrg] = useState<string | null>(null);
  
  // Load organizations
  const loadOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const { data, error } = await supabase.from('organizations').select('*');
      
      if (error) {
        console.error("Error loading organizations:", error);
        toast.error("Failed to load organizations");
        return;
      }
      
      setOrganizations(data || []);
      
      // Set the first org as default if any exists
      if (data && data.length > 0) {
        setDefaultOrg(data[0].id);
      }
    } catch (error) {
      console.error("Error in loadOrganizations:", error);
      toast.error("An error occurred while loading organizations");
    } finally {
      setIsLoadingOrgs(false);
    }
  };
  
  // Load users
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      
      if (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error in loadUsers:", error);
      toast.error("An error occurred while loading users");
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Load all vehicles
  const loadVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const { data, error } = await supabase.from('vehicles').select('*');
      
      if (error) {
        console.error("Error loading vehicles:", error);
        toast.error("Failed to load vehicles");
        return;
      }
      
      setVehicles(data || []);
    } catch (error) {
      console.error("Error in loadVehicles:", error);
      toast.error("An error occurred while loading vehicles");
    } finally {
      setIsLoadingVehicles(false);
    }
  };
  
  // Assign user to organization
  const assignUserToOrg = async () => {
    if (!selectedUser || !selectedOrg) {
      toast.error("Please select both a user and an organization");
      return;
    }
    
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: selectedOrg })
        .eq('id', selectedUser);
        
      if (error) {
        console.error("Error assigning user to organization:", error);
        toast.error("Failed to assign user to organization");
        return;
      }
      
      toast.success("User successfully assigned to organization");
      
      // Refresh users list
      await loadUsers();
    } catch (error) {
      console.error("Error in assignUserToOrg:", error);
      toast.error("An error occurred while assigning user to organization");
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Assign vehicles to organization
  const assignVehiclesToOrg = async () => {
    if (!selectedOrg || selectedVehicles.length === 0) {
      toast.error("Please select both vehicles and an organization");
      return;
    }
    
    setIsAssigningVehicles(true);
    try {
      // Update each selected vehicle with the organization ID
      for (const vehicleId of selectedVehicles) {
        const { error } = await supabase
          .from('vehicles')
          .update({ organization_id: selectedOrg })
          .eq('id', vehicleId);
          
        if (error) {
          console.error(`Error assigning vehicle ${vehicleId} to organization:`, error);
          toast.error(`Failed to assign vehicle ${vehicleId}`);
        }
      }
      
      toast.success(`${selectedVehicles.length} vehicles assigned to organization`);
      
      // Refresh vehicles list
      await loadVehicles();
      setSelectedVehicles([]);
    } catch (error) {
      console.error("Error in assignVehiclesToOrg:", error);
      toast.error("An error occurred while assigning vehicles to organization");
    } finally {
      setIsAssigningVehicles(false);
    }
  };
  
  // Assign all vehicles to the default organization
  const assignAllVehiclesToDefaultOrg = async () => {
    if (!defaultOrg) {
      toast.error("No default organization found");
      return;
    }
    
    setIsAssigningVehicles(true);
    try {
      // Get all vehicles without an organization
      const { data, error } = await supabase
        .from('vehicles')
        .select('id')
        .is('organization_id', null);
        
      if (error) {
        console.error("Error getting vehicles without organization:", error);
        toast.error("Failed to get vehicles");
        return;
      }
      
      if (!data || data.length === 0) {
        toast.info("No vehicles without an organization found");
        setIsAssigningVehicles(false);
        return;
      }
      
      // Update all vehicles to the default organization
      const vehicleIds = data.map(v => v.id);
      
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ organization_id: defaultOrg })
        .is('organization_id', null);
        
      if (updateError) {
        console.error("Error assigning vehicles to default organization:", updateError);
        toast.error("Failed to assign vehicles to default organization");
        return;
      }
      
      toast.success(`${vehicleIds.length} vehicles assigned to default organization`);
      
      // Refresh vehicles list
      await loadVehicles();
    } catch (error) {
      console.error("Error in assignAllVehiclesToDefaultOrg:", error);
      toast.error("An error occurred while assigning vehicles to default organization");
    } finally {
      setIsAssigningVehicles(false);
    }
  };
  
  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId: string) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    loadOrganizations();
    loadUsers();
    loadVehicles();
  }, []);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organizations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Organizations</span>
              <Button
                size="sm"
                variant="outline"
                onClick={loadOrganizations}
                disabled={isLoadingOrgs}
              >
                {isLoadingOrgs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrgs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.length > 0 ? (
                  organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedOrg === org.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedOrg(org.id)}
                    >
                      <div className="font-medium">{org.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">ID: {org.id}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No organizations found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Users</span>
              <Button
                size="sm"
                variant="outline"
                onClick={loadUsers}
                disabled={isLoadingUsers}
              >
                {isLoadingUsers && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedUser === user.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="font-medium">{user.name || user.email || "Unnamed User"}</div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Role: {user.role || "None"}</span>
                        <span>Org: {user.organization_id || "None"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">ID: {user.id}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Assign User to Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Assign User to Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Selected User</Label>
              <Input 
                value={selectedUser || ''} 
                readOnly 
                placeholder="Click on a user to select"
              />
            </div>
            
            <div>
              <Label>Selected Organization</Label>
              <Input 
                value={selectedOrg || ''} 
                readOnly 
                placeholder="Click on an organization to select"
              />
            </div>
            
            <Button
              className="w-full"
              onClick={assignUserToOrg}
              disabled={isAssigning || !selectedUser || !selectedOrg}
            >
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign User to Organization
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Vehicles Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Vehicles</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadVehicles}
                disabled={isLoadingVehicles}
              >
                {isLoadingVehicles && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={assignAllVehiclesToDefaultOrg}
                disabled={isLoadingVehicles || isAssigningVehicles || !defaultOrg}
              >
                {isAssigningVehicles && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Assign All to Default Org
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingVehicles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedVehicles.includes(vehicle.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleVehicleSelection(vehicle.id)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">
                        <Car className="h-4 w-4 inline mr-1" />
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {vehicle.organization_id ? "Org: " + vehicle.organization_id.substring(0, 8) + "..." : "No Org"}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Owner: {vehicle.user_id.substring(0, 8)}...</span>
                      <span>ID: {vehicle.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No vehicles found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Assign Vehicles to Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Vehicles to Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">            
            <div>
              <Label>Selected Organization</Label>
              <Input 
                value={selectedOrg || ''} 
                readOnly 
                placeholder="Click on an organization to select"
              />
            </div>
            
            <div>
              <Label>Selected Vehicles</Label>
              <div className="p-2 border rounded min-h-10 text-sm">
                {selectedVehicles.length > 0 ? 
                  `${selectedVehicles.length} vehicles selected` : 
                  "No vehicles selected"}
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={assignVehiclesToOrg}
              disabled={isAssigningVehicles || !selectedOrg || selectedVehicles.length === 0}
            >
              {isAssigningVehicles && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Vehicles to Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationManager;
