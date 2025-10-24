import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bell, X, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnnouncementComments } from "./AnnouncementComments";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes?: number;
}

export function UserMessaging() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [likedAnnouncements, setLikedAnnouncements] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAnnouncements();
    loadLikedAnnouncements();
    
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
        
        // Load like counts for each announcement
        const likesKey = "announcement_likes_by_user";
        const allLikes = JSON.parse(localStorage.getItem(likesKey) || "{}");
        const dataWithLikes = data.map((ann: Announcement) => ({
          ...ann,
          likes: allLikes[ann.id]?.total || 0
        }));
        
        setAnnouncements(dataWithLikes);
        
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

  const loadLikedAnnouncements = () => {
    if (!user) return;
    const likesKey = "announcement_likes_by_user";
    const allLikes = JSON.parse(localStorage.getItem(likesKey) || "{}");
    const userLiked = new Set<string>();
    
    Object.entries(allLikes).forEach(([announcementId, data]: [string, any]) => {
      if (data.users && data.users.includes(user.id)) {
        userLiked.add(announcementId);
      }
    });
    
    setLikedAnnouncements(userLiked);
  };

  const handleLike = (announcementId: string) => {
    if (!user) {
      toast.error("Please log in to like announcements");
      return;
    }

    const likesKey = "announcement_likes_by_user";
    const allLikes = JSON.parse(localStorage.getItem(likesKey) || "{}");
    const announcementLikes = allLikes[announcementId] || { total: 0, users: [] };
    
    const newLiked = new Set(likedAnnouncements);
    const hasLiked = newLiked.has(announcementId);
    
    let newTotal = announcementLikes.total;
    let newUsers = [...announcementLikes.users];

    if (!hasLiked) {
      if (!newUsers.includes(user.id)) {
        newUsers.push(user.id);
        newTotal++;
        newLiked.add(announcementId);
      }
    } else {
      newUsers = newUsers.filter(id => id !== user.id);
      newTotal = Math.max(0, newTotal - 1);
      newLiked.delete(announcementId);
    }

    allLikes[announcementId] = { total: newTotal, users: newUsers };
    localStorage.setItem(likesKey, JSON.stringify(allLikes));
    setLikedAnnouncements(newLiked);

    // Update announcement display
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === announcementId ? { ...ann, likes: newTotal } : ann
    );
    setAnnouncements(updatedAnnouncements);
  };

  const toggleComments = (announcementId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedComments(newExpanded);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    localStorage.setItem("last_announcement_read", new Date().toISOString());
  };

  return (
    <>
      {/* Header Button */}
      <Button
        onClick={handleOpen}
        variant="ghost"
        size="sm"
        className="relative"
      >
        <Bell className="w-4 h-4 mr-2" />
        Announcements
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Messages Panel */}
      {isOpen && (
        <Card className="fixed top-20 right-6 w-96 max-w-[calc(100vw-3rem)] shadow-2xl z-50 border-2">
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
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleLike(announcement.id)}
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 transition-all ${
                                likedAnnouncements.has(announcement.id) 
                                  ? 'fill-primary text-primary' 
                                  : 'hover:text-primary'
                              }`} 
                            />
                            <span className="text-xs">{announcement.likes || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => toggleComments(announcement.id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {expandedComments.has(announcement.id) && (
                        <AnnouncementComments announcementId={announcement.id} />
                      )}
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
