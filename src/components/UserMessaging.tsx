import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function UserMessaging() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadAnnouncements();
    
    // Listen for storage changes (when announcements are added)
    const handleStorageChange = () => {
      const newAnnouncements = JSON.parse(localStorage.getItem("announcements") || "[]");
      const lastRead = localStorage.getItem("last_announcement_read");
      
      if (lastRead && newAnnouncements.length > 0) {
        const newestAnnouncement = newAnnouncements[0];
        if (new Date(newestAnnouncement.created_at) > new Date(lastRead)) {
          setUnreadCount(prev => prev + 1);
          toast.info("New announcement from Admin!");
        }
      }
      
      setAnnouncements(newAnnouncements);
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Poll every 3 seconds for updates
    const interval = setInterval(() => {
      const stored = localStorage.getItem("announcements");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (JSON.stringify(parsed) !== JSON.stringify(announcements)) {
          handleStorageChange();
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [announcements]);

  const loadAnnouncements = async () => {
    try {
      const stored = localStorage.getItem("announcements");
      if (stored) {
        const data = JSON.parse(stored);
        setAnnouncements(data);
        
        // Check localStorage for last read timestamp
        const lastRead = localStorage.getItem("last_announcement_read");
        if (lastRead && data) {
          const unread = data.filter((a: Announcement) => new Date(a.created_at) > new Date(lastRead));
          setUnreadCount(unread.length);
        } else if (data) {
          setUnreadCount(data.length);
        }
      }
    } catch (error: any) {
      console.error("Error loading announcements:", error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    localStorage.setItem("last_announcement_read", new Date().toISOString());
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={handleOpen}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Messages Panel */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Announcements
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No announcements yet
              </p>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <h3 className="font-semibold text-sm mb-1">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
