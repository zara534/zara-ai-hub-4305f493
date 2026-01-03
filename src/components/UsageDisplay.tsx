import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Infinity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageDisplayProps {
  used: number;
  limit: number | null;
  type: "text" | "image";
  tier: "free" | "pro" | "unlimited" | "admin";
  onUpgrade?: () => void;
  compact?: boolean;
}

export function UsageDisplay({ used, limit, type, tier, onUpgrade, compact = false }: UsageDisplayProps) {
  const isUnlimited = limit === null || tier === "unlimited" || tier === "admin";
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const remaining = isUnlimited ? null : Math.max(0, limit - used);
  const isLow = !isUnlimited && remaining !== null && remaining <= 2;
  const isExhausted = !isUnlimited && remaining === 0;

  const tierColors = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    unlimited: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    admin: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
  };

  const tierIcons = {
    free: <Zap className="w-3 h-3" />,
    pro: <Crown className="w-3 h-3" />,
    unlimited: <Infinity className="w-3 h-3" />,
    admin: <Sparkles className="w-3 h-3" />,
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs", tierColors[tier])}>
          {tierIcons[tier]}
          <span className="ml-1 capitalize">{tier}</span>
        </Badge>
        {!isUnlimited && (
          <span className={cn(
            "text-xs",
            isExhausted ? "text-destructive font-bold" : isLow ? "text-amber-500" : "text-muted-foreground"
          )}>
            {remaining}/{limit}
          </span>
        )}
        {isUnlimited && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Infinity className="w-3 h-3" /> Unlimited
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", tierColors[tier])}>
            {tierIcons[tier]}
            <span className="ml-1 capitalize">{tier}</span>
          </Badge>
          <span className="text-sm font-medium">
            {type === "text" ? "Text" : "Image"} Generations
          </span>
        </div>
        {tier === "free" && onUpgrade && (
          <Button size="sm" variant="outline" onClick={onUpgrade} className="h-7 text-xs gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            Upgrade
          </Button>
        )}
      </div>

      {isUnlimited ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Infinity className="w-4 h-4 text-primary" />
          <span>Unlimited generations</span>
        </div>
      ) : (
        <>
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isExhausted && "[&>div]:bg-destructive",
              isLow && !isExhausted && "[&>div]:bg-amber-500"
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Used: {used}</span>
            <span className={cn(
              isExhausted ? "text-destructive font-bold" : isLow ? "text-amber-500 font-medium" : ""
            )}>
              {isExhausted ? "Limit reached!" : `${remaining} remaining`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
