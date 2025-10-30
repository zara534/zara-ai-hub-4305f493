import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn, 
  UserPlus, 
  FileText, 
  Bot, 
  Image as ImageIcon, 
  MessageCircle, 
  Mail, 
  Phone, 
  Palette, 
  Bell, 
  Shield,
  Zap,
  Download,
  Copy,
  Star,
  Users,
  Sparkles
} from "lucide-react";
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
        <div className="text-center space-y-6 mb-16 animate-scale-in">
          <Badge className="mb-4 px-4 py-1 text-sm" variant="secondary">
            <Sparkles className="w-4 h-4 mr-1" />
            Powered by Advanced AI Technology
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight animate-fade-in">
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-2xl">
              ZARA AI HUB
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 font-semibold max-w-3xl mx-auto animate-fade-in">
            Your All-in-One AI Platform for Chat, Images & More
          </p>

          <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
            Experience the power of cutting-edge artificial intelligence with multiple AI models, 
            customizable settings, and a beautiful interface designed for everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")} 
              className="text-base px-12 py-7 shadow-2xl hover:shadow-primary/60 transition-all hover:scale-110 font-bold rounded-xl"
              data-testid="button-signup"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/login")} 
              className="text-base px-12 py-7 border-2 hover:bg-primary/10 transition-all hover:scale-110 font-bold rounded-xl"
              data-testid="button-login"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          <Card className="border-2 bg-card/90 backdrop-blur text-center p-4 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-primary">5+</div>
            <div className="text-sm text-muted-foreground">AI Models</div>
          </Card>
          <Card className="border-2 bg-card/90 backdrop-blur text-center p-4 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-primary">
              <Zap className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-muted-foreground">Fast Response</div>
          </Card>
          <Card className="border-2 bg-card/90 backdrop-blur text-center p-4 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Free to Use</div>
          </Card>
          <Card className="border-2 bg-card/90 backdrop-blur text-center p-4 hover:scale-105 transition-all">
            <div className="text-3xl font-bold text-primary">
              <Users className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-muted-foreground">Community</div>
          </Card>
        </div>

        {/* Features Grid */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Powerful Features
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">AI Chat Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Engage in intelligent conversations with multiple advanced AI models. Get instant responses with streaming technology.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Image Generation</h3>
              <p className="text-sm text-muted-foreground">
                Transform your ideas into stunning visuals with powerful AI image generators. Download and share instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Export Your Work</h3>
              <p className="text-sm text-muted-foreground">
                Download conversations, save images, and copy responses with one click. Your creations, your way.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Full Customization</h3>
              <p className="text-sm text-muted-foreground">
                Personalize your experience with custom themes, fonts, colors, and dark mode. Make it truly yours.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Model Ratings</h3>
              <p className="text-sm text-muted-foreground">
                Rate and review AI models to help the community. Share your experience and discover the best tools.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Receive platform announcements, feature updates, and community news directly in your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Copy className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Easy Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Copy prompts and responses instantly. Share your AI-generated content with friends and colleagues.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Chat History</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of all your conversations. Review past chats and continue where you left off anytime.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur hover:shadow-2xl transition-all hover:-translate-y-2 hover:scale-105 animate-fade-in">
            <CardContent className="pt-6 pb-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl">Fast & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast AI responses with streaming technology. Experience smooth, real-time generation every time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
          <Card className="border-2 border-primary/40 bg-card/90 backdrop-blur hover:shadow-2xl transition-all">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Get in Touch
              </h2>
              <p className="text-center text-muted-foreground mb-6">
                Have questions? We'd love to hear from you!
              </p>
              <div className="space-y-4">
                <a 
                  href="tel:+2347011156046"
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-primary/10 transition-all hover:scale-105 group border-2 border-transparent hover:border-primary/30"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-semibold">Call or WhatsApp</div>
                    <div className="text-sm text-muted-foreground">07011156046</div>
                  </div>
                </a>
                
                <a 
                  href="mailto:mgbeahuruchizaram336@gmail.com"
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-primary/10 transition-all hover:scale-105 group border-2 border-transparent hover:border-primary/30"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-semibold">Email Us</div>
                    <div className="text-sm text-muted-foreground">mgbeahuruchizaram336@gmail.com</div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/terms")}
            className="text-sm hover:scale-105 transition-transform"
            data-testid="link-terms"
          >
            <FileText className="w-4 h-4 mr-2" />
            Terms of Service
          </Button>
          <p className="text-xs text-muted-foreground">
            © 2025 ZARA AI HUB. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
