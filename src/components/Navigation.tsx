import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <span className="text-xl font-display font-bold">CertiFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="/templates" className="text-foreground hover:text-primary transition-colors">Templates</a>
            <a href="/verify" className="text-foreground hover:text-primary transition-colors">Verify</a>
            <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Sign In
            </Button>
            <Button className="btn-hero" onClick={() => window.location.href = '/editor'}>
              Create Certificate
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;