import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight">
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
              ZARA AI HUB
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 font-semibold">
            AI Chat & Image Generator
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate("/signup")} 
            className="text-lg px-12 py-6 shadow-xl hover:shadow-primary/50 transition-all hover:scale-105 font-bold rounded-xl"
            data-testid="button-signup"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate("/login")} 
            className="text-lg px-12 py-6 border-2 hover:bg-primary/10 transition-all hover:scale-105 font-bold rounded-xl"
            data-testid="button-login"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </div>

        <div className="pt-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/terms")}
            className="text-sm hover:scale-105 transition-transform"
            data-testid="link-terms"
          >
            <FileText className="w-4 h-4 mr-2" />
            Terms of Service
          </Button>
        </div>
      </div>
    </div>
  );
}
