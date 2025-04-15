
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  
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
  
  // Load data on component mount
  useEffect(() => {
    loadOrganizations();
    loadUsers();
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
    </div>
  );
};

export default OrganizationManager;
