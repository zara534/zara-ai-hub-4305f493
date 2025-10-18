import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  announcement_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Like {
  id: string;
  announcement_id: string;
  user_id: string;
}

export function AnnouncementsView() {
  const { user } = useAuth();
  const { announcements } = useApp();
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      const [likesData, commentsData] = await Promise.all([
        supabase.from("announcement_likes").select("*"),
        supabase.from("announcement_comments").select("*, profiles(username)"),
      ]);

      if (likesData.data) setLikes(likesData.data);
      if (commentsData.data) setComments(commentsData.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const likesChannel = supabase
      .channel("announcement_likes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcement_likes" },
        () => loadData()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("announcement_comments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcement_comments" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  };

  const handleLike = async (announcementId: string) => {
    if (!user) {
      toast.error("Please login to like");
      return;
    }

    const existingLike = likes.find(
      (l) => l.announcement_id === announcementId && l.user_id === user.id
    );

    if (existingLike) {
      await supabase.from("announcement_likes").delete().eq("id", existingLike.id);
    } else {
      await supabase.from("announcement_likes").insert({
        announcement_id: announcementId,
        user_id: user.id,
      });
    }
  };

  const handleComment = async (announcementId: string, parentId?: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    const text = parentId ? replyText[parentId] : commentText[announcementId];
    if (!text?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const { error } = await supabase.from("announcement_comments").insert({
      announcement_id: announcementId,
      user_id: user.id,
      content: text,
      parent_id: parentId || null,
    });

    if (error) {
      toast.error("Failed to add comment");
      return;
    }

    if (parentId) {
      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
    } else {
      setCommentText((prev) => ({ ...prev, [announcementId]: "" }));
    }

    toast.success("Comment added!");
  };

  const renderComment = (comment: Comment, announcementId: string, depth: number = 0) => {
    const replies = comments.filter((c) => c.parent_id === comment.id);
    const showReply = replyText[comment.id] !== undefined;

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-8" : ""} space-y-2`}>
        <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {comment.profiles?.username || "User"}
            </p>
            <p className="text-sm text-muted-foreground">{comment.content}</p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setReplyText((prev) => ({
                    ...prev,
                    [comment.id]: prev[comment.id] === undefined ? "" : undefined,
                  }))
                }
              >
                Reply
              </Button>
            </div>
          </div>
        </div>

        {showReply && (
          <div className="ml-8 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText[comment.id] || ""}
              onChange={(e) =>
                setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
              }
              className="min-h-[60px] text-sm"
            />
            <Button
              size="icon"
              onClick={() => handleComment(announcementId, comment.id)}
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {replies.map((reply) => renderComment(reply, announcementId, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-2 md:px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Announcements</h1>

      {announcements.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        announcements.map((announcement) => {
          const announcementLikes = likes.filter(
            (l) => l.announcement_id === announcement.id
          );
          const announcementComments = comments.filter(
            (c) => c.announcement_id === announcement.id && !c.parent_id
          );
          const hasLiked = announcementLikes.some((l) => l.user_id === user?.id);

          return (
            <Card key={announcement.id} className="border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      New AI: {announcement.aiModelName}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{announcement.content}</p>

                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(announcement.id)}
                    className={hasLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                    {announcementLikes.length}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowComments((prev) => ({
                        ...prev,
                        [announcement.id]: !prev[announcement.id],
                      }))
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {announcementComments.length}
                  </Button>
                </div>

                {showComments[announcement.id] && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentText[announcement.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [announcement.id]: e.target.value,
                          }))
                        }
                        className="min-h-[60px]"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleComment(announcement.id)}
                        className="flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {announcementComments.map((comment) =>
                        renderComment(comment, announcement.id)
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
