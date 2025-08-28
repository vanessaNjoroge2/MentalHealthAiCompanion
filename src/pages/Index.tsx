import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ChatInterface from "@/components/ChatInterface";
import MoodTracker from "@/components/MoodTracker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Chat Interface */}
      <div id="chat">
        <ChatInterface />
      </div>
      
      {/* Mood Tracker */}
      <div id="mood">
        <MoodTracker />
      </div>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-gradient-subtle border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
              <span className="text-white text-sm">💙</span>
            </div>
            <span className="text-lg font-semibold">MindfulAI</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Your mental wellness journey starts with a single conversation.
          </p>
          <p className="text-sm text-muted-foreground">
            Always remember: If you're experiencing a mental health emergency, please contact your local emergency services or crisis helpline immediately.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
