import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
          ZARA AI HUB
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Your all-in-one AI platform for intelligent text generation and stunning image creation
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button size="lg" onClick={() => navigate("/signup")} className="text-lg px-12 py-6 shadow-primary">
            Sign Up
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-lg px-12 py-6">
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
