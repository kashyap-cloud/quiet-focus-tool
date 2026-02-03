import { useState, useCallback, useEffect } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";

type Difficulty = "easy" | "medium" | "hard";

interface Challenge {
  id: number;
  instruction: string;
  targetDescription: string;
  shapes: ShapeItem[];
  targetCount: number;
  timeLimit: number; // seconds
}

interface ShapeItem {
  id: number;
  type: "circle" | "square" | "triangle" | "star" | "heart";
  color: "blue" | "mint" | "lavender" | "peach" | "rose";
  size: "small" | "medium" | "large";
  isTarget: boolean;
  found: boolean;
}

const difficultySettings: Record<Difficulty, { label: string; challenges: number; description: string }> = {
  easy: { label: "Gentle", challenges: 2, description: "A calm start" },
  medium: { label: "Balanced", challenges: 3, description: "A steady pace" },
  hard: { label: "Focused", challenges: 2, description: "Stay present" },
};

const generateChallenges = (difficulty: Difficulty): Challenge[] => {
  const challenges: Challenge[] = [];
  const count = difficultySettings[difficulty].challenges;
  
  const easyTemplates = [
    { instruction: "Tap only the blue circles", targetDescription: "blue circles", targetType: "circle" as const, targetColor: "blue" as const },
    { instruction: "Find the lavender squares", targetDescription: "lavender squares", targetType: "square" as const, targetColor: "lavender" as const },
  ];
  
  const mediumTemplates = [
    { instruction: "Tap the mint triangles", targetDescription: "mint triangles", targetType: "triangle" as const, targetColor: "mint" as const },
    { instruction: "Find all the peach circles", targetDescription: "peach circles", targetType: "circle" as const, targetColor: "peach" as const },
    { instruction: "Tap the blue squares only", targetDescription: "blue squares", targetType: "square" as const, targetColor: "blue" as const },
  ];
  
  const hardTemplates = [
    { instruction: "Find the large blue shapes", targetDescription: "large blue shapes", targetColor: "blue" as const, targetSize: "large" as const },
    { instruction: "Tap all small lavender shapes", targetDescription: "small lavender shapes", targetColor: "lavender" as const, targetSize: "small" as const },
  ];
  
  const templates = difficulty === "easy" ? easyTemplates : difficulty === "medium" ? mediumTemplates : hardTemplates;
  const shapes: ShapeItem["type"][] = ["circle", "square", "triangle"];
  const colors: ShapeItem["color"][] = ["blue", "mint", "lavender", "peach", "rose"];
  const sizes: ShapeItem["size"][] = ["small", "medium", "large"];
  
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const shapeItems: ShapeItem[] = [];
    const gridSize = difficulty === "easy" ? 6 : difficulty === "medium" ? 9 : 9;
    const targetCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 3;
    const timeLimit = difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20;
    
    // Generate target shapes
    for (let j = 0; j < targetCount; j++) {
      const targetShape: ShapeItem = {
        id: j,
        type: "targetType" in template ? template.targetType : shapes[Math.floor(Math.random() * shapes.length)],
        color: template.targetColor,
        size: "targetSize" in template ? template.targetSize : sizes[Math.floor(Math.random() * sizes.length)],
        isTarget: true,
        found: false,
      };
      shapeItems.push(targetShape);
    }
    
    // Generate non-target shapes
    for (let j = targetCount; j < gridSize; j++) {
      let nonTargetType: ShapeItem["type"];
      let nonTargetColor: ShapeItem["color"];
      let nonTargetSize: ShapeItem["size"];
      
      do {
        nonTargetType = shapes[Math.floor(Math.random() * shapes.length)];
        nonTargetColor = colors[Math.floor(Math.random() * colors.length)];
        nonTargetSize = sizes[Math.floor(Math.random() * sizes.length)];
      } while (
        ("targetType" in template && nonTargetType === template.targetType && nonTargetColor === template.targetColor) ||
        ("targetSize" in template && nonTargetColor === template.targetColor && nonTargetSize === template.targetSize)
      );
      
      shapeItems.push({
        id: j,
        type: nonTargetType,
        color: nonTargetColor,
        size: nonTargetSize,
        isTarget: false,
        found: false,
      });
    }
    
    // Shuffle shapes
    shapeItems.sort(() => Math.random() - 0.5);
    shapeItems.forEach((s, idx) => (s.id = idx));
    
    challenges.push({
      id: i,
      instruction: template.instruction,
      targetDescription: template.targetDescription,
      shapes: shapeItems,
      targetCount,
      timeLimit,
    });
  }
  
  return challenges;
};

const ShapeComponent = ({
  shape,
  onTap,
  shakeId,
  glowId,
}: {
  shape: ShapeItem;
  onTap: (shape: ShapeItem) => void;
  shakeId: number | null;
  glowId: number | null;
}) => {
  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-14 h-14",
    large: "w-18 h-18",
  };
  
  const colorClasses: Record<ShapeItem["color"], string> = {
    blue: "bg-calm-blue",
    mint: "bg-calm-mint",
    lavender: "bg-calm-lavender",
    peach: "bg-calm-peach",
    rose: "bg-calm-rose",
  };
  
  const baseClasses = `
    w-20 h-20 flex items-center justify-center
    tap-feedback cursor-pointer
    transition-all duration-300 ease-out
    ${shape.found ? "opacity-30 scale-75" : "hover:scale-105"}
    ${shakeId === shape.id ? "animate-shake" : ""}
    ${glowId === shape.id ? "ring-4 ring-calm-mint/60" : ""}
  `;

  const renderShape = () => {
    const size = sizeClasses[shape.size];
    const color = colorClasses[shape.color];
    
    switch (shape.type) {
      case "circle":
        return <div className={`${size} rounded-full ${color} shadow-soft`} />;
      case "square":
        return <div className={`${size} rounded-xl ${color} shadow-soft`} />;
      case "triangle":
        const triangleSize = shape.size === "small" ? 20 : shape.size === "medium" ? 28 : 36;
        return (
          <div
            className="w-0 h-0"
            style={{
              borderLeft: `${triangleSize}px solid transparent`,
              borderRight: `${triangleSize}px solid transparent`,
              borderBottom: `${triangleSize * 1.7}px solid hsl(var(--calm-${shape.color}))`,
            }}
          />
        );
      default:
        return <div className={`${size} rounded-full ${color} shadow-soft`} />;
    }
  };

  return (
    <button
      onClick={() => !shape.found && onTap(shape)}
      className={baseClasses}
      disabled={shape.found}
      aria-label={`${shape.color} ${shape.size} ${shape.type}`}
    >
      {renderShape()}
    </button>
  );
};

const AttentionSwitch = () => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [glowId, setGlowId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const currentChallenge = challenges[currentChallengeIndex];

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerActive, timeLeft]);

  const startWithDifficulty = (diff: Difficulty) => {
    const newChallenges = generateChallenges(diff);
    setDifficulty(diff);
    setChallenges(newChallenges);
    setCurrentChallengeIndex(0);
    setTimeLeft(newChallenges[0].timeLimit);
    setTimerActive(true);
  };

  const handleTap = useCallback((tappedShape: ShapeItem) => {
    if (!currentChallenge) return;
    
    if (tappedShape.isTarget) {
      // Correct - show gentle glow
      setGlowId(tappedShape.id);
      setTimeout(() => setGlowId(null), 400);
      
      setChallenges((prev) => {
        const updated = [...prev];
        const challenge = { ...updated[currentChallengeIndex] };
        challenge.shapes = challenge.shapes.map((s) =>
          s.id === tappedShape.id ? { ...s, found: true } : s
        );
        updated[currentChallengeIndex] = challenge;
        
        // Check if all targets found
        const allFound = challenge.shapes.filter((s) => s.isTarget).every((s) => s.found);
        
        if (allFound) {
          setTimerActive(false);
          setTimeout(() => {
            if (currentChallengeIndex < challenges.length - 1) {
              const nextIndex = currentChallengeIndex + 1;
              setCurrentChallengeIndex(nextIndex);
              setTimeLeft(challenges[nextIndex].timeLimit);
              setTimerActive(true);
            } else {
              setCompleted(true);
            }
          }, 800);
        }
        
        return updated;
      });
    } else {
      // Wrong - gentle shake
      setShakeId(tappedShape.id);
      setTimeout(() => setShakeId(null), 400);
    }
  }, [currentChallenge, currentChallengeIndex, challenges.length]);

  if (completed) {
    return (
      <CompletionScreen
        title="Focus restored"
        message="You directed your attention with intention. Your mind feels clearer now."
      />
    );
  }

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <ActivityLayout
        title="Attention Switch"
        subtitle="Choose your pace"
        bgColorClass="bg-background"
      >
        <div className="flex flex-col items-center pt-8 gap-6">
          <p className="text-center text-muted-foreground text-sm max-w-xs">
            This exercise helps you practice redirecting your focus gently. Choose what feels right for you today.
          </p>
          
          <div className="w-full max-w-xs space-y-3">
            {(Object.keys(difficultySettings) as Difficulty[]).map((diff, index) => (
              <button
                key={diff}
                onClick={() => startWithDifficulty(diff)}
                className={`
                  w-full p-5 rounded-2xl bg-card shadow-soft
                  flex items-center justify-between
                  tap-feedback hover:shadow-soft-lg hover:scale-[1.02]
                  transition-all duration-300
                  opacity-0 animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <div className="text-left">
                  <h3 className="font-medium text-foreground">{difficultySettings[diff].label}</h3>
                  <p className="text-sm text-muted-foreground">{difficultySettings[diff].description}</p>
                </div>
                <div className="text-xs text-muted-foreground/60">
                  {difficultySettings[diff].challenges} rounds
                </div>
              </button>
            ))}
          </div>
        </div>
      </ActivityLayout>
    );
  }

  if (!currentChallenge) return null;

  const foundCount = currentChallenge.shapes.filter((s) => s.isTarget && s.found).length;
  const gridCols = currentChallenge.shapes.length <= 6 ? 3 : 3;

  return (
    <ActivityLayout
      title="Attention Switch"
      subtitle={`${difficultySettings[difficulty].label} · Round ${currentChallengeIndex + 1}/${challenges.length}`}
      bgColorClass="bg-background"
    >
      <div className="flex flex-col items-center pt-4">
        {/* Timer */}
        <div className="mb-4 flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <div className={`
            px-4 py-2 rounded-full bg-card shadow-soft
            ${timeLeft <= 10 ? "text-calm-rose" : "text-foreground"}
            transition-colors duration-300
          `}>
            <span className="text-lg font-medium tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <p className="text-lg font-medium text-foreground mb-2">
            {currentChallenge.instruction}
          </p>
          <p className="text-sm text-muted-foreground">
            {foundCount} of {currentChallenge.targetCount} found
          </p>
        </div>

        {/* Shape Grid */}
        <div 
          className={`grid gap-3 p-4 rounded-3xl bg-card/50 shadow-soft opacity-0 animate-fade-in-scale`}
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            animationDelay: "0.2s", 
            animationFillMode: "forwards" 
          }}
        >
          {currentChallenge.shapes.map((shape) => (
            <ShapeComponent
              key={shape.id}
              shape={shape}
              onTap={handleTap}
              shakeId={shakeId}
              glowId={glowId}
            />
          ))}
        </div>

        {/* Encouragement */}
        <p className="text-xs text-muted-foreground/60 mt-6 text-center max-w-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          Take your time. There's no rush—just gentle focus.
        </p>
      </div>
    </ActivityLayout>
  );
};

export default AttentionSwitch;
