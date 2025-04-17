
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function removeVehicle(id: string): Promise<boolean> {
  try {
    // Delete from Supabase - no need to check user_id or organization_id
    // since we're allowing all users in the same org to delete any vehicle in their org
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing vehicle from Supabase:", error);
      toast.error("Failed to remove vehicle");
      return false;
    }

    toast.success("Vehicle removed successfully!");
    return true;
  } catch (error) {
    console.error("Error removing vehicle:", error);
    toast.error("Failed to remove vehicle");
    return false;
  }
}
