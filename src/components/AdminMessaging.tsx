import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Message {
  id: string;
  from_user_id: string | null;
  message: string;
  is_broadcast: boolean;
  created_at: string;
  from_username?: string;
}

export function AdminMessaging() {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
    
    const channel = supabase
      .channel('admin-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_messages'
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("user_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch usernames for messages
      const messagesWithUsernames = await Promise.all(
        (data || []).map(async (msg) => {
          if (msg.from_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", msg.from_user_id)
              .single();
            
            return { ...msg, from_username: profile?.username || "Unknown User" };
          }
          return { ...msg, from_username: "Admin" };
        })
      );

      setMessages(messagesWithUsernames);
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_messages")
        .insert({
          from_user_id: user?.id,
          message: broadcastMessage.trim(),
          is_broadcast: true
        });

      if (error) throw error;

      toast.success("Broadcast sent to all users!");
      setBroadcastMessage("");
      loadMessages();
    } catch (error: any) {
      console.error("Error sending broadcast:", error);
      toast.error(`Failed to send: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("user_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      toast.success("Message deleted");
      loadMessages();
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Send className="w-5 h-5 md:w-6 md:h-6" />
            Broadcast to All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your broadcast message..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="min-h-32"
          />
          <Button 
            onClick={handleSendBroadcast} 
            className="w-full" 
            size="lg" 
            disabled={loading}
          >
            <Send className="w-5 h-5 mr-2" />
            {loading ? "Sending..." : "Send Broadcast"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            All Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <Card key={msg.id} className={msg.is_broadcast ? "bg-primary/5" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {msg.from_username}
                            {msg.is_broadcast && <span className="ml-2 text-xs text-primary">(Broadcast)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(msg.created_at), "PPp")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
