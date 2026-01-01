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
  Palette,
  MessageSquare,
  Wand2,
  Globe,
  Clock,
  Users,
  Star,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

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
      title: "Smart AI Chat",
      description: "Have natural conversations with advanced AI models that understand context and provide helpful responses"
    },
    {
      icon: ImageIcon,
      title: "Image Creation",
      description: "Transform your ideas into stunning visuals with multiple AI art models at your fingertips"
    },
    {
      icon: Wand2,
      title: "Multiple Models",
      description: "Access various AI models including Flux, Stable Diffusion, DALL-E 3 and more - all in one place"
    },
    {
      icon: Palette,
      title: "Fully Customizable",
      description: "Personalize your experience with themes, colors, fonts, and interface settings"
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description: "Use on any device - install as an app on your phone or access from any browser"
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get lightning-fast AI responses with no waiting in queues or slow loading times"
    }
  ];

  const benefits = [
    "No credit card required",
    "Free daily generations",
    "High-quality AI outputs",
    "Save and download your creations",
    "Works offline as PWA",
    "Regular updates & new features"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Your All-in-One AI Platform</span>
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            >
              <span className="block text-foreground">Create Amazing</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AI-Powered Content
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Generate stunning images, have intelligent conversations, and unlock the full power of artificial intelligence — completely free. Join thousands of creators using ZARA AI HUB every day.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            >
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")} 
                className="text-lg px-10 py-7 rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Start Creating Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/login")} 
                className="text-lg px-10 py-7 rounded-2xl font-bold hover:bg-primary/5"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </motion.div>

            {/* Quick benefits */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No signup fees
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No credit card
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Instant access
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From text generation to image creation, ZARA AI HUB gives you access to powerful AI tools that bring your ideas to life
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-2 bg-card/80 backdrop-blur hover:border-primary/50 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="pt-8 pb-8 space-y-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-xl">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">Why Choose ZARA AI</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  The Simplest Way to Use AI
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We believe everyone should have access to powerful AI tools. That's why we built ZARA AI HUB — a simple, beautiful, and completely free platform that lets you create without limits.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")}
                className="rounded-xl px-8"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">AI Chat</p>
                      <p className="text-sm text-muted-foreground">Ask anything, get smart answers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-lg ml-6">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Image Generation</p>
                      <p className="text-sm text-muted-foreground">Create art from text prompts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-lg">
                    <div className="w-12 h-12 bg-primary/80 rounded-xl flex items-center justify-center">
                      <Wand2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Multiple AI Models</p>
                      <p className="text-sm text-muted-foreground">Access the best AI tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Loved by users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Free to use</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Secure & Private</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Lightning Fast</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Start Creating?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join now and experience the power of AI at your fingertips. It takes less than 30 seconds to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")} 
                className="text-lg px-10 py-7 rounded-2xl font-bold shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">ZARA AI HUB</span>
          </div>
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
