import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface AdminPasswordPromptProps {
  onSuccess: () => void;
}

const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

export function AdminPasswordPrompt({ onSuccess }: AdminPasswordPromptProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      onSuccess();
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Admin Access Required
          </CardTitle>
          <CardDescription className="text-sm">
            Enter the admin password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              Unlock Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
