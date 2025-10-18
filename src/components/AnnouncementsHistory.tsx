import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Megaphone, Clock, AlertCircle } from "lucide-react";

export function AnnouncementsHistory() {
  const { announcements, removeAnnouncement } = useApp();

  if (announcements.length === 0) {
    return (
      <Card className="shadow-lg border-2">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              No announcements yet. The admin hasn't sent any messages.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">All Announcements</h2>
      </div>
      
      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="shadow-lg border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    {announcement.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(announcement.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeAnnouncement(announcement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
