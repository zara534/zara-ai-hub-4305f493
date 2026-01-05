import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Star, 
  History, 
  Settings, 
  Sparkles,
  ArrowRight,
  Check
} from "lucide-react";

const ONBOARDING_KEY = "zara_onboarding_complete";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to ZARA AI! 🎉",
    description: "Your all-in-one AI platform with 170+ AI models for text and image generation. Let's show you around!",
    icon: Sparkles,
    color: "from-primary to-accent"
  },
  {
    title: "Text Generation 💬",
    description: "Chat with 170+ AI personalities! From homework help to creative writing, pick an AI that fits your needs and start chatting.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Image Generation 🎨",
    description: "Create stunning images with multiple AI models. Type what you want to see, and watch the magic happen!",
    icon: ImageIcon,
    color: "from-purple-500 to-pink-400"
  },
  {
    title: "Favorites ⭐",
    description: "Found an AI you love? Tap the star to save it! Your favorites appear at the top for quick access.",
    icon: Star,
    color: "from-yellow-500 to-orange-400"
  },
  {
    title: "Chat History 📜",
    description: "All your conversations are saved automatically. Resume any chat anytime from the history panel.",
    icon: History,
    color: "from-green-500 to-emerald-400"
  },
  {
    title: "Customize Everything ⚙️",
    description: "Make it yours! Change themes, colors, fonts in Settings. You're all set to explore!",
    icon: Settings,
    color: "from-rose-500 to-red-400"
  }
];

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay to let the app render first
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-br ${step.color} p-8 text-white`}>
              <div className="flex justify-center mb-4">
                <motion.div 
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                >
                  <Icon className="w-10 h-10" />
                </motion.div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl text-white">
                  {step.title}
                </DialogTitle>
              </DialogHeader>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-center text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep 
                        ? "bg-primary w-6" 
                        : idx < currentStep 
                          ? "bg-primary/50" 
                          : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {!isLastStep && (
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip}
                    className="flex-1"
                  >
                    Skip
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  className={`flex-1 gap-2 ${isLastStep ? "w-full" : ""}`}
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
