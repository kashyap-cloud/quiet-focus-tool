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

const initialCards: NoiseCard[] = [
  { id: 1, text: "I should check my phone", category: "urge", placed: false },
  { id: 2, text: "I feel restless", category: "feeling", placed: false },
  { id: 3, text: "What if I forget something?", category: "thought", placed: false },
  { id: 4, text: "I need to do something", category: "urge", placed: false },
  { id: 5, text: "I'm anxious about tomorrow", category: "feeling", placed: false },
  { id: 6, text: "This is taking too long", category: "thought", placed: false },
];

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
  const [cards, setCards] = useState<NoiseCard[]>(initialCards);
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
        {/* Progress */}
        <div className="text-center opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
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
