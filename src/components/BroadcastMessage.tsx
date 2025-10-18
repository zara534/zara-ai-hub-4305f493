import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function BroadcastMessage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to send announcements");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("announcements")
        .insert({
          title: title.trim(),
          content: content.trim(),
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Broadcast message sent to all users!");
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast.error("Failed to send broadcast message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Send className="w-5 h-5 md:w-6 md:h-6" />
          Broadcast Message to All Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Message Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Message Content *"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32"
        />
        <Button onClick={handleSendBroadcast} className="w-full" size="lg" disabled={isLoading}>
          <Send className="w-5 h-5 mr-2" />
          {isLoading ? "Sending..." : "Send Broadcast"}
        </Button>
      </CardContent>
    </Card>
  );
}
