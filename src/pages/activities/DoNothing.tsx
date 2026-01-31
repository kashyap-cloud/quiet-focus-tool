import { useState, useEffect, useCallback } from "react";
import CompletionScreen from "@/components/CompletionScreen";

const DoNothing = () => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [completed, setCompleted] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderKey, setReminderKey] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCompleted(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleInteraction = useCallback(() => {
    if (!completed && timeLeft > 0) {
      setShowReminder(true);
      setReminderKey((prev) => prev + 1);
      
      // Hide reminder after 2 seconds
      setTimeout(() => {
        setShowReminder(false);
      }, 2500);
    }
  }, [completed, timeLeft]);

  if (completed) {
    return (
      <CompletionScreen
        title="Stillness achieved"
        message="You gave yourself the gift of doing nothing. That takes strength."
      />
    );
  }

  const progress = ((60 - timeLeft) / 60) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="min-h-screen bg-calm-cream flex flex-col items-center justify-center px-6 select-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Gentle reminder message */}
      <div
        key={reminderKey}
        className={`
          fixed top-20 left-1/2 -translate-x-1/2 z-30
          px-6 py-3 rounded-full bg-card/90 backdrop-blur-sm shadow-soft
          text-sm text-muted-foreground
          transition-all duration-500
          ${showReminder ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
        `}
      >
        Just be still. You're doing great.
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

        {/* Instruction */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <h1 className="text-xl font-medium text-foreground mb-3">
            For one minute, do nothing.
          </h1>
          <p className="text-sm text-muted-foreground">
            No scrolling. No planning. Just be.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoNothing;
