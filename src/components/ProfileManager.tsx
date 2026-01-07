import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordChanger } from "./PasswordChanger";

interface ProfileManagerProps {
  isMobile?: boolean;
}

export function ProfileManager({ isMobile = false }: ProfileManagerProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUsername(profileData.username || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Username updated successfully!");
      await loadProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button variant="ghost" className="w-full justify-start text-lg h-12">
            <User className="w-5 h-5 mr-3" />
            Profile
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <Button onClick={handleUpdateUsername} disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Username"
                )}
              </Button>
              
              <div className="border-t pt-4">
                <PasswordChanger />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
