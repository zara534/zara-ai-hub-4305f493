import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Infinity, MessageSquare, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: "free" | "pro" | "unlimited" | "admin";
}

export function UpgradeModal({ open, onOpenChange, currentTier }: UpgradeModalProps) {
  const handleUpgrade = (plan: string) => {
    // For now, just show a message - you can integrate with Stripe or other payment later
    toast.info(`Upgrade to ${plan} - Contact admin to upgrade your account!`, {
      description: "Email: mgbeahuruchizaram336@gmail.com",
      duration: 5000,
    });
    onOpenChange(false);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/forever",
      description: "Perfect for trying out ZARA AI",
      features: [
        "10 text generations/day",
        "5 image generations/day",
        "Access to all AI models",
        "Basic support",
      ],
      current: currentTier === "free",
      tier: "free" as const,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For power users who need more",
      features: [
        "100 text generations/day",
        "50 image generations/day",
        "Priority access to new models",
        "Priority support",
        "No ads",
      ],
      current: currentTier === "pro",
      tier: "pro" as const,
      popular: true,
    },
    {
      name: "Unlimited",
      price: "$29.99",
      period: "/month",
      description: "For professionals & teams",
      features: [
        "Unlimited text generations",
        "Unlimited image generations",
        "API access (coming soon)",
        "Premium support",
        "Early access to features",
      ],
      current: currentTier === "unlimited",
      tier: "unlimited" as const,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Get more generations and unlock premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${plan.current ? "bg-muted/50" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {plan.tier === "free" && <Zap className="w-5 h-5 text-muted-foreground" />}
                  {plan.tier === "pro" && <Crown className="w-5 h-5 text-amber-500" />}
                  {plan.tier === "unlimited" && <Infinity className="w-5 h-5 text-purple-500" />}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  variant={plan.current ? "outline" : plan.popular ? "default" : "secondary"}
                  disabled={plan.current}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
          <p>✨ Limits reset daily at midnight UTC</p>
          <p className="mt-1">Questions? Contact mgbeahuruchizaram336@gmail.com</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
