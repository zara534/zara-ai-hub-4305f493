import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextGeneration } from "@/components/TextGeneration";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminLogin } from "@/components/AdminLogin";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, session } = useAuth();
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "admin" | "settings">("home");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user && session === null) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [user, session, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto py-4 md:py-8 px-0 md:px-4">
        {currentView === "home" && <TextGeneration />}
        {currentView === "settings" && <SettingsPanel />}
        {currentView === "admin" && (isAdmin ? <AdminPanel /> : <AdminLogin />)}
      </main>
    </div>
  );
};

export default Index;
