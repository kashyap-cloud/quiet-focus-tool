import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ActivityLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  bgColorClass?: string;
  showBackButton?: boolean;
}

const ActivityLayout = ({
  children,
  title,
  subtitle,
  bgColorClass = "bg-background",
  showBackButton = true,
}: ActivityLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${bgColorClass} relative`}>
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center tap-feedback shadow-soft"
            aria-label="Go back home"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-medium text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-6 pb-12">
        {children}
      </main>
    </div>
  );
};

export default ActivityLayout;
