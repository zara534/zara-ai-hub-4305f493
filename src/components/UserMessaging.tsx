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
  likes?: string[];
  replies?: Reply[];
}

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function UserMessaging() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [userId] = useState(() => crypto.randomUUID());

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

  const handleLike = (announcementId: string) => {
    const stored = localStorage.getItem("announcements");
    if (stored) {
      const data: Announcement[] = JSON.parse(stored);
      const updated = data.map(a => {
        if (a.id === announcementId) {
          const likes = a.likes || [];
          const hasLiked = likes.includes(userId);
          return {
            ...a,
            likes: hasLiked ? likes.filter(id => id !== userId) : [...likes, userId]
          };
        }
        return a;
      });
      localStorage.setItem("announcements", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      setAnnouncements(updated);
      toast.success(updated.find(a => a.id === announcementId)?.likes?.includes(userId) ? "Liked!" : "Unliked");
    }
  };

  const handleReply = (announcementId: string) => {
    const text = replyText[announcementId]?.trim();
    if (!text) {
      toast.error("Please enter a reply");
      return;
    }

    const stored = localStorage.getItem("announcements");
    if (stored) {
      const data: Announcement[] = JSON.parse(stored);
      const updated = data.map(a => {
        if (a.id === announcementId) {
          const replies = a.replies || [];
          return {
            ...a,
            replies: [...replies, {
              id: crypto.randomUUID(),
              user_id: userId,
              content: text,
              created_at: new Date().toISOString()
            }]
          };
        }
        return a;
      });
      localStorage.setItem("announcements", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
      setAnnouncements(updated);
      setReplyText({ ...replyText, [announcementId]: "" });
      toast.success("Reply sent to admin!");
    }
  };

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl shadow-2xl z-50 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Announcements
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No announcements yet
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const likes = announcement.likes || [];
                  const hasLiked = likes.includes(userId);
                  const replies = announcement.replies || [];
                  
                  return (
                    <div
                      key={announcement.id}
                      className="p-4 border rounded-lg bg-muted/30 space-y-3"
                    >
                      <div>
                        <h3 className="font-semibold text-base mb-1">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(announcement.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={hasLiked ? "default" : "outline"}
                          onClick={() => handleLike(announcement.id)}
                          className="text-xs"
                        >
                          ❤️ {likes.length > 0 && likes.length}
                        </Button>
                      </div>

                      {replies.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2">
                          {replies.map((reply) => (
                            <div key={reply.id} className="text-xs bg-background/50 p-2 rounded">
                              <p className="text-muted-foreground">{reply.content}</p>
                              <p className="text-xs text-muted-foreground/50 mt-1">
                                {new Date(reply.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Reply to admin..."
                          value={replyText[announcement.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [announcement.id]: e.target.value })}
                          className="flex-1 text-sm px-3 py-1.5 border rounded-md bg-background"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleReply(announcement.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleReply(announcement.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
}
