import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LogIn, 
  UserPlus, 
  Bot, 
  Image as ImageIcon, 
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Palette
} from "lucide-react";
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

  const features = [
    {
      icon: Bot,
      title: "AI Chat",
      description: "Intelligent conversations with multiple AI models"
    },
    {
      icon: ImageIcon,
      title: "Image Generation",
      description: "Create stunning visuals from text prompts"
    },
    {
      icon: Zap,
      title: "Fast & Free",
      description: "Lightning-fast responses at no cost"
    },
    {
      icon: Palette,
      title: "Customizable",
      description: "Themes, fonts, and personalization options"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg mb-4">
            <span className="text-4xl font-black text-primary-foreground">Z</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Platform</span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="block text-foreground">Your AI</span>
            <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Companion
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chat with AI, generate images, and explore the possibilities of artificial intelligence — all in one beautiful app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")} 
              className="text-base px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-primary/25 transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/login")} 
              className="text-base px-8 py-6 rounded-xl font-semibold"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto">
          {features.map((feature, idx) => (
            <Card key={idx} className="border bg-card/50 backdrop-blur hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 ZARA AI. All rights reserved.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/terms")}
          >
            Terms of Service
          </Button>
        </div>
      </footer>
    </div>
  );
}
