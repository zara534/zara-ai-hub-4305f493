import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  userReaction?: 'like' | 'dislike' | null;
}

export function AnnouncementsHistory() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadAnnouncements();
    
    const subscription = supabase
      .channel('announcements_changes')
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
        .order("created_at", { ascending: false });

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
    } catch (error: any) {
      console.error("Error loading announcements:", error);
      const msg = String(error?.message || "");
      if (msg.includes("announcements") || msg.includes("relation") || error?.code === "42P01") {
        const local = localStorage.getItem("local_announcements");
        const list = local ? JSON.parse(local) : [];
        setAnnouncements(list);
        toast.info("Showing local announcements (DB not set up)");
      } else {
        toast.error("Failed to load announcements");
      }
    } finally {
      setLoading(false);
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
    } catch (error: any) {
      console.error("Error updating reaction:", error);
      const msg = String(error?.message || "");
      if (msg.includes("announcement_reactions") || msg.includes("relation") || error?.code === "42P01") {
        toast.info("Reactions unavailable until database is set up (see DATABASE_SETUP.md)");
      } else {
        toast.error("Failed to update reaction");
      }
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
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      const msg = String(error?.message || "");
      if (msg.includes("announcements") || msg.includes("relation") || error?.code === "42P01") {
        const local = localStorage.getItem("local_announcements");
        const list = local ? JSON.parse(local) : [];
        const next = list.filter((a: any) => a.id === announcementId ? false : true);
        localStorage.setItem("local_announcements", JSON.stringify(next));
        setAnnouncements(next);
        toast.success("Local announcement deleted");
      } else {
        toast.error("Failed to delete announcement");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="shadow-lg border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-lg">No announcements yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="shadow-lg border-2 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{announcement.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(announcement.created_at).toLocaleDateString()} at{" "}
                  {new Date(announcement.created_at).toLocaleTimeString()}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(announcement.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">{announcement.content}</p>
            
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant={announcement.userReaction === 'like' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReaction(announcement.id, 'like')}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{announcement.likes}</span>
              </Button>
              <Button
                variant={announcement.userReaction === 'dislike' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleReaction(announcement.id, 'dislike')}
                className="gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{announcement.dislikes}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
