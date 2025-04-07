import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border py-4">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-1 mb-1">
          Made with <Heart className="h-4 w-4 fill-primary/80 text-primary" /> for better productivity
        </div>
        <div>
          &copy; {new Date().getFullYear()} LifeTrack App. Your data is stored securely in our database.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
