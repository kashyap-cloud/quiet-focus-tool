import { useState, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";

type Category = "thought" | "feeling" | "urge";

interface NoiseCard {
  id: number;
  text: string;
  category: Category;
  placed: boolean;
  placedIn?: Category;
}

// Expanded card pool for variety - shuffled each session
const allCards: Omit<NoiseCard, "placed" | "placedIn">[] = [
  // Urges
  { id: 1, text: "I should check my phone", category: "urge" },
  { id: 2, text: "I need to do something", category: "urge" },
  { id: 3, text: "I want to wash my hands again", category: "urge" },
  { id: 4, text: "I should double-check the door", category: "urge" },
  { id: 5, text: "I need to fix this right now", category: "urge" },
  { id: 6, text: "I have to count this again", category: "urge" },
  { id: 7, text: "I should look this up online", category: "urge" },
  { id: 8, text: "I need reassurance from someone", category: "urge" },
  // Feelings
  { id: 9, text: "I feel restless", category: "feeling" },
  { id: 10, text: "I'm anxious about tomorrow", category: "feeling" },
  { id: 11, text: "I feel uncertain", category: "feeling" },
  { id: 12, text: "I'm uncomfortable with this", category: "feeling" },
  { id: 13, text: "I feel overwhelmed", category: "feeling" },
  { id: 14, text: "I'm frustrated with myself", category: "feeling" },
  { id: 15, text: "I feel on edge", category: "feeling" },
  { id: 16, text: "I'm scared something bad will happen", category: "feeling" },
  // Thoughts
  { id: 17, text: "What if I forget something?", category: "thought" },
  { id: 18, text: "This is taking too long", category: "thought" },
  { id: 19, text: "Did I do that correctly?", category: "thought" },
  { id: 20, text: "Something doesn't feel right", category: "thought" },
  { id: 21, text: "Maybe I should start over", category: "thought" },
  { id: 22, text: "What if this isn't good enough?", category: "thought" },
  { id: 23, text: "I can't stop thinking about this", category: "thought" },
  { id: 24, text: "Am I sure I turned that off?", category: "thought" },
];

// Helper to shuffle and pick cards
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get balanced set of cards (2 from each category)
const getSessionCards = (): NoiseCard[] => {
  const urges = shuffleArray(allCards.filter(c => c.category === "urge")).slice(0, 2);
  const feelings = shuffleArray(allCards.filter(c => c.category === "feeling")).slice(0, 2);
  const thoughts = shuffleArray(allCards.filter(c => c.category === "thought")).slice(0, 2);
  return shuffleArray([...urges, ...feelings, ...thoughts]).map((card, idx) => ({
    ...card,
    id: idx + 1,
    placed: false,
  }));
};

const categories: { id: Category; label: string; emoji: string; bgClass: string }[] = [
  { id: "thought", label: "Thought", emoji: "💭", bgClass: "bg-calm-blue/30" },
  { id: "feeling", label: "Feeling", emoji: "💙", bgClass: "bg-calm-mint/30" },
  { id: "urge", label: "Urge", emoji: "⚡", bgClass: "bg-calm-lavender/30" },
];

const appreciations = [
  "Well noticed! 🌟",
  "That's right! ✨",
  "Great awareness! 💫",
  "You got it! 🌿",
  "Exactly right! 💙",
];

const LabelTheNoise = () => {
  const [cards, setCards] = useState<NoiseCard[]>(() => getSessionCards());
  const [draggedCard, setDraggedCard] = useState<NoiseCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<NoiseCard | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean; cardId: number } | null>(null);
  const [placedCards, setPlacedCards] = useState<Record<Category, NoiseCard[]>>({
    thought: [],
    feeling: [],
    urge: [],
  });

  const handleDragStart = (card: NoiseCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const showFeedback = (message: string, isCorrect: boolean, cardId: number) => {
    setFeedback({ message, isCorrect, cardId });
    setTimeout(() => setFeedback(null), 2500);
  };

  const getCategoryLabel = (category: Category) => {
    return categories.find(c => c.id === category)?.label || category;
  };

  const handleDrop = useCallback((targetCategory: Category) => {
    const cardToPlace = draggedCard || selectedCard;
    if (!cardToPlace) return;

    const isCorrect = cardToPlace.category === targetCategory;
    
    if (isCorrect) {
      // Correct placement
      const appreciation = appreciations[Math.floor(Math.random() * appreciations.length)];
      showFeedback(appreciation, true, cardToPlace.id);
      
      setCards((prev) => {
        const updated = prev.map((c) =>
          c.id === cardToPlace.id ? { ...c, placed: true, placedIn: targetCategory } : c
        );
        
        // Check if all cards are placed correctly
        if (updated.every((c) => c.placed)) {
          setTimeout(() => setCompleted(true), 800);
        }
        
        return updated;
      });
      
      setPlacedCards((prev) => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory], cardToPlace],
      }));
    } else {
      // Wrong placement - gentle guidance
      const correctCategory = getCategoryLabel(cardToPlace.category);
      showFeedback(`This belongs in "${correctCategory}" 💙`, false, cardToPlace.id);
    }

    setDraggedCard(null);
    setSelectedCard(null);
  }, [draggedCard, selectedCard]);

  const handleCardClick = (card: NoiseCard) => {
    if (card.placed) return;
    setSelectedCard(selectedCard?.id === card.id ? null : card);
  };

  const handleCategoryClick = (category: Category) => {
    if (selectedCard) {
      handleDrop(category);
    }
  };

  if (completed) {
    return (
      <CompletionScreen
        title="Beautifully sorted"
        message="Naming what's in your mind creates space between you and your thoughts. You're building self-awareness."
      />
    );
  }

  const unplacedCards = cards.filter((c) => !c.placed);
  const correctCount = cards.filter((c) => c.placed && c.placedIn === c.category).length;

  return (
    <ActivityLayout
      title="Label the Noise"
      subtitle="Categorize what's in your mind"
      bgColorClass="bg-background"
    >
      <div className="flex flex-col gap-5 pt-4">
        {/* Gentle disclaimer */}
        <div className="bg-calm-blue/20 rounded-2xl p-4 mx-auto max-w-sm opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <p className="text-sm text-muted-foreground leading-relaxed text-center">
            <span className="text-base mr-1">💙</span>
            These are common OCD experiences. Sorting them helps build awareness—there are no "right" or "wrong" answers, just gentle practice.
          </p>
        </div>

        {/* Progress */}
        <div className="text-center opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <p className="text-sm text-muted-foreground">
            {correctCount} of {cards.length} sorted
          </p>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div 
            className={`
              fixed top-20 left-1/2 -translate-x-1/2 z-30
              px-6 py-3 rounded-2xl shadow-soft backdrop-blur-sm
              animate-fade-in-scale text-center max-w-xs
              ${feedback.isCorrect ? "bg-calm-mint/90 text-foreground" : "bg-card/95 text-muted-foreground"}
            `}
            style={{ animationFillMode: "forwards" }}
          >
            {feedback.message}
          </div>
        )}

        {/* Categories with placed cards */}
        <div className="grid grid-cols-3 gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cat.id)}
              className={`
                ${cat.bgClass} rounded-2xl p-3 min-h-[120px]
                flex flex-col items-center gap-2
                transition-all duration-300
                ${selectedCard ? "ring-2 ring-primary/50 cursor-pointer hover:scale-[1.02]" : ""}
                ${draggedCard ? "ring-2 ring-primary/30 scale-[1.02]" : ""}
              `}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
              
              {/* Show placed cards count */}
              {placedCards[cat.id].length > 0 && (
                <div className="mt-auto pt-2 w-full">
                  {placedCards[cat.id].map((card) => (
                    <div 
                      key={card.id}
                      className="text-[10px] text-muted-foreground bg-card/50 rounded-lg px-2 py-1 mb-1 truncate"
                      title={card.text}
                    >
                      "{card.text.slice(0, 15)}..."
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Instruction when card is selected */}
        {selectedCard && (
          <p className="text-center text-sm text-primary animate-fade-in">
            Now tap where this belongs
          </p>
        )}

        {/* Cards to sort */}
        <div className="space-y-3 mt-2">
          {unplacedCards.map((card, index) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(card)}
              onDragEnd={handleDragEnd}
              onClick={() => handleCardClick(card)}
              className={`
                p-4 rounded-xl bg-card shadow-soft cursor-grab active:cursor-grabbing
                transition-all duration-300 tap-feedback
                opacity-0 animate-slide-in-bottom
                ${selectedCard?.id === card.id ? "ring-2 ring-primary scale-[1.02] shadow-soft-lg" : "hover:shadow-soft-lg hover:scale-[1.01]"}
                ${feedback?.cardId === card.id && !feedback.isCorrect ? "animate-shake" : ""}
              `}
              style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <p className="text-sm text-foreground text-center leading-relaxed">"{card.text}"</p>
            </div>
          ))}
        </div>

        {unplacedCards.length > 0 && (
          <p className="text-xs text-muted-foreground/60 text-center mt-2 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            Tap a card, then tap where it belongs
          </p>
        )}
        
        {unplacedCards.length === 0 && !completed && (
          <p className="text-center text-muted-foreground animate-fade-in py-8">
            All sorted! ✨
          </p>
        )}
      </div>
    </ActivityLayout>
  );
};

export default LabelTheNoise;
