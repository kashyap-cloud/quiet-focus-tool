import { useNavigate } from "react-router-dom";
import { Target, Pause, Tag, Leaf, RefreshCw } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  path: string;
}

const activities: Activity[] = [
  {
    id: "attention-switch",
    title: "Attention Switch",
    description: "Redirect scattered thoughts",
    icon: <Target className="w-6 h-6" />,
    colorClass: "text-primary",
    bgClass: "bg-activity-attention/20",
    path: "/activity/attention-switch",
  },
  {
    id: "do-nothing",
    title: "Do Nothing",
    description: "One minute of peace",
    icon: <Pause className="w-6 h-6" />,
    colorClass: "text-foreground",
    bgClass: "bg-activity-stillness",
    path: "/activity/do-nothing",
  },
  {
    id: "label-the-noise",
    title: "Label the Noise",
    description: "Categorize your thoughts",
    icon: <Tag className="w-6 h-6" />,
    colorClass: "text-secondary-foreground",
    bgClass: "bg-activity-label/30",
    path: "/activity/label-the-noise",
  },
  {
    id: "compulsion-picker",
    title: "Compulsion Picker",
    description: "Choose a healthy action",
    icon: <Leaf className="w-6 h-6" />,
    colorClass: "text-accent-foreground",
    bgClass: "bg-activity-picker/30",
    path: "/activity/compulsion-picker",
  },
  {
    id: "end-the-loop",
    title: "End the Loop",
    description: "Recognize your patterns",
    icon: <RefreshCw className="w-6 h-6" />,
    colorClass: "text-accent-foreground",
    bgClass: "bg-activity-loop/30",
    path: "/activity/end-the-loop",
  },
];

const ActivityCard = ({ activity, index }: { activity: Activity; index: number }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(activity.path)}
      className={`
        w-full p-5 rounded-2xl ${activity.bgClass}
        flex items-center gap-4
        tap-feedback shadow-soft
        hover:shadow-soft-lg hover:scale-[1.02]
        transition-all duration-300 ease-out
        opacity-0 animate-fade-in-up
        text-left
      `}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className={`
        w-12 h-12 rounded-xl ${activity.bgClass}
        flex items-center justify-center
        ${activity.colorClass}
      `}>
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-base">{activity.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
      </div>
    </button>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle breathing background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-calm-blue/20 animate-breathe-slow" />
        <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-calm-mint/15 animate-breathe" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-calm-lavender/20 animate-breathe-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <span className="text-3xl">🧘</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Calm Mind
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Take a moment. Find your peace.
          </p>
        </header>

        {/* Activity Cards */}
        <nav className="space-y-3" aria-label="Wellness activities">
          {activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </nav>

        {/* Footer */}
        <footer className="text-center mt-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
          <p className="text-xs text-muted-foreground/60">
            Breathe. You're doing great.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
