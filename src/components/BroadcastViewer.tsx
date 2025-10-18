import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export function BroadcastViewer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    loadMessages();
    
    const handleNewBroadcast = () => {
      loadMessages();
    };
    
    window.addEventListener("new-broadcast", handleNewBroadcast);
    return () => window.removeEventListener("new-broadcast", handleNewBroadcast);
  }, []);

  const loadMessages = () => {
    const stored = JSON.parse(localStorage.getItem("broadcast-messages") || "[]");
    const dismissed = JSON.parse(localStorage.getItem("dismissed-broadcasts") || "[]");
    setMessages(stored);
    setDismissedIds(dismissed);
  };

  const dismissMessage = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissed-broadcasts", JSON.stringify(newDismissed));
  };

  const visibleMessages = messages.filter(m => !dismissedIds.includes(m.id));

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2">
      {visibleMessages.map((message) => (
        <Card key={message.id} className="shadow-xl border-2 border-primary/50 bg-background/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-lg">{message.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{message.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => dismissMessage(message.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
