import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldCheck } from "lucide-react";
import { AdminPasswordPrompt } from "@/components/AdminPasswordPrompt";

export function AdminLogin() {
  const { isAdmin } = useAuth();
  const [hasEnteredPassword, setHasEnteredPassword] = useState(false);

  useEffect(() => {
    // Reset password requirement when component mounts
    setHasEnteredPassword(false);
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md border-2 shadow-lg bg-destructive/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl text-destructive">
              <Lock className="w-5 h-5 md:w-6 md:h-6" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-sm">
              You must be logged in as an admin to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact the system administrator if you believe you should have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasEnteredPassword) {
    return <AdminPasswordPrompt onSuccess={() => setHasEnteredPassword(true)} />;
  }

  return null;
}
