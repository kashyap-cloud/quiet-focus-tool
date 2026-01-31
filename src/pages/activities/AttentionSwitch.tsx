import { useState, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";

type ShapeType = "circle" | "square" | "triangle";

interface Shape {
  id: number;
  type: ShapeType;
  isBlue: boolean;
  found: boolean;
}

const generateShapes = (): Shape[] => {
  const shapes: Shape[] = [];
  const types: ShapeType[] = ["circle", "square", "triangle"];
  
  // Ensure we have exactly 2 blue circles among 6 shapes
  for (let i = 0; i < 6; i++) {
    const isBlueCircle = i < 2;
    shapes.push({
      id: i,
      type: isBlueCircle ? "circle" : types[Math.floor(Math.random() * 3)],
      isBlue: isBlueCircle,
      found: false,
    });
  }
  
  // Shuffle the array
  return shapes.sort(() => Math.random() - 0.5);
};

const ShapeComponent = ({
  shape,
  onTap,
  shakeId,
}: {
  shape: Shape;
  onTap: (shape: Shape) => void;
  shakeId: number | null;
}) => {
  const baseClasses = `
    w-20 h-20 flex items-center justify-center
    tap-feedback cursor-pointer
    transition-all duration-300 ease-out
    ${shape.found ? "opacity-30 scale-90" : "hover:scale-105"}
    ${shakeId === shape.id ? "animate-shake" : ""}
  `;

  const getShapeColor = () => {
    if (shape.isBlue) return "bg-calm-blue";
    const colors = ["bg-calm-mint", "bg-calm-lavender", "bg-calm-peach", "bg-calm-rose"];
    return colors[shape.id % colors.length];
  };

  const renderShape = () => {
    switch (shape.type) {
      case "circle":
        return (
          <div className={`w-16 h-16 rounded-full ${getShapeColor()} shadow-soft`} />
        );
      case "square":
        return (
          <div className={`w-14 h-14 rounded-xl ${getShapeColor()} shadow-soft`} />
        );
      case "triangle":
        return (
          <div
            className={`w-0 h-0 border-l-[28px] border-r-[28px] border-b-[48px] border-l-transparent border-r-transparent`}
            style={{ borderBottomColor: `hsl(var(--calm-${shape.isBlue ? "blue" : ["mint", "lavender", "peach", "rose"][shape.id % 4]}))` }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={() => !shape.found && onTap(shape)}
      className={baseClasses}
      disabled={shape.found}
      aria-label={`${shape.isBlue ? "Blue" : "Colored"} ${shape.type}`}
    >
      {renderShape()}
    </button>
  );
};

const AttentionSwitch = () => {
  const [shapes, setShapes] = useState<Shape[]>(generateShapes);
  const [completed, setCompleted] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);

  const handleTap = useCallback((tappedShape: Shape) => {
    if (tappedShape.isBlue && tappedShape.type === "circle") {
      // Correct! Mark as found
      setShapes((prev) => {
        const updated = prev.map((s) =>
          s.id === tappedShape.id ? { ...s, found: true } : s
        );
        
        // Check if all blue circles are found
        const allFound = updated
          .filter((s) => s.isBlue && s.type === "circle")
          .every((s) => s.found);
        
        if (allFound) {
          setTimeout(() => setCompleted(true), 500);
        }
        
        return updated;
      });
    } else {
      // Wrong shape - shake feedback
      setShakeId(tappedShape.id);
      setTimeout(() => setShakeId(null), 400);
    }
  }, []);

  if (completed) {
    return (
      <CompletionScreen
        title="Focus restored"
        message="You directed your attention with intention. Well done."
      />
    );
  }

  const blueCirclesFound = shapes.filter((s) => s.isBlue && s.type === "circle" && s.found).length;
  const totalBlueCircles = shapes.filter((s) => s.isBlue && s.type === "circle").length;

  return (
    <ActivityLayout
      title="Attention Switch"
      subtitle="Redirect your focus"
      bgColorClass="bg-background"
    >
      <div className="flex flex-col items-center pt-8">
        {/* Instruction */}
        <div className="text-center mb-8 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <p className="text-lg font-medium text-foreground mb-2">
            Tap only the blue circles
          </p>
          <p className="text-sm text-muted-foreground">
            {blueCirclesFound} of {totalBlueCircles} found
          </p>
        </div>

        {/* Shape Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-3xl bg-card/50 shadow-soft opacity-0 animate-fade-in-scale" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          {shapes.map((shape) => (
            <ShapeComponent
              key={shape.id}
              shape={shape}
              onTap={handleTap}
              shakeId={shakeId}
            />
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-muted-foreground/60 mt-8 text-center max-w-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          This exercise helps train selective attention and quiets mental chatter.
        </p>
      </div>
    </ActivityLayout>
  );
};

export default AttentionSwitch;
