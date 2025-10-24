import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, MessageCircle, Image as ImageIcon, Bot, FileText, LogIn, UserPlus, Menu, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colorIndex, setColorIndex] = useState(0);

  const colorThemes = [
    "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
    "from-blue-500/20 via-cyan-500/10 to-teal-500/20",
    "from-rose-500/20 via-pink-500/10 to-red-500/20",
    "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    "from-emerald-500/20 via-green-500/10 to-lime-500/20",
  ];

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Change color every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colorThemes.length);
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-all duration-1000 ${colorThemes[colorIndex]}`}>
      {/* Floating Navigation Menu */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-2xl hover:scale-110 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Navigation
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full justify-start text-lg gap-3 hover:scale-105 transition-transform"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/signup")}
                className="w-full justify-start text-lg gap-3 hover:scale-105 transition-transform"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/terms")}
                className="w-full justify-start text-lg gap-3 hover:scale-105 transition-transform"
              >
                <FileText className="w-5 h-5" />
                Terms of Service
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full justify-start text-lg gap-3 hover:scale-105 transition-transform"
              >
                <a
                  href="https://www.facebook.com/profile.php?id=61579058107810"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Hero Section - Mobile-First Design */}
      <div className="container mx-auto px-4">
        <div className="min-h-screen flex flex-col items-center justify-center py-8 space-y-16">
          {/* Main Hero */}
          <div className="text-center space-y-8 animate-fade-in max-w-4xl">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30 shadow-lg backdrop-blur-sm animate-pulse">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight animate-scale-in">
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
                  ZARA
                </span>
                <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent drop-shadow-2xl">
                  AI HUB
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 max-w-3xl mx-auto font-bold leading-relaxed px-4 animate-fade-in">
                Create, Generate & Innovate with AI
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 px-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")} 
                className="text-xl px-16 py-8 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 font-bold rounded-2xl animate-scale-in"
              >
                <UserPlus className="w-6 h-6 mr-3" />
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/login")} 
                className="text-xl px-16 py-8 border-2 hover:bg-primary/10 transition-all duration-300 hover:scale-110 font-bold rounded-2xl animate-scale-in"
              >
                <LogIn className="w-6 h-6 mr-3" />
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Highlights - Mobile Optimized with Staggered Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl px-4">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:border-primary/50 animate-fade-in backdrop-blur-sm">
              <CardContent className="pt-10 pb-8 text-center space-y-5">
                <div className="w-20 h-20 mx-auto gradient-primary rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-110">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-2xl">AI Chat</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Smart conversations with multiple AI models
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:border-accent/50 animate-fade-in backdrop-blur-sm">
              <CardContent className="pt-10 pb-8 text-center space-y-5">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-accent/70 rounded-3xl flex items-center justify-center shadow-2xl -rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-110">
                  <ImageIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-2xl">Image AI</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Create stunning visuals instantly
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:border-primary/50 animate-fade-in backdrop-blur-sm">
              <CardContent className="pt-10 pb-8 text-center space-y-5">
                <div className="w-20 h-20 mx-auto gradient-primary rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-110">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-2xl">Lightning Fast</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Instant responses, zero delays
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 bg-gradient-to-br from-card to-accent/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:border-accent/50 animate-fade-in backdrop-blur-sm">
              <CardContent className="pt-10 pb-8 text-center space-y-5">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-accent/70 rounded-3xl flex items-center justify-center shadow-2xl -rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-110">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-2xl">24/7 Support</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Always here to help you succeed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links Section */}
          <div className="text-center space-y-4 px-4 pb-8 animate-fade-in">
            <p className="text-lg text-muted-foreground">
              Tap the menu button above to explore more!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/terms")}
                className="text-sm hover:scale-105 transition-transform"
              >
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
              <Button
                variant="ghost"
                asChild
                className="text-sm hover:scale-105 transition-transform"
              >
                <a
                  href="https://www.facebook.com/profile.php?id=61579058107810"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Follow us on Facebook
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
