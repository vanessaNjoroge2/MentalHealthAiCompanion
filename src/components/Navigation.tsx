import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, TrendingUp, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MindfulAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('chat')}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
            <button 
              onClick={() => scrollToSection('mood')}
              className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Mood Tracker
            </button>
            <Button 
              onClick={() => scrollToSection('chat')}
              className="bg-gradient-primary hover:shadow-gentle transition-all duration-200"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('chat')}
                className="text-left px-4 py-2 text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button 
                onClick={() => scrollToSection('mood')}
                className="text-left px-4 py-2 text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Mood Tracker
              </button>
              <div className="px-4">
                <Button 
                  onClick={() => scrollToSection('chat')}
                  className="w-full bg-gradient-primary hover:shadow-gentle transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;