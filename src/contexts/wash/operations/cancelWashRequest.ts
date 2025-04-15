
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function cancelWashRequest(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wash_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
      return false;
    }
    
    toast.success("Wash request cancelled successfully!");
    return true;
  } catch (error) {
    console.error("Error cancelling wash request:", error);
    toast.error("Failed to cancel wash request");
    return false;
  }
}
