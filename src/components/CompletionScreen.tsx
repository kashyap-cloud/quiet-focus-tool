import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionScreenProps {
  title?: string;
  message?: string;
  onComplete?: () => void;
}

const CompletionScreen = ({
  title = "Well done",
  message = "You took time for yourself. That matters.",
  onComplete,
}: CompletionScreenProps) => {
  const navigate = useNavigate();

  const handleReturn = () => {
    if (onComplete) {
      onComplete();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
        {/* Animated checkmark */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-secondary/50 animate-gentle-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <Check className="w-10 h-10 text-secondary-foreground" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          {title}
        </h1>

        {/* Message */}
        <p className="text-muted-foreground text-base mb-10">
          {message}
        </p>

        {/* Return button */}
        <Button
          onClick={handleReturn}
          className="px-8 py-6 rounded-2xl bg-primary/20 hover:bg-primary/30 text-foreground font-medium text-base tap-feedback shadow-soft"
          variant="ghost"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default CompletionScreen;
