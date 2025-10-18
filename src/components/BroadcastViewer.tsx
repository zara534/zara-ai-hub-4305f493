import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X, Bell, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  userReaction?: 'like' | 'dislike' | null;
}

export function BroadcastViewer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadAnnouncements();
    const dismissed = JSON.parse(localStorage.getItem("dismissed-broadcasts") || "[]");
    setDismissedIds(dismissed);
    
    const subscription = supabase
      .channel('announcements_broadcast')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements' 
      }, () => {
        loadAnnouncements();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadAnnouncements = async () => {
    try {
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (announcementsError) throw announcementsError;

      const { data: reactionsData } = await supabase
        .from("announcement_reactions")
        .select("*");

      const enrichedAnnouncements = (announcementsData || []).map((announcement) => {
        const reactions = reactionsData?.filter(r => r.announcement_id === announcement.id) || [];
        const likes = reactions.filter(r => r.reaction === 'like').length;
        const dislikes = reactions.filter(r => r.reaction === 'dislike').length;
        const userReaction = reactions.find(r => r.user_id === user?.id)?.reaction || null;

        return {
          ...announcement,
          likes,
          dislikes,
          userReaction,
        };
      });

      setAnnouncements(enrichedAnnouncements);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const handleReaction = async (announcementId: string, reaction: 'like' | 'dislike') => {
    if (!user) {
      toast.error("Please log in to react");
      return;
    }

    try {
      const announcement = announcements.find(a => a.id === announcementId);
      
      if (announcement?.userReaction === reaction) {
        await supabase
          .from("announcement_reactions")
          .delete()
          .eq("announcement_id", announcementId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("announcement_reactions")
          .upsert({
            announcement_id: announcementId,
            user_id: user.id,
            reaction,
          }, { onConflict: 'announcement_id,user_id' });
      }

      loadAnnouncements();
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const handleDelete = async (announcementId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementId);

      if (error) throw error;

      toast.success("Announcement deleted");
      loadAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };

  const dismissMessage = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissed-broadcasts", JSON.stringify(newDismissed));
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2 max-h-[80vh] overflow-y-auto">
      {visibleAnnouncements.map((announcement) => (
        <Card key={announcement.id} className="shadow-xl border-2 border-primary/50 bg-background/95 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-base">{announcement.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(announcement.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => dismissMessage(announcement.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant={announcement.userReaction === 'like' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction(announcement.id, 'like')}
                className="gap-1 h-7 text-xs"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{announcement.likes}</span>
              </Button>
              <Button
                variant={announcement.userReaction === 'dislike' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleReaction(announcement.id, 'dislike')}
                className="gap-1 h-7 text-xs"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{announcement.dislikes}</span>
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(announcement.id)}
                  className="gap-1 h-7 text-xs text-destructive hover:text-destructive ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
