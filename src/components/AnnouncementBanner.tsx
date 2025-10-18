import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AnnouncementBanner() {
  const { announcements } = useApp();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
      {visibleAnnouncements.slice(0, 2).map((announcement) => (
        <Card key={announcement.id} className="border-primary/50 bg-primary/5 shadow-md border-2">
          <CardContent className="pt-3 md:pt-4 pb-3 md:pb-4">
            <div className="flex items-start gap-2 md:gap-3">
              <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg mb-1">{announcement.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                  {announcement.content}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground/60">
                  New AI: {announcement.aiModelName} • {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 w-8 h-8"
                onClick={() => setDismissedIds([...dismissedIds, announcement.id])}
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
