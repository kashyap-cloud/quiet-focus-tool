import { useState } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { useNavigate } from "react-router-dom";

type Choice = "new" | "same" | null;

interface Response {
  title: string;
  message: string;
}

const responses: Record<"new" | "same", Response> = {
  new: {
    title: "Something new",
    message: "This awareness is progress. Noticing something different means you're paying attention to your patterns.",
  },
  same: {
    title: "The same loop",
    message: "Recognition is the first step out. You've been here before—and you can choose differently this time.",
  },
};

const EndTheLoop = () => {
  const [choice, setChoice] = useState<Choice>(null);
  const navigate = useNavigate();

  const handleChoice = (selected: "new" | "same") => {
    setChoice(selected);
  };

  if (choice) {
    const response = responses[choice];
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-activity-loop/30 mb-6">
            <span className="text-3xl">{choice === "new" ? "✨" : "🔄"}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-medium text-foreground mb-4">
            {response.title}
          </h2>

          {/* Message */}
          <p className="text-muted-foreground text-base mb-10 leading-relaxed">
            {response.message}
          </p>

          {/* Return button */}
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 rounded-2xl bg-primary/20 hover:bg-primary/30 text-foreground font-medium tap-feedback shadow-soft transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ActivityLayout
      title="End the Loop"
      subtitle="Recognize your patterns"
      bgColorClass="bg-background"
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        {/* Question */}
        <div className="text-center opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <h2 className="text-xl font-medium text-foreground leading-relaxed">
            Does this feel like<br />the same loop?
          </h2>
        </div>

        {/* Choice buttons */}
        <div className="flex gap-4 w-full max-w-xs opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <button
            onClick={() => handleChoice("new")}
            className="
              flex-1 py-6 px-4 rounded-2xl
              bg-calm-mint/30 
              text-foreground font-medium text-base
              tap-feedback shadow-soft hover:shadow-soft-lg hover:scale-[1.02]
              transition-all duration-300
            "
          >
            New
          </button>
          <button
            onClick={() => handleChoice("same")}
            className="
              flex-1 py-6 px-4 rounded-2xl
              bg-activity-loop/30
              text-foreground font-medium text-base
              tap-feedback shadow-soft hover:shadow-soft-lg hover:scale-[1.02]
              transition-all duration-300
            "
          >
            Same loop
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground/60 text-center max-w-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          There's no wrong answer. This is about building self-awareness.
        </p>
      </div>
    </ActivityLayout>
  );
};

export default EndTheLoop;
