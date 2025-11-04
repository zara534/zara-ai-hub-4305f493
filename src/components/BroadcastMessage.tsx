import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function BroadcastMessage() {
  const { isAdmin } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBroadcast();
  }, []);

  const loadBroadcast = async () => {
    try {
      const { data, error } = await supabase
        .from("broadcast_message")
        .select("message")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) setMessage(data.message || "");
    } catch (error) {
      console.error("Error loading broadcast:", error);
    }
  };

  const saveBroadcast = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("broadcast_message")
        .upsert({ id: 1, message: message.trim() });

      if (error) throw error;
      toast.success("Broadcast message updated!");
    } catch (error) {
      console.error("Error saving broadcast:", error);
      toast.error("Failed to save message");
    } finally {
      setIsLoading(false);
    }
  };

  const clearBroadcast = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("broadcast_message")
        .upsert({ id: 1, message: "" });

      if (error) throw error;
      setMessage("");
      toast.success("Broadcast message cleared!");
    } catch (error) {
      console.error("Error clearing broadcast:", error);
      toast.error("Failed to clear message");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Card className="shadow-lg border-2">
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-bold text-lg">Broadcast Message</h3>
        <p className="text-sm text-muted-foreground">
          Set a message that all users will see when they visit the app
        </p>
        <Textarea
          placeholder="Enter your broadcast message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32"
        />
        <div className="flex gap-2">
          <Button onClick={saveBroadcast} disabled={isLoading} className="flex-1">
            Save Broadcast
          </Button>
          <Button 
            variant="outline" 
            onClick={clearBroadcast} 
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
