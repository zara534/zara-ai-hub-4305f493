import { Settings, Home, Lock, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProfileManager } from "./ProfileManager";
import { InstallPWA } from "./InstallPWA";
interface HeaderProps {
  currentView: "home" | "admin" | "settings";
  onViewChange: (view: "home" | "admin" | "settings") => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const { logout } = useAuth();
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (view: "home" | "admin" | "settings") => {
    onViewChange(view);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="text-2xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  ZARA AI HUB
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-8">
                <Button
                  variant={currentView === "home" ? "default" : "ghost"}
                  className="w-full justify-start text-lg h-12"
                  onClick={() => handleNavigation("home")}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Home
                </Button>
                <Button
                  variant={currentView === "admin" ? "default" : "ghost"}
                  className="w-full justify-start text-lg h-12"
                  onClick={() => handleNavigation("admin")}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Admin
                </Button>
                <Button
                  variant={currentView === "settings" ? "default" : "ghost"}
                  className="w-full justify-start text-lg h-12"
                  onClick={() => handleNavigation("settings")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                <ProfileManager isMobile />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg h-12 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Centered Title */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight whitespace-nowrap">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                ZAH
              </span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={currentView === "home" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("home")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant={currentView === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("admin")}
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button
              variant={currentView === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <ProfileManager />
            <InstallPWA />
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/90"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Quick Access */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewChange("settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
