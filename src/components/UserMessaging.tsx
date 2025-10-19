import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  message: string;
  is_broadcast: boolean;
  created_at: string;
  read_at: string | null;
}

export function UserMessaging() {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAdminId();
    loadMessages();
    
    const channel = supabase
      .channel('user-messages')
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
  }, [user]);

  const loadAdminId = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1)
        .single();

      if (error) throw error;
      setAdminId(data?.user_id || null);
    } catch (error: any) {
      console.error("Error loading admin:", error);
    }
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_messages")
        .select("*")
        .or(`to_user_id.eq.${user.id},from_user_id.eq.${user.id},is_broadcast.eq.true`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      const unreadIds = (data || [])
        .filter((msg) => msg.to_user_id === user.id && !msg.read_at)
        .map((msg) => msg.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("user_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!adminId) {
      toast.error("Admin not found");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_messages")
        .insert({
          from_user_id: user?.id,
          to_user_id: adminId,
          message: messageText.trim(),
          is_broadcast: false
        });

      if (error) throw error;

      toast.success("Message sent to admin!");
      setMessageText("");
      loadMessages();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = messages.filter(
    (msg) => msg.to_user_id === user?.id && !msg.read_at
  ).length;

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
          Messages
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Message admin..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-24"
          />
          <Button 
            onClick={handleSendMessage} 
            className="w-full" 
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send to Admin"}
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <Card 
                  key={msg.id} 
                  className={
                    msg.is_broadcast 
                      ? "bg-primary/5 border-primary/20" 
                      : msg.from_user_id === user?.id 
                      ? "bg-muted/50" 
                      : ""
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {msg.from_user_id === user?.id ? "You" : "Admin"}
                          {msg.is_broadcast && (
                            <span className="ml-2 text-xs text-primary flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              Broadcast
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "PPp")}
                        </p>
                      </div>
                      {msg.to_user_id === user?.id && !msg.read_at && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
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
  );
}
