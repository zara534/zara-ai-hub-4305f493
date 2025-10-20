import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Send, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  likes?: string[];
  replies?: Reply[];
}

export function AdminMessaging() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    
    // Listen for storage changes (when announcements are added)
    const handleStorageChange = () => {
      loadAnnouncements();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      const stored = localStorage.getItem("announcements");
      if (stored) {
        setAnnouncements(JSON.parse(stored));
      }
    } catch (error: any) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter both title and content");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      // Create announcement in localStorage for immediate broadcast
      const announcement = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        created_by: user.id,
        created_at: new Date().toISOString()
      };

      // Get existing announcements from localStorage
      const existingAnnouncements = JSON.parse(localStorage.getItem("announcements") || "[]");
      existingAnnouncements.unshift(announcement);
      localStorage.setItem("announcements", JSON.stringify(existingAnnouncements));

      // Trigger storage event for other tabs/windows
      window.dispatchEvent(new Event("storage"));

      toast.success("Announcement sent to all users!");
      setTitle("");
      setContent("");
      loadAnnouncements();
    } catch (error: any) {
      console.error("Error sending announcement:", error);
      toast.error("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");
      const filtered = announcements.filter((a: any) => a.id !== id);
      localStorage.setItem("announcements", JSON.stringify(filtered));
      window.dispatchEvent(new Event("storage"));
      loadAnnouncements();
      toast.success("Announcement deleted");
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Announcement to All Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Textarea
            placeholder="Announcement Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            className="min-h-32"
          />
          <Button
            onClick={handleSendAnnouncement}
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Announcement
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Previous Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAnnouncements ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No announcements yet
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const likes = announcement.likes || [];
                  const replies = announcement.replies || [];
                  
                  return (
                    <div
                      key={announcement.id}
                      className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            {new Date(announcement.created_at).toLocaleString()}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span>❤️ {likes.length} likes</span>
                            <span>💬 {replies.length} replies</span>
                          </div>

                          {replies.length > 0 && (
                            <div className="space-y-2 mt-3 pl-4 border-l-2 border-primary/20">
                              <p className="text-xs font-semibold text-muted-foreground">User Replies:</p>
                              {replies.map((reply) => (
                                <div key={reply.id} className="bg-background/50 p-2 rounded text-sm">
                                  <p className="text-muted-foreground">{reply.content}</p>
                                  <p className="text-xs text-muted-foreground/50 mt-1">
                                    {new Date(reply.created_at).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
