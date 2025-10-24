import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, MessageCircle, Mail, Phone, Image as ImageIcon, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import featureBg from "@/assets/feature-bg.jpg";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Hero Section - Mobile-First Design */}
      <div className="container mx-auto px-4">
        <div className="min-h-screen flex flex-col items-center justify-center py-8 space-y-12">
          {/* Main Hero */}
          <div className="text-center space-y-8 animate-fade-in max-w-4xl">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30 shadow-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight">
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
                  ZARA
                </span>
                <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-fade-in">
                  AI HUB
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                Create, Generate & Innovate with AI
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")} 
                className="text-lg px-12 py-6 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 font-bold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/login")} 
                className="text-lg px-12 py-6 border-2 hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Highlights - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/40">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl">AI Chat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Smart conversations with multiple AI models
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-accent/40">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center shadow-xl -rotate-3 hover:rotate-0 transition-transform">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl">Image AI</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create stunning visuals instantly
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/40">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant responses, zero delays
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-accent/40">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center shadow-xl -rotate-3 hover:rotate-0 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl">24/7 Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Always here to help you succeed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA */}
          <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 max-w-2xl w-full mx-4">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3">
                <MessageCircle className="w-7 h-7 text-primary" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <p className="text-center text-muted-foreground text-lg">
                We're here for you anytime!
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <a 
                  href="mailto:mgbeahuruchizaram336@gmail.com"
                  className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-1">Email Us</h4>
                    <p className="text-xs text-muted-foreground">Quick response guaranteed</p>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/2347011156046"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border-2 border-accent/20 hover:border-accent/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-1">WhatsApp</h4>
                    <p className="text-xs text-muted-foreground">Chat with us instantly</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground/70 px-4 pb-4">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
