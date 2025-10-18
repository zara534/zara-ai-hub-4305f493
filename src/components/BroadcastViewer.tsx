import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Megaphone, Clock } from "lucide-react";

export function BroadcastViewer() {
  const { announcements, removeAnnouncement } = useApp();

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {announcements.slice(0, 3).map((announcement) => (
        <Card key={announcement.id} className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Megaphone className="w-5 h-5 text-primary flex-shrink-0" />
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={() => removeAnnouncement(announcement.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{announcement.content}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Clock className="w-3 h-3" />
              {new Date(announcement.createdAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
