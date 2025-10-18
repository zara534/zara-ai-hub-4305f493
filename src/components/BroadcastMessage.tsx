import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export function BroadcastMessage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSendBroadcast = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const existingMessages = JSON.parse(localStorage.getItem("broadcast-messages") || "[]");
    localStorage.setItem("broadcast-messages", JSON.stringify([message, ...existingMessages]));

    toast.success("Broadcast message sent to all users!");
    setTitle("");
    setContent("");
    
    // Trigger a custom event so other components can react
    window.dispatchEvent(new CustomEvent("new-broadcast"));
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
        <Button onClick={handleSendBroadcast} className="w-full" size="lg">
          <Send className="w-5 h-5 mr-2" />
          Send Broadcast
        </Button>
      </CardContent>
    </Card>
  );
}
