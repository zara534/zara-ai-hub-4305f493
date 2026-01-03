import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Search, UserPlus, Trash2, Zap, Infinity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserSubscription {
  id: string;
  user_id: string;
  tier: "free" | "pro" | "unlimited";
  expires_at: string | null;
  email?: string;
}

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserTier, setNewUserTier] = useState<"pro" | "unlimited">("pro");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error("Please enter a user email or ID");
      return;
    }

    setLoading(true);
    try {
      // First, try to find user by email in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", `%${newUserEmail}%`)
        .maybeSingle();

      const userId = profile?.id || newUserEmail;

      // Check if subscription exists
      const { data: existing } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("user_subscriptions")
          .update({ 
            tier: newUserTier, 
            expires_at: null, // No expiry for now
            updated_at: new Date().toISOString() 
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("user_subscriptions")
          .insert({ 
            user_id: userId, 
            tier: newUserTier,
            expires_at: null
          });

        if (error) throw error;
      }

      toast.success(`User upgraded to ${newUserTier}!`);
      setNewUserEmail("");
      loadSubscriptions();
    } catch (error: any) {
      console.error("Error upgrading user:", error);
      toast.error(`Failed to upgrade user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Subscription removed");
      loadSubscriptions();
    } catch (error: any) {
      toast.error(`Failed to remove: ${error.message}`);
    }
  };

  const tierBadge = (tier: string) => {
    switch (tier) {
      case "pro":
        return (
          <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Crown className="w-3 h-3" /> Pro
          </Badge>
        );
      case "unlimited":
        return (
          <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Infinity className="w-3 h-3" /> Unlimited
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Zap className="w-3 h-3" /> Free
          </Badge>
        );
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    !searchEmail || sub.user_id.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Crown className="w-6 h-6 text-amber-500" />
          Subscription Manager
        </CardTitle>
        <CardDescription>
          Upgrade users to Pro or Unlimited tiers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Upgrade User */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <Label className="text-base font-medium">Upgrade a User</Label>
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="User ID or username"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Select value={newUserTier} onValueChange={(v) => setNewUserTier(v as "pro" | "unlimited")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Pro
                  </div>
                </SelectItem>
                <SelectItem value="unlimited">
                  <div className="flex items-center gap-2">
                    <Infinity className="w-4 h-4 text-purple-500" />
                    Unlimited
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpgradeUser} disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Subscriptions Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs">{sub.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>{tierBadge(sub.tier)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubscription(sub.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          💡 Use the user's UUID from auth.users or their profile username to upgrade them.
        </div>
      </CardContent>
    </Card>
  );
}
