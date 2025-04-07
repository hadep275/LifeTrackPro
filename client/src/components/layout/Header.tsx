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
            <Link href="/" className={`px-3 py-2 font-medium ${isActive("/")}`}>
              Dashboard
            </Link>
            <Link href="/tasks" className={`px-3 py-2 font-medium ${isActive("/tasks")}`}>
              Tasks
            </Link>
            <Link href="/habits" className={`px-3 py-2 font-medium ${isActive("/habits")}`}>
              Habits
            </Link>
            <Link href="/goals" className={`px-3 py-2 font-medium ${isActive("/goals")}`}>
              Goals
            </Link>
            <Link href="/finances" className={`px-3 py-2 font-medium ${isActive("/finances")}`}>
              Finances
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
