import { Link, useLocation } from "wouter";
import { ClipboardList } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const Header = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path 
      ? "text-primary border-b-2 border-primary" 
      : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary/50";
  };

  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center justify-between w-full sm:w-auto mb-4 sm:mb-0">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <ClipboardList className="h-6 w-6 mr-2" />
            LifeTrack
          </h1>
          <div className="sm:hidden">
            <ThemeSwitcher />
          </div>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <nav className="flex flex-wrap justify-center">
            <Link href="/">
              <a className={`px-3 py-2 font-medium ${isActive("/")}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/tasks">
              <a className={`px-3 py-2 font-medium ${isActive("/tasks")}`}>
                Tasks
              </a>
            </Link>
            <Link href="/habits">
              <a className={`px-3 py-2 font-medium ${isActive("/habits")}`}>
                Habits
              </a>
            </Link>
            <Link href="/goals">
              <a className={`px-3 py-2 font-medium ${isActive("/goals")}`}>
                Goals
              </a>
            </Link>
            <Link href="/finances">
              <a className={`px-3 py-2 font-medium ${isActive("/finances")}`}>
                Finances
              </a>
            </Link>
          </nav>
          <div className="hidden sm:block ml-4">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
