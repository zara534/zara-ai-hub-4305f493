import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function BroadcastViewer() {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadBroadcast();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("broadcast-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "broadcast_message",
        },
        () => {
          loadBroadcast();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBroadcast = async () => {
    try {
      const { data, error } = await supabase
        .from("broadcast_message")
        .select("message")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      const msg = data?.message?.trim() || "";
      setMessage(msg);
      setIsVisible(msg.length > 0);
    } catch (error) {
      console.error("Error loading broadcast:", error);
    }
  };

  if (!isVisible || !message) return null;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg mb-6 animate-in fade-in slide-in-from-top duration-500">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm md:text-base whitespace-pre-wrap">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
