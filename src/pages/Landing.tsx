import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, UserPlus, FileText, Bot, Image as ImageIcon, Settings, MessageCircle, Facebook, Mail, Phone, Palette, Bell, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [colorIndex, setColorIndex] = useState(0);

  const colorThemes = [
    "from-blue-500/20 via-blue-400/10 to-cyan-500/20",
    "from-green-500/20 via-emerald-400/10 to-teal-500/20",
    "from-yellow-500/20 via-amber-400/10 to-orange-500/20",
    "from-orange-500/20 via-red-400/10 to-pink-500/20",
  ];

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colorThemes.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-all duration-1000 ${colorThemes[colorIndex]}`}>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12 animate-scale-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight animate-fade-in">
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
              ZARA AI HUB
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 font-semibold max-w-2xl mx-auto animate-fade-in">
            Your All-in-One AI Platform for Chat, Images & More
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")} 
              className="text-base px-10 py-6 shadow-xl hover:shadow-primary/50 transition-all hover:scale-105 font-bold rounded-xl"
              data-testid="button-signup"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/login")} 
              className="text-base px-10 py-6 border-2 hover:bg-primary/10 transition-all hover:scale-105 font-bold rounded-xl"
              data-testid="button-login"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-6xl mx-auto">
          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">AI Chat</h3>
              <p className="text-sm text-muted-foreground">
                Multiple AI models with smart conversations & streaming responses
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Image Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create stunning AI-generated images instantly
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Customization</h3>
              <p className="text-sm text-muted-foreground">
                Custom themes, fonts, dark mode & personalized settings
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Announcements</h3>
              <p className="text-sm text-muted-foreground">
                Stay updated with platform news & interact with community
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Model Ratings</h3>
              <p className="text-sm text-muted-foreground">
                Rate & review AI models to help improve the platform
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">Admin Panel</h3>
              <p className="text-sm text-muted-foreground">
                Manage custom AI models & broadcast to users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto animate-fade-in">
          <Card className="border-2 border-primary/40 bg-card/90 backdrop-blur hover:shadow-xl transition-all">
            <CardContent className="pt-6 pb-6">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Get in Touch
              </h2>
              <div className="space-y-3">
                <a 
                  href="tel:+2347011156046"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all hover:scale-105 group"
                >
                  <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">07011156046</span>
                </a>
                
                <a 
                  href="https://www.facebook.com/profile.php?id=61579058107810"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all hover:scale-105 group"
                >
                  <Facebook className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Follow on Facebook</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
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
