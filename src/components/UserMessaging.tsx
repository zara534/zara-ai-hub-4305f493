import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Bell, X, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnnouncementComments } from "./AnnouncementComments";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  user_liked: boolean;
}

export function UserMessaging() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAnnouncements();
    
    // Subscribe to real-time updates for announcements
    const announcementsChannel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements' 
      }, () => {
        loadAnnouncements();
        // Show notification for new announcements
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
          toast.info("New announcement from Admin!");
        }
      })
      .subscribe();

    // Subscribe to real-time updates for announcement likes
    const likesChannel = supabase
      .channel('announcement_likes_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcement_likes' 
      }, () => {
        loadAnnouncements();
      })
      .subscribe();

    return () => {
      announcementsChannel.unsubscribe();
      likesChannel.unsubscribe();
    };
  }, [isOpen]);

  const loadAnnouncements = async () => {
    try {
      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (announcementsError) throw announcementsError;

      if (!announcementsData) {
        setAnnouncements([]);
        return;
      }

      // Fetch all likes counts
      const { data: likesData, error: likesError } = await supabase
        .from("announcement_likes")
        .select("announcement_id, user_id");
      
      if (likesError) throw likesError;

      // Count likes per announcement
      const likeCounts: Record<string, number> = {};
      const userLikes: Set<string> = new Set();
      
      if (likesData) {
        likesData.forEach(like => {
          likeCounts[like.announcement_id] = (likeCounts[like.announcement_id] || 0) + 1;
          if (user && like.user_id === user.id) {
            userLikes.add(like.announcement_id);
          }
        });
      }

      // Combine data
      const formattedAnnouncements = announcementsData.map(ann => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        created_at: ann.created_at,
        likes: likeCounts[ann.id] || 0,
        user_liked: userLikes.has(ann.id),
      }));

      setAnnouncements(formattedAnnouncements);

      // Calculate unread count
      const lastRead = localStorage.getItem("last_announcement_read");
      if (lastRead && formattedAnnouncements.length > 0) {
        const unread = formattedAnnouncements.filter(
          a => new Date(a.created_at) > new Date(lastRead)
        );
        setUnreadCount(unread.length);
      } else if (formattedAnnouncements.length > 0) {
        setUnreadCount(formattedAnnouncements.length);
      }
    } catch (error: any) {
      console.error("Error loading announcements:", error);
      toast.error("Failed to load announcements");
    }
  };

  const handleLike = async (announcementId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast.error("Please log in to like announcements");
      return;
    }

    try {
      if (currentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from("announcement_likes")
          .delete()
          .eq("announcement_id", announcementId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("announcement_likes")
          .insert({
            announcement_id: announcementId,
            user_id: user.id,
          });
        
        if (error) throw error;
      }

      // Update local state immediately for better UX
      setAnnouncements(announcements.map(ann => 
        ann.id === announcementId 
          ? { 
              ...ann, 
              likes: currentlyLiked ? ann.likes - 1 : ann.likes + 1,
              user_liked: !currentlyLiked 
            }
          : ann
      ));
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
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
                            onClick={() => handleLike(announcement.id, announcement.user_liked)}
                          >
                            <Heart 
                              className={`w-4 h-4 mr-1 transition-all ${
                                announcement.user_liked
                                  ? 'fill-primary text-primary' 
                                  : 'hover:text-primary'
                              }`} 
                            />
                            <span className="text-xs">{announcement.likes}</span>
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
