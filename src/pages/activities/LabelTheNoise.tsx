import { useState, useCallback } from "react";
import ActivityLayout from "@/components/ActivityLayout";
import CompletionScreen from "@/components/CompletionScreen";

type Category = "thought" | "feeling" | "urge";

interface NoiseCard {
  id: number;
  text: string;
  category: Category;
  placed: boolean;
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

const LabelTheNoise = () => {
  const [cards, setCards] = useState<NoiseCard[]>(initialCards);
  const [draggedCard, setDraggedCard] = useState<NoiseCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<NoiseCard | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleDragStart = (card: NoiseCard) => {
    setDraggedCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDrop = useCallback((category: Category) => {
    const cardToPlace = draggedCard || selectedCard;
    if (!cardToPlace) return;

    setCards((prev) => {
      const updated = prev.map((c) =>
        c.id === cardToPlace.id ? { ...c, placed: true } : c
      );
      
      // Check if all cards are placed
      if (updated.every((c) => c.placed)) {
        setTimeout(() => setCompleted(true), 500);
      }
      
      return updated;
    });

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
        title="Noise labeled"
        message="Naming what's in your mind creates space between you and your thoughts."
      />
    );
  }

  const unplacedCards = cards.filter((c) => !c.placed);
  const placedCount = cards.filter((c) => c.placed).length;

  return (
    <ActivityLayout
      title="Label the Noise"
      subtitle="Categorize what's in your mind"
      bgColorClass="bg-background"
    >
      <div className="flex flex-col gap-6 pt-4">
        {/* Progress */}
        <div className="text-center opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <p className="text-sm text-muted-foreground">
            {placedCount} of {cards.length} sorted
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-3 gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cat.id)}
              className={`
                ${cat.bgClass} rounded-2xl p-4 min-h-[100px]
                flex flex-col items-center justify-center gap-2
                transition-all duration-200
                ${selectedCard ? "ring-2 ring-primary/50 cursor-pointer hover:scale-105" : ""}
                ${draggedCard ? "ring-2 ring-primary/30" : ""}
              `}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-foreground">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Instruction */}
        {selectedCard && (
          <p className="text-center text-sm text-primary animate-fade-in">
            Now tap a category above to place it
          </p>
        )}

        {/* Cards to sort */}
        <div className="space-y-3 mt-4">
          {unplacedCards.map((card, index) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(card)}
              onDragEnd={handleDragEnd}
              onClick={() => handleCardClick(card)}
              className={`
                p-4 rounded-xl bg-card shadow-soft cursor-grab active:cursor-grabbing
                transition-all duration-200 tap-feedback
                opacity-0 animate-slide-in-bottom
                ${selectedCard?.id === card.id ? "ring-2 ring-primary scale-[1.02]" : "hover:shadow-soft-lg"}
              `}
              style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <p className="text-sm text-foreground text-center">"{card.text}"</p>
            </div>
          ))}
        </div>

        {unplacedCards.length > 0 && (
          <p className="text-xs text-muted-foreground/60 text-center mt-4 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            Tap a card, then tap a category • Or drag and drop
          </p>
        )}
      </div>
    </ActivityLayout>
  );
};

export default LabelTheNoise;
