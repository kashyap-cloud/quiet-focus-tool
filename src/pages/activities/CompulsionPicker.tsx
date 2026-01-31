import { useState } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import { Wind, Hand, Eye, Droplets } from "lucide-react";

interface Action {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgClass: string;
  encouragement: string;
}

const actions: Action[] = [
  {
    id: "breathe",
    title: "Take 3 deep breaths",
    icon: <Wind className="w-6 h-6" />,
    bgClass: "bg-calm-blue/30",
    encouragement: "Inhale calm, exhale tension. You're resetting your nervous system.",
  },
  {
    id: "stretch",
    title: "Stretch your hands",
    icon: <Hand className="w-6 h-6" />,
    bgClass: "bg-calm-mint/30",
    encouragement: "Release the grip. Your body holds onto stress—let it go.",
  },
  {
    id: "window",
    title: "Look out a window",
    icon: <Eye className="w-6 h-6" />,
    bgClass: "bg-calm-lavender/30",
    encouragement: "Give your eyes distance. The world is bigger than this moment.",
  },
  {
    id: "water",
    title: "Drink some water",
    icon: <Droplets className="w-6 h-6" />,
    bgClass: "bg-calm-peach/30",
    encouragement: "Nourish yourself. Small acts of care add up.",
  },
];

const CompulsionPicker = () => {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleSelect = (action: Action) => {
    setSelectedAction(action);
  };

  const handleReset = () => {
    setSelectedAction(null);
  };

  if (selectedAction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
          {/* Icon */}
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6
            ${selectedAction.bgClass}
          `}>
            <div className="text-foreground">
              {selectedAction.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-medium text-foreground mb-4">
            {selectedAction.title}
          </h2>

          {/* Encouragement */}
          <p className="text-muted-foreground text-base mb-10 leading-relaxed">
            {selectedAction.encouragement}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="w-full px-6 py-4 rounded-2xl bg-card shadow-soft text-foreground font-medium tap-feedback hover:shadow-soft-lg transition-all"
            >
              Choose another action
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-6 py-4 rounded-2xl bg-primary/20 text-foreground font-medium tap-feedback hover:bg-primary/30 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ActivityLayout
      title="Compulsion Picker"
      subtitle="Choose a gentle alternative"
      bgColorClass="bg-background"
    >
      <div className="flex flex-col gap-6 pt-6">
        {/* Instruction */}
        <div className="text-center opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <h2 className="text-lg font-medium text-foreground mb-2">
            Pick one small action
          </h2>
          <p className="text-sm text-muted-foreground">
            Instead of the compulsion, try this instead
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleSelect(action)}
              className={`
                ${action.bgClass} rounded-2xl p-6
                flex flex-col items-center justify-center gap-3
                min-h-[140px]
                tap-feedback shadow-soft hover:shadow-soft-lg hover:scale-[1.02]
                transition-all duration-300
                opacity-0 animate-fade-in-up
              `}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <div className="text-foreground">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-foreground text-center leading-tight">
                {action.title}
              </span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground/60 text-center mt-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          These micro-actions can interrupt automatic patterns.
        </p>
      </div>
    </ActivityLayout>
  );
};

export default CompulsionPicker;
