import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Sun, Cloud, CloudRain } from "lucide-react";

const moods = [
  { icon: Smile, label: "Great", color: "text-serenity", value: 5 },
  { icon: Sun, label: "Good", color: "text-comfort", value: 4 },
  { icon: Meh, label: "Okay", color: "text-primary", value: 3 },
  { icon: Cloud, label: "Low", color: "text-muted-foreground", value: 2 },
  { icon: Frown, label: "Difficult", color: "text-destructive", value: 1 }
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedMood) {
      setSubmitted(true);
      // Here you would typically save to your backend
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        setReflection("");
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8 bg-gradient-subtle border-0 shadow-warm">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-2 text-primary">Thank you for sharing</h3>
            <p className="text-muted-foreground">Your mood has been recorded. Remember, every feeling is valid.</p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-comfort bg-clip-text text-transparent">
            How Are You Feeling?
          </h2>
          <p className="text-muted-foreground text-lg">
            Take a moment to check in with yourself
          </p>
        </div>

        <Card className="p-8 shadow-warm border-0 bg-gradient-subtle">
          {/* Mood Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Choose your current mood</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                      selectedMood === mood.value
                        ? 'bg-white shadow-gentle ring-2 ring-primary'
                        : 'hover:bg-white hover:shadow-gentle'
                    }`}
                  >
                    <IconComponent 
                      className={`h-8 w-8 mb-2 ${mood.color} ${
                        selectedMood === mood.value ? 'scale-110' : ''
                      } transition-transform duration-200`} 
                    />
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Area */}
          {selectedMood && (
            <div className="mb-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">What's on your mind?</h3>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Take a moment to reflect on your feelings. What's contributing to your mood today? (Optional)"
                className="min-h-[120px] resize-none border-border focus:ring-healing"
              />
            </div>
          )}

          {/* Submit Button */}
          {selectedMood && (
            <div className="text-center animate-fade-in">
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-comfort hover:shadow-warm transition-all duration-200 px-8"
              >
                Record Mood
              </Button>
            </div>
          )}
        </Card>

        {/* Helpful Tip */}
        <div className="mt-8 text-center">
          <Card className="p-4 bg-accent border-0">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Regular mood tracking helps you identify patterns 
              and understand what affects your wellbeing.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MoodTracker;