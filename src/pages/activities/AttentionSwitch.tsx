import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";
import { Progress } from "@/components/ui/progress";

type Difficulty = "easy" | "medium" | "hard";

// Unified item that can represent shapes, math problems, words, or counting boxes
interface ChallengeItem {
  id: number;
  isTarget: boolean;
  found: boolean;
  // For shapes
  shapeType?: "circle" | "square" | "triangle";
  color?: "blue" | "mint" | "lavender" | "peach" | "rose";
  size?: "small" | "medium" | "large";
  // For math
  question?: string;
  answer?: number;
  // For words
  word?: string;
  // For counting
  emoji?: string;
  count?: number;
}

interface Challenge {
  id: number;
  type: "shape" | "math" | "word" | "counting";
  instruction: string;
  targetDescription: string;
  items: ChallengeItem[];
  targetCount: number;
  timeLimit: number;
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

// Challenge type definitions
type ChallengeType = "shape" | "math" | "word" | "counting";

interface ShapeChallenge {
  type: "shape";
  instruction: string;
  targetDescription: string;
  targetType?: "circle" | "square" | "triangle";
  targetColor: "blue" | "mint" | "lavender" | "peach" | "rose";
  targetSize?: "small" | "medium" | "large";
}

interface MathChallenge {
  type: "math";
  instruction: string;
  targetDescription: string;
  problems: { question: string; answer: number; isTarget: boolean }[];
}

interface WordChallenge {
  type: "word";
  instruction: string;
  targetDescription: string;
  words: { text: string; isTarget: boolean }[];
}

interface CountingChallenge {
  type: "counting";
  instruction: string;
  targetDescription: string;
  items: { emoji: string; count: number; isTarget: boolean }[];
}

type ChallengeTemplate = ShapeChallenge | MathChallenge | WordChallenge | CountingChallenge;

const allTemplates: Record<Difficulty, ChallengeTemplate[]> = {
  easy: [
    // Shape challenges
    { type: "shape", instruction: "Tap only the blue circles", targetDescription: "blue circles", targetType: "circle", targetColor: "blue" },
    { type: "shape", instruction: "Find the lavender squares", targetDescription: "lavender squares", targetType: "square", targetColor: "lavender" },
    { type: "shape", instruction: "Tap the mint circles", targetDescription: "mint circles", targetType: "circle", targetColor: "mint" },
    // Math challenges - gentle grounding
    { type: "math", instruction: "Tap the answers that equal 5", targetDescription: "answers equal to 5", problems: [
      { question: "2 + 3", answer: 5, isTarget: true },
      { question: "4 + 1", answer: 5, isTarget: true },
      { question: "3 + 1", answer: 4, isTarget: false },
      { question: "2 + 2", answer: 4, isTarget: false },
      { question: "1 + 3", answer: 4, isTarget: false },
      { question: "3 + 2", answer: 5, isTarget: true },
    ]},
    // Word challenges - calming focus
    { type: "word", instruction: "Tap words that describe calm", targetDescription: "calm words", words: [
      { text: "peaceful", isTarget: true },
      { text: "rushing", isTarget: false },
      { text: "gentle", isTarget: true },
      { text: "hurried", isTarget: false },
      { text: "serene", isTarget: true },
      { text: "busy", isTarget: false },
    ]},
    // Counting challenges
    { type: "counting", instruction: "Tap boxes with exactly 3 items", targetDescription: "boxes with 3 items", items: [
      { emoji: "🌸", count: 3, isTarget: true },
      { emoji: "🌿", count: 2, isTarget: false },
      { emoji: "💙", count: 3, isTarget: true },
      { emoji: "✨", count: 4, isTarget: false },
      { emoji: "🌊", count: 1, isTarget: false },
      { emoji: "🍃", count: 3, isTarget: true },
    ]},
    { type: "shape", instruction: "Find all peach squares", targetDescription: "peach squares", targetType: "square", targetColor: "peach" },
    { type: "math", instruction: "Tap the answers that equal 7", targetDescription: "answers equal to 7", problems: [
      { question: "4 + 3", answer: 7, isTarget: true },
      { question: "5 + 2", answer: 7, isTarget: true },
      { question: "3 + 3", answer: 6, isTarget: false },
      { question: "2 + 4", answer: 6, isTarget: false },
      { question: "6 + 1", answer: 7, isTarget: true },
      { question: "4 + 4", answer: 8, isTarget: false },
    ]},
    { type: "word", instruction: "Tap nature words", targetDescription: "nature words", words: [
      { text: "ocean", isTarget: true },
      { text: "phone", isTarget: false },
      { text: "forest", isTarget: true },
      { text: "screen", isTarget: false },
      { text: "meadow", isTarget: true },
      { text: "email", isTarget: false },
    ]},
    { type: "shape", instruction: "Tap the rose circles", targetDescription: "rose circles", targetType: "circle", targetColor: "rose" },
    { type: "counting", instruction: "Tap boxes with exactly 2 items", targetDescription: "boxes with 2 items", items: [
      { emoji: "💫", count: 2, isTarget: true },
      { emoji: "🌺", count: 3, isTarget: false },
      { emoji: "🌿", count: 2, isTarget: true },
      { emoji: "✨", count: 1, isTarget: false },
      { emoji: "💙", count: 4, isTarget: false },
      { emoji: "🌸", count: 2, isTarget: true },
    ]},
    { type: "word", instruction: "Tap self-care words", targetDescription: "self-care words", words: [
      { text: "rest", isTarget: true },
      { text: "rush", isTarget: false },
      { text: "breathe", isTarget: true },
      { text: "worry", isTarget: false },
      { text: "relax", isTarget: true },
      { text: "hurry", isTarget: false },
    ]},
  ],
  medium: [
    { type: "shape", instruction: "Tap the mint triangles", targetDescription: "mint triangles", targetType: "triangle", targetColor: "mint" },
    { type: "math", instruction: "Tap answers greater than 10", targetDescription: "answers > 10", problems: [
      { question: "6 + 5", answer: 11, isTarget: true },
      { question: "4 + 4", answer: 8, isTarget: false },
      { question: "7 + 5", answer: 12, isTarget: true },
      { question: "3 + 6", answer: 9, isTarget: false },
      { question: "8 + 3", answer: 11, isTarget: true },
      { question: "5 + 4", answer: 9, isTarget: false },
      { question: "6 + 6", answer: 12, isTarget: true },
      { question: "7 + 2", answer: 9, isTarget: false },
      { question: "9 + 2", answer: 11, isTarget: true },
    ]},
    { type: "word", instruction: "Tap words with double letters", targetDescription: "words with double letters", words: [
      { text: "balloon", isTarget: true },
      { text: "gentle", isTarget: false },
      { text: "breeze", isTarget: true },
      { text: "calm", isTarget: false },
      { text: "coffee", isTarget: true },
      { text: "peace", isTarget: false },
      { text: "stillness", isTarget: true },
      { text: "mind", isTarget: false },
      { text: "pebble", isTarget: true },
    ]},
    { type: "counting", instruction: "Tap boxes with an even count", targetDescription: "even counts", items: [
      { emoji: "🌺", count: 2, isTarget: true },
      { emoji: "🌿", count: 3, isTarget: false },
      { emoji: "💫", count: 4, isTarget: true },
      { emoji: "🌸", count: 1, isTarget: false },
      { emoji: "🌊", count: 6, isTarget: true },
      { emoji: "✨", count: 5, isTarget: false },
      { emoji: "💙", count: 2, isTarget: true },
      { emoji: "🌻", count: 3, isTarget: false },
      { emoji: "🍃", count: 4, isTarget: true },
    ]},
    { type: "shape", instruction: "Find all the peach circles", targetDescription: "peach circles", targetType: "circle", targetColor: "peach" },
    { type: "math", instruction: "Tap answers less than 8", targetDescription: "answers < 8", problems: [
      { question: "3 + 2", answer: 5, isTarget: true },
      { question: "5 + 4", answer: 9, isTarget: false },
      { question: "2 + 4", answer: 6, isTarget: true },
      { question: "6 + 5", answer: 11, isTarget: false },
      { question: "4 + 3", answer: 7, isTarget: true },
      { question: "7 + 3", answer: 10, isTarget: false },
      { question: "1 + 5", answer: 6, isTarget: true },
      { question: "8 + 2", answer: 10, isTarget: false },
      { question: "2 + 2", answer: 4, isTarget: true },
    ]},
    { type: "shape", instruction: "Tap the blue squares only", targetDescription: "blue squares", targetType: "square", targetColor: "blue" },
    { type: "word", instruction: "Tap positive feeling words", targetDescription: "positive feelings", words: [
      { text: "hopeful", isTarget: true },
      { text: "worried", isTarget: false },
      { text: "content", isTarget: true },
      { text: "anxious", isTarget: false },
      { text: "grateful", isTarget: true },
      { text: "stressed", isTarget: false },
      { text: "joyful", isTarget: true },
      { text: "restless", isTarget: false },
      { text: "peaceful", isTarget: true },
    ]},
    { type: "shape", instruction: "Find lavender triangles", targetDescription: "lavender triangles", targetType: "triangle", targetColor: "lavender" },
    { type: "counting", instruction: "Tap boxes with exactly 4 items", targetDescription: "boxes with 4 items", items: [
      { emoji: "🌸", count: 4, isTarget: true },
      { emoji: "🌿", count: 2, isTarget: false },
      { emoji: "💙", count: 4, isTarget: true },
      { emoji: "✨", count: 3, isTarget: false },
      { emoji: "🌊", count: 5, isTarget: false },
      { emoji: "🍃", count: 4, isTarget: true },
      { emoji: "🌺", count: 1, isTarget: false },
      { emoji: "💫", count: 6, isTarget: false },
      { emoji: "🌻", count: 4, isTarget: true },
    ]},
  ],
  hard: [
    { type: "shape", instruction: "Find the large blue shapes", targetDescription: "large blue shapes", targetColor: "blue", targetSize: "large" },
    { type: "math", instruction: "Tap answers that are odd numbers", targetDescription: "odd answers", problems: [
      { question: "4 + 3", answer: 7, isTarget: true },
      { question: "5 + 5", answer: 10, isTarget: false },
      { question: "6 + 3", answer: 9, isTarget: true },
      { question: "4 + 4", answer: 8, isTarget: false },
      { question: "8 + 3", answer: 11, isTarget: true },
      { question: "6 + 6", answer: 12, isTarget: false },
      { question: "7 + 6", answer: 13, isTarget: true },
      { question: "9 + 3", answer: 12, isTarget: false },
      { question: "5 + 4", answer: 9, isTarget: true },
    ]},
    { type: "word", instruction: "Tap words that start with 'S'", targetDescription: "words starting with S", words: [
      { text: "serenity", isTarget: true },
      { text: "peace", isTarget: false },
      { text: "stillness", isTarget: true },
      { text: "calm", isTarget: false },
      { text: "soft", isTarget: true },
      { text: "gentle", isTarget: false },
      { text: "soothe", isTarget: true },
      { text: "quiet", isTarget: false },
      { text: "safe", isTarget: true },
    ]},
    { type: "counting", instruction: "Tap boxes with odd counts", targetDescription: "odd counts", items: [
      { emoji: "🌺", count: 3, isTarget: true },
      { emoji: "🌿", count: 2, isTarget: false },
      { emoji: "💫", count: 5, isTarget: true },
      { emoji: "🌸", count: 4, isTarget: false },
      { emoji: "🌊", count: 1, isTarget: true },
      { emoji: "✨", count: 6, isTarget: false },
      { emoji: "💙", count: 3, isTarget: true },
      { emoji: "🌻", count: 2, isTarget: false },
      { emoji: "🍃", count: 5, isTarget: true },
    ]},
    { type: "shape", instruction: "Tap all small lavender shapes", targetDescription: "small lavender shapes", targetColor: "lavender", targetSize: "small" },
    { type: "math", instruction: "Tap answers divisible by 3", targetDescription: "divisible by 3", problems: [
      { question: "5 + 4", answer: 9, isTarget: true },
      { question: "4 + 3", answer: 7, isTarget: false },
      { question: "7 + 5", answer: 12, isTarget: true },
      { question: "5 + 5", answer: 10, isTarget: false },
      { question: "4 + 2", answer: 6, isTarget: true },
      { question: "6 + 5", answer: 11, isTarget: false },
      { question: "8 + 7", answer: 15, isTarget: true },
      { question: "9 + 4", answer: 13, isTarget: false },
      { question: "6 + 3", answer: 9, isTarget: true },
    ]},
    { type: "word", instruction: "Tap 5-letter words", targetDescription: "5-letter words", words: [
      { text: "peace", isTarget: true },
      { text: "serenity", isTarget: false },
      { text: "quiet", isTarget: true },
      { text: "stillness", isTarget: false },
      { text: "relax", isTarget: true },
      { text: "tranquility", isTarget: false },
      { text: "still", isTarget: true },
      { text: "peaceful", isTarget: false },
      { text: "focus", isTarget: true },
    ]},
    { type: "shape", instruction: "Find large mint shapes", targetDescription: "large mint shapes", targetColor: "mint", targetSize: "large" },
    { type: "counting", instruction: "Tap boxes where count equals 2", targetDescription: "exactly 2 items", items: [
      { emoji: "🌺", count: 2, isTarget: true },
      { emoji: "🌿", count: 3, isTarget: false },
      { emoji: "💫", count: 1, isTarget: false },
      { emoji: "🌸", count: 2, isTarget: true },
      { emoji: "🌊", count: 4, isTarget: false },
      { emoji: "✨", count: 5, isTarget: false },
      { emoji: "💙", count: 2, isTarget: true },
      { emoji: "🌻", count: 3, isTarget: false },
      { emoji: "🍃", count: 2, isTarget: true },
    ]},
    { type: "shape", instruction: "Tap small rose shapes", targetDescription: "small rose shapes", targetColor: "rose", targetSize: "small" },
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

const generateShapeChallenge = (template: ShapeChallenge, difficulty: Difficulty, id: number): Challenge => {
  const shapes: ChallengeItem["shapeType"][] = ["circle", "square", "triangle"];
  const colors: ChallengeItem["color"][] = ["blue", "mint", "lavender", "peach", "rose"];
  const sizes: ChallengeItem["size"][] = ["small", "medium", "large"];
  
  const items: ChallengeItem[] = [];
  const gridSize = difficulty === "easy" ? 6 : 9;
  const targetCount = difficulty === "easy" ? 2 : 3;
  const timeLimit = difficultySettings[difficulty].timeLimit;
  
  // Generate target shapes
  for (let j = 0; j < targetCount; j++) {
    items.push({
      id: j,
      shapeType: template.targetType || shapes[Math.floor(Math.random() * shapes.length)],
      color: template.targetColor,
      size: template.targetSize || sizes[Math.floor(Math.random() * sizes.length)],
      isTarget: true,
      found: false,
    });
  }
  
  // Generate non-target shapes
  for (let j = targetCount; j < gridSize; j++) {
    let type: ChallengeItem["shapeType"];
    let color: ChallengeItem["color"];
    let size: ChallengeItem["size"];
    
    do {
      type = shapes[Math.floor(Math.random() * shapes.length)];
      color = colors[Math.floor(Math.random() * colors.length)];
      size = sizes[Math.floor(Math.random() * sizes.length)];
    } while (
      (template.targetType && type === template.targetType && color === template.targetColor) ||
      (template.targetSize && color === template.targetColor && size === template.targetSize)
    );
    
    items.push({ id: j, shapeType: type, color, size, isTarget: false, found: false });
  }
  
  const shuffled = shuffleArray(items);
  shuffled.forEach((s, idx) => (s.id = idx));
  
  return { id, type: "shape", instruction: template.instruction, targetDescription: template.targetDescription, items: shuffled, targetCount, timeLimit };
};

const generateMathChallenge = (template: MathChallenge, difficulty: Difficulty, id: number): Challenge => {
  const timeLimit = difficultySettings[difficulty].timeLimit;
  const shuffled = shuffleArray(template.problems);
  const items: ChallengeItem[] = shuffled.map((p, idx) => ({
    id: idx,
    question: p.question,
    answer: p.answer,
    isTarget: p.isTarget,
    found: false,
  }));
  const targetCount = items.filter(i => i.isTarget).length;
  return { id, type: "math", instruction: template.instruction, targetDescription: template.targetDescription, items, targetCount, timeLimit };
};

const generateWordChallenge = (template: WordChallenge, difficulty: Difficulty, id: number): Challenge => {
  const timeLimit = difficultySettings[difficulty].timeLimit;
  const shuffled = shuffleArray(template.words);
  const items: ChallengeItem[] = shuffled.map((w, idx) => ({
    id: idx,
    word: w.text,
    isTarget: w.isTarget,
    found: false,
  }));
  const targetCount = items.filter(i => i.isTarget).length;
  return { id, type: "word", instruction: template.instruction, targetDescription: template.targetDescription, items, targetCount, timeLimit };
};

const generateCountingChallenge = (template: CountingChallenge, difficulty: Difficulty, id: number): Challenge => {
  const timeLimit = difficultySettings[difficulty].timeLimit;
  const shuffled = shuffleArray(template.items);
  const items: ChallengeItem[] = shuffled.map((c, idx) => ({
    id: idx,
    emoji: c.emoji,
    count: c.count,
    isTarget: c.isTarget,
    found: false,
  }));
  const targetCount = items.filter(i => i.isTarget).length;
  return { id, type: "counting", instruction: template.instruction, targetDescription: template.targetDescription, items, targetCount, timeLimit };
};

const generateSingleChallenge = (template: ChallengeTemplate, difficulty: Difficulty, id: number): Challenge => {
  switch (template.type) {
    case "shape": return generateShapeChallenge(template, difficulty, id);
    case "math": return generateMathChallenge(template, difficulty, id);
    case "word": return generateWordChallenge(template, difficulty, id);
    case "counting": return generateCountingChallenge(template, difficulty, id);
  }
};

const generateAllChallenges = (difficulty: Difficulty): Challenge[] => {
  const templates = shuffleArray([...allTemplates[difficulty]]);
  return templates.slice(0, 10).map((template, index) => generateSingleChallenge(template, difficulty, index));
};

// Item Components
const ShapeItemComponent = ({ item, onTap, shakeId, glowId }: { item: ChallengeItem; onTap: (item: ChallengeItem) => void; shakeId: number | null; glowId: number | null }) => {
  const sizeClasses = { small: "w-8 h-8", medium: "w-12 h-12", large: "w-16 h-16" };
  const colorClasses: Record<string, string> = {
    blue: "bg-calm-blue", mint: "bg-calm-mint", lavender: "bg-calm-lavender", peach: "bg-calm-peach", rose: "bg-calm-rose",
  };
  
  const baseClasses = `
    w-20 h-20 flex items-center justify-center tap-feedback cursor-pointer transition-all duration-300 ease-out
    ${item.found ? "opacity-50 scale-90 pointer-events-none" : "hover:scale-110 active:scale-95"}
    ${shakeId === item.id ? "animate-shake" : ""}
    ${glowId === item.id ? "ring-4 ring-calm-mint/70 scale-110" : ""}
  `;

  const renderShape = () => {
    const size = sizeClasses[item.size || "medium"];
    const color = colorClasses[item.color || "blue"];
    
    switch (item.shapeType) {
      case "circle": return <div className={`${size} rounded-full ${color} shadow-soft`} />;
      case "square": return <div className={`${size} rounded-xl ${color} shadow-soft`} />;
      case "triangle":
        const triangleSize = item.size === "small" ? 20 : item.size === "large" ? 36 : 28;
        return (
          <div className="w-0 h-0" style={{
            borderLeft: `${triangleSize}px solid transparent`,
            borderRight: `${triangleSize}px solid transparent`,
            borderBottom: `${triangleSize * 1.7}px solid hsl(var(--calm-${item.color}))`,
          }} />
        );
      default: return <div className={`${size} rounded-full ${color} shadow-soft`} />;
    }
  };

  return (
    <button onClick={() => !item.found && onTap(item)} className={baseClasses} disabled={item.found} aria-label={`${item.color} ${item.size} ${item.shapeType}`}>
      {renderShape()}
    </button>
  );
};

const MathItemComponent = ({ item, onTap, shakeId, glowId }: { item: ChallengeItem; onTap: (item: ChallengeItem) => void; shakeId: number | null; glowId: number | null }) => {
  const baseClasses = `
    w-20 h-20 flex items-center justify-center rounded-2xl bg-calm-blue/40 shadow-soft
    tap-feedback cursor-pointer transition-all duration-300 ease-out
    ${item.found ? "opacity-50 scale-90 pointer-events-none bg-calm-mint/50" : "hover:scale-105 active:scale-95"}
    ${shakeId === item.id ? "animate-shake" : ""}
    ${glowId === item.id ? "ring-4 ring-calm-mint/70 scale-110" : ""}
  `;

  return (
    <button onClick={() => !item.found && onTap(item)} className={baseClasses} disabled={item.found} aria-label={item.question}>
      <span className="text-sm font-medium text-foreground">{item.question}</span>
    </button>
  );
};

const WordItemComponent = ({ item, onTap, shakeId, glowId }: { item: ChallengeItem; onTap: (item: ChallengeItem) => void; shakeId: number | null; glowId: number | null }) => {
  const baseClasses = `
    w-24 h-14 flex items-center justify-center rounded-2xl bg-calm-lavender/40 shadow-soft
    tap-feedback cursor-pointer transition-all duration-300 ease-out
    ${item.found ? "opacity-50 scale-90 pointer-events-none bg-calm-mint/50" : "hover:scale-105 active:scale-95"}
    ${shakeId === item.id ? "animate-shake" : ""}
    ${glowId === item.id ? "ring-4 ring-calm-mint/70 scale-110" : ""}
  `;

  return (
    <button onClick={() => !item.found && onTap(item)} className={baseClasses} disabled={item.found} aria-label={item.word}>
      <span className="text-sm font-medium text-foreground">{item.word}</span>
    </button>
  );
};

const CountingItemComponent = ({ item, onTap, shakeId, glowId }: { item: ChallengeItem; onTap: (item: ChallengeItem) => void; shakeId: number | null; glowId: number | null }) => {
  const baseClasses = `
    w-20 h-20 flex flex-wrap items-center justify-center gap-0.5 p-2 rounded-2xl bg-calm-peach/40 shadow-soft
    tap-feedback cursor-pointer transition-all duration-300 ease-out
    ${item.found ? "opacity-50 scale-90 pointer-events-none bg-calm-mint/50" : "hover:scale-105 active:scale-95"}
    ${shakeId === item.id ? "animate-shake" : ""}
    ${glowId === item.id ? "ring-4 ring-calm-mint/70 scale-110" : ""}
  `;

  return (
    <button onClick={() => !item.found && onTap(item)} className={baseClasses} disabled={item.found} aria-label={`${item.count} ${item.emoji}`}>
      {Array.from({ length: item.count || 0 }).map((_, i) => (
        <span key={i} className="text-base">{item.emoji}</span>
      ))}
    </button>
  );
};

const ChallengeItemComponent = ({ item, type, onTap, shakeId, glowId }: { item: ChallengeItem; type: ChallengeType; onTap: (item: ChallengeItem) => void; shakeId: number | null; glowId: number | null }) => {
  switch (type) {
    case "shape": return <ShapeItemComponent item={item} onTap={onTap} shakeId={shakeId} glowId={glowId} />;
    case "math": return <MathItemComponent item={item} onTap={onTap} shakeId={shakeId} glowId={glowId} />;
    case "word": return <WordItemComponent item={item} onTap={onTap} shakeId={shakeId} glowId={glowId} />;
    case "counting": return <CountingItemComponent item={item} onTap={onTap} shakeId={shakeId} glowId={glowId} />;
  }
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

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timerActive && timeLeft === 0 && currentChallenge) {
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
    setChallenges((prev) => {
      const updated = [...prev];
      const challenge = { ...updated[currentChallengeIndex] };
      challenge.items = challenge.items.map((s) => ({ ...s, found: false }));
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

  const handleTap = useCallback((tappedItem: ChallengeItem) => {
    if (!currentChallenge || showTimeout) return;
    
    if (tappedItem.isTarget) {
      setGlowId(tappedItem.id);
      setTimeout(() => setGlowId(null), 400);
      
      setChallenges((prev) => {
        const updated = [...prev];
        const challenge = { ...updated[currentChallengeIndex] };
        challenge.items = challenge.items.map((s) => s.id === tappedItem.id ? { ...s, found: true } : s);
        updated[currentChallengeIndex] = challenge;
        
        const allFound = challenge.items.filter((s) => s.isTarget).every((s) => s.found);
        if (allFound) {
          setTimerActive(false);
          setTimeout(() => moveToNextChallenge(), 600);
        }
        return updated;
      });
    } else {
      setShakeId(tappedItem.id);
      setTimeout(() => setShakeId(null), 400);
    }
  }, [currentChallenge, showTimeout, currentChallengeIndex, moveToNextChallenge]);

  if (completed) {
    return (
      <CompletionScreen
        title="Focus restored"
        message="You directed your attention with intention. Your mind feels clearer now."
      />
    );
  }

  if (!difficulty) {
    return (
      <ActivityLayout title="Attention Switch" subtitle="Choose your pace" bgColorClass="bg-background">
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
                  flex items-center gap-4 tap-feedback hover:shadow-soft-lg hover:scale-[1.02]
                  transition-all duration-300 opacity-0 animate-fade-in-up
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

  const foundCount = currentChallenge.items.filter((s) => s.isTarget && s.found).length;
  const gridCols = currentChallenge.type === "word" ? 2 : 3;
  const progressPercent = ((currentChallengeIndex + 1) / totalRounds) * 100;

  return (
    <ActivityLayout
      title="Attention Switch"
      subtitle={`${difficultySettings[difficulty].label} · Round ${currentChallengeIndex + 1}/${totalRounds}`}
      bgColorClass="bg-background"
    >
      <div className="flex flex-col items-center pt-4">
        <div className="w-full max-w-xs mb-4 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <Progress value={progressPercent} className="h-2 bg-muted" />
        </div>

        <div className="mb-4 flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <div className={`px-4 py-2 rounded-full bg-card shadow-soft ${timeLeft <= 5 ? "text-calm-rose" : "text-foreground"} transition-colors duration-300`}>
            <span className="text-lg font-medium tabular-nums">{timeLeft}s</span>
          </div>
        </div>

        {showTimeout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center p-8 max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-calm-lavender/30 mb-6">
                <span className="text-3xl">💙</span>
              </div>
              <p className="text-lg font-medium text-foreground mb-6">{timeoutMessage}</p>
              <div className="space-y-3">
                <button onClick={retryCurrentChallenge} className="w-full px-6 py-3 rounded-2xl bg-calm-blue/30 text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all">
                  Retry this question
                </button>
                <button onClick={moveToNextChallenge} className="w-full px-6 py-3 rounded-2xl bg-calm-mint/30 text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all">
                  {currentChallengeIndex < totalRounds - 1 ? "Move to next" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <p className="text-lg font-medium text-foreground mb-2">{currentChallenge.instruction}</p>
          <p className="text-sm text-muted-foreground">{foundCount} of {currentChallenge.targetCount} found</p>
        </div>

        <div 
          className="grid gap-3 p-4 rounded-3xl bg-card/50 shadow-soft opacity-0 animate-fade-in-scale"
          style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          {currentChallenge.items.map((item) => (
            <ChallengeItemComponent key={item.id} item={item} type={currentChallenge.type} onTap={handleTap} shakeId={shakeId} glowId={glowId} />
          ))}
        </div>

        <p className="text-xs text-muted-foreground/60 mt-6 text-center max-w-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          Take your time. There's no rush—just gentle focus.
        </p>
      </div>
    </ActivityLayout>
  );
};

export default AttentionSwitch;