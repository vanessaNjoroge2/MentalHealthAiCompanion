import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Shield } from "lucide-react";
import heroImage from "@/assets/hero-mental-health.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gentle gradient */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      
      {/* Hero Image */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Peaceful mental health companion illustration"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="animate-fade-in">
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-healing" />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-comfort" />
              <span>Always Caring</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-serenity" />
              <span>24/7 Available</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Your Personal
            <br />
            <span className="animate-gentle-bounce inline-block">AI Companion</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A safe space to talk, reflect, and grow. Our AI companion is here to listen, 
            support, and guide you on your mental wellness journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-warm transition-all duration-300 text-lg px-8 py-4"
            >
              Start Conversation
              <MessageCircle className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-healing text-healing hover:bg-healing hover:text-white transition-all duration-300 text-lg px-8 py-4"
            >
              Learn More
            </Button>
          </div>

          {/* Supporting text */}
          <p className="text-sm text-muted-foreground mt-8">
            No sign-up required • Free to start • Your privacy protected
          </p>
        </div>
      </div>

      {/* Floating elements for ambiance */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-healing rounded-full opacity-60 animate-gentle-bounce" 
           style={{ animationDelay: '0s' }} />
      <div className="absolute top-32 right-20 w-6 h-6 bg-comfort rounded-full opacity-40 animate-gentle-bounce" 
           style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-20 w-5 h-5 bg-serenity rounded-full opacity-50 animate-gentle-bounce" 
           style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSection;