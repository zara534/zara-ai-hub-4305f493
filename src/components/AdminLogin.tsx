import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const { login } = useApp();

  const handleLogin = () => {
    if (login(password)) {
      toast.success("Welcome, Admin!");
    } else {
      toast.error("Invalid password");
    }
    setPassword("");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Lock className="w-5 h-5 md:w-6 md:h-6" />
            Admin Access
          </CardTitle>
          <CardDescription className="text-sm">
            Enter password to manage AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter admin password (zarahacks)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            className="h-12 text-base"
          />
          <Button onClick={handleLogin} className="w-full h-12 text-base">
            <Lock className="w-4 h-4 mr-2" />
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
