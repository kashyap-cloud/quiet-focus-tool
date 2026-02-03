import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CompletionScreen from "@/components/CompletionScreen";
import { ArrowLeft, RotateCcw, X } from "lucide-react";

const floatingMessages = [
  "You're doing great...",
  "Just breathe...",
  "Let thoughts pass like clouds...",
  "This moment is yours...",
  "Stillness is strength...",
  "You are enough, right now...",
  "Be gentle with yourself...",
];

const DoNothing = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "active" | "completed" | "cancelled">("intro");
  const [timeLeft, setTimeLeft] = useState(60);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderKey, setReminderKey] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (phase === "active" && timeLeft <= 0) {
      setPhase("completed");
      return;
    }

    if (phase === "active" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  // Rotate floating messages
  useEffect(() => {
    if (phase === "active") {
      const messageTimer = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % floatingMessages.length);
      }, 8000);
      return () => clearInterval(messageTimer);
    }
  }, [phase]);

  const handleInteraction = useCallback(() => {
    if (phase === "active" && timeLeft > 0) {
      setShowReminder(true);
      setReminderKey((prev) => prev + 1);
      
      setTimeout(() => {
        setShowReminder(false);
      }, 2500);
    }
  }, [phase, timeLeft]);

  const handleStart = () => {
    setPhase("active");
    setTimeLeft(60);
  };

  const handleRestart = () => {
    setTimeLeft(60);
    setShowReminder(false);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleCancel = () => {
    setPhase("cancelled");
  };

  if (phase === "cancelled") {
    return (
      <div className="min-h-screen bg-calm-cream flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-calm-lavender/30 mb-6">
            <span className="text-3xl">💙</span>
          </div>

          {/* Message */}
          <h2 className="text-xl font-medium text-foreground mb-4">
            That's okay
          </h2>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            No pressure, no worries. You showed up, and that matters. Come back whenever you're ready.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => { setPhase("active"); setTimeLeft(60); }}
              className="w-full px-6 py-4 rounded-2xl bg-calm-mint/30 text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all"
            >
              Try again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-4 rounded-2xl bg-card text-foreground font-medium tap-feedback shadow-soft hover:shadow-soft-lg transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <CompletionScreen
        title="You did it"
        message="You gave yourself the gift of stillness. That takes real strength. Be proud of yourself."
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-calm-cream flex flex-col items-center justify-center px-6">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 p-3 rounded-full bg-card/80 shadow-soft tap-feedback hover:scale-105 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="text-center max-w-sm mx-auto opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-calm-blue/30 mb-8 animate-breathe">
            <span className="text-4xl">🌿</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-medium text-foreground mb-4">
            Resist the Urge
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground text-base mb-3 leading-relaxed">
            For one minute, give yourself permission to just be.
          </p>
          <p className="text-muted-foreground/70 text-sm mb-10 leading-relaxed">
            No tasks. No scrolling. No planning.<br />Just you, breathing.
          </p>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="px-10 py-4 rounded-2xl bg-primary/20 hover:bg-primary/30 text-foreground font-medium tap-feedback shadow-soft transition-all hover:scale-[1.02]"
          >
            I'm ready to begin
          </button>
        </div>
      </div>
    );
  }

  const progress = ((60 - timeLeft) / 60) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="min-h-screen bg-calm-cream flex flex-col items-center justify-center px-6 select-none relative"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Controls - top left */}
      <div className="absolute top-6 left-6 flex gap-2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); handleBack(); }}
          className="p-3 rounded-full bg-card/80 shadow-soft tap-feedback hover:scale-105 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRestart(); }}
          className="p-3 rounded-full bg-card/80 shadow-soft tap-feedback hover:scale-105 transition-all"
          aria-label="Restart"
        >
          <RotateCcw className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleCancel(); }}
          className="p-3 rounded-full bg-card/80 shadow-soft tap-feedback hover:scale-105 transition-all"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Floating message */}
      <div 
        key={currentMessage}
        className="absolute top-24 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/70 animate-fade-in text-center max-w-xs z-10"
        style={{ animationFillMode: "forwards" }}
      >
        {floatingMessages[currentMessage]}
      </div>

      {/* Gentle reminder message */}
      <div
        key={reminderKey}
        className={`
          fixed top-40 left-1/2 -translate-x-1/2 z-30
          px-6 py-3 rounded-full bg-card/90 backdrop-blur-sm shadow-soft
          text-sm text-muted-foreground
          transition-all duration-500
          ${showReminder ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        Just be still. You're doing great. 💙
      </div>

      <div className="text-center max-w-sm">
        {/* Timer Circle */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Breathing glow effect */}
          <div className="absolute w-72 h-72 rounded-full bg-primary/10 animate-breathe" />
          
          {/* Progress ring */}
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
            {/* Background ring */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-light text-foreground tabular-nums">
              {timeLeft}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              seconds
            </span>
          </div>
        </div>

        {/* Main message */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <h1 className="text-xl font-medium text-foreground mb-3">
            Let yourself rest
          </h1>
          <p className="text-sm text-muted-foreground">
            You're safe here. Just breathe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoNothing;
