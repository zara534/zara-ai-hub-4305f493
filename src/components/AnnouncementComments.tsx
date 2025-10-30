import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: number;
}

interface AnnouncementCommentsProps {
  announcementId: string;
}

export function AnnouncementComments({ announcementId }: AnnouncementCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    loadComments();
    loadUsername();
  }, [announcementId]);

  const loadUsername = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (data?.username) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error("Error loading username:", error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("announcement_comments")
        .select("*")
        .eq("announcement_id", announcementId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedComments = data.map((c) => ({
          id: c.id,
          text: c.comment_text,
          username: c.username,
          timestamp: new Date(c.created_at).getTime(),
        }));
        setComments(formattedComments);
      }
    } catch (error: any) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("announcement_comments")
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
          username: username || "Anonymous",
          comment_text: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      const newCommentObj: Comment = {
        id: data.id,
        text: data.comment_text,
        username: data.username,
        timestamp: new Date(data.created_at).getTime(),
      };

      setComments([newCommentObj, ...comments]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async (commentId: string, commentUsername: string) => {
    if (commentUsername !== username) {
      toast.error("You can only delete your own comments");
      return;
    }

    try {
      const { error } = await supabase
        .from("announcement_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <h4 className="text-xs font-semibold">Comments ({comments.length})</h4>
      
      <div className="flex gap-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="min-h-[60px] text-xs resize-none"
        />
        <Button onClick={handleSubmit} size="icon" className="flex-shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {comments.length > 0 && (
        <ScrollArea className="h-[150px]">
          <div className="space-y-2 pr-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted/50 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{comment.username}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                    {comment.username === username && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => handleDelete(comment.id, comment.username)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
