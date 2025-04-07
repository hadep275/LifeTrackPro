import { Link, useLocation } from "wouter";
import { ClipboardList } from "lucide-react";

const Header = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path 
      ? "text-primary-dark border-b-2 border-primary-dark" 
      : "text-slate-600 hover:text-primary-dark hover:border-b-2 hover:border-primary-light";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-xl font-bold text-primary-dark flex items-center mb-4 sm:mb-0">
          <ClipboardList className="h-6 w-6 mr-2" />
          LifeTrack
        </h1>
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
      </div>
    </header>
  );
};

export default Header;
