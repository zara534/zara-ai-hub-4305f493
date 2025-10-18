import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  userReaction?: "like" | "dislike" | null;
}

export function AnnouncementsHistory() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, [user]);

  const loadAnnouncements = async () => {
    if (!user) return;

    try {
      // Load announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (announcementsError) throw announcementsError;

      // Load reactions
      const { data: reactionsData, error: reactionsError } = await supabase
        .from("announcement_reactions")
        .select("*");

      if (reactionsError) throw reactionsError;

      // Combine data
      const announcementsWithReactions = (announcementsData || []).map((announcement) => {
        const reactions = reactionsData?.filter((r) => r.announcement_id === announcement.id) || [];
        const likes = reactions.filter((r) => r.reaction === "like").length;
        const dislikes = reactions.filter((r) => r.reaction === "dislike").length;
        const userReaction = reactions.find((r) => r.user_id === user.id)?.reaction || null;

        return {
          ...announcement,
          likes,
          dislikes,
          userReaction,
        };
      });

      setAnnouncements(announcementsWithReactions);
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (announcementId: string, reaction: "like" | "dislike") => {
    if (!user) return;

    try {
      const currentAnnouncement = announcements.find((a) => a.id === announcementId);
      
      // If same reaction, remove it
      if (currentAnnouncement?.userReaction === reaction) {
        await supabase
          .from("announcement_reactions")
          .delete()
          .eq("announcement_id", announcementId)
          .eq("user_id", user.id);
      } else {
        // Upsert reaction
        await supabase
          .from("announcement_reactions")
          .upsert({
            announcement_id: announcementId,
            user_id: user.id,
            reaction,
          }, {
            onConflict: "announcement_id,user_id"
          });
      }

      // Reload announcements
      loadAnnouncements();
      toast.success("Reaction updated!");
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-2">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading announcements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MessageSquare className="w-6 h-6 text-primary" />
          Announcements from Admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="border-2">
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-2">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()} at{" "}
                        {new Date(announcement.created_at).toLocaleTimeString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant={announcement.userReaction === "like" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReaction(announcement.id, "like")}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {announcement.likes}
                        </Button>
                        <Button
                          variant={announcement.userReaction === "dislike" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReaction(announcement.id, "dislike")}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          {announcement.dislikes}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
