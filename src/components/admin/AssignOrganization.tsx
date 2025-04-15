
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const AssignOrganization = () => {
  const [userId, setUserId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const assignUserToOrganization = async () => {
    if (!userId || !organizationId) {
      toast.error("Please provide both user ID and organization ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: organizationId })
        .eq('id', userId);
        
      if (error) {
        console.error("Error assigning user to organization:", error);
        toast.error("Failed to assign user to organization");
        return;
      }
      
      toast.success("User successfully assigned to organization");
      
      // Clear the form
      setUserId('');
      setOrganizationId('');
    } catch (error) {
      console.error("Error in assignUserToOrganization:", error);
      toast.error("An error occurred while assigning user to organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Assign User to Organization</h2>
      
      <div className="space-y-2">
        <Label htmlFor="userId">User ID</Label>
        <Input 
          id="userId" 
          value={userId} 
          onChange={e => setUserId(e.target.value)} 
          placeholder="Enter user ID"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="organizationId">Organization ID</Label>
        <Input 
          id="organizationId" 
          value={organizationId} 
          onChange={e => setOrganizationId(e.target.value)} 
          placeholder="Enter organization ID"
        />
      </div>
      
      <Button 
        onClick={assignUserToOrganization} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Assigning..." : "Assign User to Organization"}
      </Button>
    </div>
  );
};
