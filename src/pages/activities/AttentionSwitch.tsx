import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";
import { Progress } from "@/components/ui/progress";

type Difficulty = "easy" | "medium" | "hard";

interface Challenge {
  id: number;
  instruction: string;
  targetDescription: string;
  shapes: ShapeItem[];
  targetCount: number;
  timeLimit: number;
}

interface ShapeItem {
  id: number;
  type: "circle" | "square" | "triangle";
  color: "blue" | "mint" | "lavender" | "peach" | "rose";
  size: "small" | "medium" | "large";
  isTarget: boolean;
  found: boolean;
}

interface ChallengeTemplate {
  instruction: string;
  targetDescription: string;
  targetType?: "circle" | "square" | "triangle";
  targetColor: "blue" | "mint" | "lavender" | "peach" | "rose";
  targetSize?: "small" | "medium" | "large";
}

const difficultySettings: Record<Difficulty, { label: string; rounds: number; description: string; bgClass: string; emoji: string; timeLimit: number }> = {
  easy: { label: "Gentle", rounds: 10, description: "A calm start", bgClass: "bg-calm-mint/30", emoji: "🌿", timeLimit: 20 },
  medium: { label: "Balanced", rounds: 10, description: "A steady pace", bgClass: "bg-calm-blue/30", emoji: "🌊", timeLimit: 10 },
  hard: { label: "Focused", rounds: 10, description: "Stay present", bgClass: "bg-calm-lavender/30", emoji: "✨", timeLimit: 7 },
};

const timeoutMessages = [
  "No worries, let's try the next one 💙",
  "Take a breath, you've got this ✨",
  "It's okay, every attempt counts 🌿",
  "Let's move forward gently 🌊",
  "No pressure, try again with the next 💫",
];

const allTemplates: Record<Difficulty, ChallengeTemplate[]> = {
  easy: [
    { instruction: "Tap only the blue circles", targetDescription: "blue circles", targetType: "circle", targetColor: "blue" },
    { instruction: "Find the lavender squares", targetDescription: "lavender squares", targetType: "square", targetColor: "lavender" },
    { instruction: "Tap the mint circles", targetDescription: "mint circles", targetType: "circle", targetColor: "mint" },
    { instruction: "Find all peach squares", targetDescription: "peach squares", targetType: "square", targetColor: "peach" },
    { instruction: "Tap the rose circles", targetDescription: "rose circles", targetType: "circle", targetColor: "rose" },
    { instruction: "Find the blue squares", targetDescription: "blue squares", targetType: "square", targetColor: "blue" },
    { instruction: "Tap lavender squares", targetDescription: "lavender squares", targetType: "square", targetColor: "lavender" },
    { instruction: "Find mint circles", targetDescription: "mint circles", targetType: "circle", targetColor: "mint" },
    { instruction: "Tap peach circles", targetDescription: "peach circles", targetType: "circle", targetColor: "peach" },
    { instruction: "Find rose squares", targetDescription: "rose squares", targetType: "square", targetColor: "rose" },
  ],
  medium: [
    { instruction: "Tap the mint triangles", targetDescription: "mint triangles", targetType: "triangle", targetColor: "mint" },
    { instruction: "Find all the peach circles", targetDescription: "peach circles", targetType: "circle", targetColor: "peach" },
    { instruction: "Tap the blue squares only", targetDescription: "blue squares", targetType: "square", targetColor: "blue" },
    { instruction: "Find lavender triangles", targetDescription: "lavender triangles", targetType: "triangle", targetColor: "lavender" },
    { instruction: "Tap all rose squares", targetDescription: "rose squares", targetType: "square", targetColor: "rose" },
    { instruction: "Find blue triangles", targetDescription: "blue triangles", targetType: "triangle", targetColor: "blue" },
    { instruction: "Tap peach triangles", targetDescription: "peach triangles", targetType: "triangle", targetColor: "peach" },
    { instruction: "Find rose circles", targetDescription: "rose circles", targetType: "circle", targetColor: "rose" },
    { instruction: "Tap mint squares", targetDescription: "mint squares", targetType: "square", targetColor: "mint" },
    { instruction: "Find lavender circles", targetDescription: "lavender circles", targetType: "circle", targetColor: "lavender" },
  ],
  hard: [
    { instruction: "Find the large blue shapes", targetDescription: "large blue shapes", targetColor: "blue", targetSize: "large" },
    { instruction: "Tap all small lavender shapes", targetDescription: "small lavender shapes", targetColor: "lavender", targetSize: "small" },
    { instruction: "Find large mint shapes", targetDescription: "large mint shapes", targetColor: "mint", targetSize: "large" },
    { instruction: "Tap small peach shapes", targetDescription: "small peach shapes", targetColor: "peach", targetSize: "small" },
    { instruction: "Find large rose shapes", targetDescription: "large rose shapes", targetColor: "rose", targetSize: "large" },
    { instruction: "Tap medium blue shapes", targetDescription: "medium blue shapes", targetColor: "blue", targetSize: "medium" },
    { instruction: "Find small mint shapes", targetDescription: "small mint shapes", targetColor: "mint", targetSize: "small" },
    { instruction: "Tap large lavender shapes", targetDescription: "large lavender shapes", targetColor: "lavender", targetSize: "large" },
    { instruction: "Find medium peach shapes", targetDescription: "medium peach shapes", targetColor: "peach", targetSize: "medium" },
    { instruction: "Tap small rose shapes", targetDescription: "small rose shapes", targetColor: "rose", targetSize: "small" },
  ],
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateSingleChallenge = (template: ChallengeTemplate, difficulty: Difficulty, id: number): Challenge => {
  const shapes: ShapeItem["type"][] = ["circle", "square", "triangle"];
  const colors: ShapeItem["color"][] = ["blue", "mint", "lavender", "peach", "rose"];
  const sizes: ShapeItem["size"][] = ["small", "medium", "large"];
  
  const shapeItems: ShapeItem[] = [];
  const gridSize = difficulty === "easy" ? 6 : 9;
  const targetCount = difficulty === "easy" ? 2 : 3;
  const timeLimit = difficultySettings[difficulty].timeLimit;
  
  // Generate target shapes
  for (let j = 0; j < targetCount; j++) {
    const targetShape: ShapeItem = {
      id: j,
      type: template.targetType || shapes[Math.floor(Math.random() * shapes.length)],
      color: template.targetColor,
      size: template.targetSize || sizes[Math.floor(Math.random() * sizes.length)],
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
      (template.targetType && nonTargetType === template.targetType && nonTargetColor === template.targetColor) ||
      (template.targetSize && nonTargetColor === template.targetColor && nonTargetSize === template.targetSize)
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
  const shuffledShapes = shuffleArray(shapeItems);
  shuffledShapes.forEach((s, idx) => (s.id = idx));
  
  return {
    id,
    instruction: template.instruction,
    targetDescription: template.targetDescription,
    shapes: shuffledShapes,
    targetCount,
    timeLimit,
  };
};

// Generate all 10 unique challenges upfront with shuffled templates
const generateAllChallenges = (difficulty: Difficulty): Challenge[] => {
  const templates = shuffleArray([...allTemplates[difficulty]]);
  return templates.map((template, index) => generateSingleChallenge(template, difficulty, index));
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
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
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
    ${shape.found ? "opacity-50 scale-90 pointer-events-none" : "hover:scale-110 active:scale-95"}
    ${shakeId === shape.id ? "animate-shake" : ""}
    ${glowId === shape.id ? "ring-4 ring-calm-mint/70 scale-110" : ""}
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
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [glowId, setGlowId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeoutMessage, setTimeoutMessage] = useState("");

  const totalRounds = difficulty ? difficultySettings[difficulty].rounds : 10;
  const currentChallenge = challenges[currentChallengeIndex] || null;

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timerActive && timeLeft === 0 && currentChallenge) {
      // Time ran out
      setTimerActive(false);
      setTimeoutMessage(timeoutMessages[Math.floor(Math.random() * timeoutMessages.length)]);
      setShowTimeout(true);
    }
  }, [timerActive, timeLeft, currentChallenge]);

  const startWithDifficulty = (diff: Difficulty) => {
    const allChallenges = generateAllChallenges(diff);
    setDifficulty(diff);
    setChallenges(allChallenges);
    setCurrentChallengeIndex(0);
    setTimeLeft(difficultySettings[diff].timeLimit);
    setTimerActive(true);
  };

  const retryCurrentChallenge = useCallback(() => {
    if (!difficulty) return;
    
    setShowTimeout(false);
    
    // Reset the current challenge shapes
    setChallenges((prev) => {
      const updated = [...prev];
      const challenge = { ...updated[currentChallengeIndex] };
      challenge.shapes = challenge.shapes.map((s) => ({ ...s, found: false }));
      updated[currentChallengeIndex] = challenge;
      return updated;
    });
    
    setTimeLeft(difficultySettings[difficulty].timeLimit);
    setTimerActive(true);
  }, [difficulty, currentChallengeIndex]);

  const moveToNextChallenge = useCallback(() => {
    if (!difficulty) return;
    
    setShowTimeout(false);
    
    if (currentChallengeIndex < totalRounds - 1) {
      const nextIndex = currentChallengeIndex + 1;
      setCurrentChallengeIndex(nextIndex);
      setTimeLeft(difficultySettings[difficulty].timeLimit);
      setTimerActive(true);
    } else {
      setCompleted(true);
    }
  }, [difficulty, currentChallengeIndex, totalRounds]);

  const handleTap = useCallback((tappedShape: ShapeItem) => {
    if (!currentChallenge || showTimeout) return;
    
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
            moveToNextChallenge();
          }, 600);
        }
        
        return updated;
      });
    } else {
      // Incorrect - gentle shake
      setShakeId(tappedShape.id);
      setTimeout(() => setShakeId(null), 400);
    }
  }, [currentChallenge, showTimeout, moveToNextChallenge]);

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
                  w-full p-5 rounded-2xl ${difficultySettings[diff].bgClass} shadow-soft
                  flex items-center gap-4
                  tap-feedback hover:shadow-soft-lg hover:scale-[1.02]
                  transition-all duration-300
                  opacity-0 animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                <span className="text-2xl">{difficultySettings[diff].emoji}</span>
                <div className="text-left flex-1">
                  <h3 className="font-medium text-foreground">{difficultySettings[diff].label}</h3>
                  <p className="text-sm text-muted-foreground">{difficultySettings[diff].description}</p>
                </div>
                <div className="text-xs text-muted-foreground/60 text-right">
                  <div>{difficultySettings[diff].rounds} questions</div>
                  <div>{difficultySettings[diff].timeLimit}s/question</div>
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
  const progressPercent = ((currentChallengeIndex + 1) / totalRounds) * 100;

  return (
    <ActivityLayout
      title="Attention Switch"
      subtitle={`${difficultySettings[difficulty].label} · Round ${currentChallengeIndex + 1}/${totalRounds}`}
      bgColorClass="bg-background"
    >
      <div className="flex flex-col items-center pt-4">
        {/* Progress Bar */}
        <div className="w-full max-w-xs mb-4 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <Progress value={progressPercent} className="h-2 bg-muted" />
        </div>

        {/* Timer */}
        <div className="mb-4 flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <div className={`
            px-4 py-2 rounded-full bg-card shadow-soft
            ${timeLeft <= 5 ? "text-calm-rose" : "text-foreground"}
            transition-colors duration-300
          `}>
            <span className="text-lg font-medium tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        {/* Timeout Overlay */}
        {showTimeout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center p-8 max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-calm-lavender/30 mb-6">
                <span className="text-3xl">💙</span>
              </div>
              <p className="text-lg font-medium text-foreground mb-6">
                {timeoutMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={retryCurrentChallenge}
                  className="w-full px-6 py-3 rounded-2xl bg-calm-blue/30 text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all"
                >
                  Retry this question
                </button>
                <button
                  onClick={moveToNextChallenge}
                  className="w-full px-6 py-3 rounded-2xl bg-calm-mint/30 text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all"
                >
                  {currentChallengeIndex < totalRounds - 1 ? "Move to next" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        )}

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
