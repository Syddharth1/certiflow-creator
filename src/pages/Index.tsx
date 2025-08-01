import { Award, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      {/* Hero Section */}
      <div className="container mx-auto px-8 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-display font-bold mb-6">
            Create Professional Certificates in Minutes
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Design, customize, and distribute beautiful certificates with our powerful drag-and-drop editor. 
            Complete with QR verification and professional templates.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="btn-hero bg-white text-primary hover:bg-white/90">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Browse Templates
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="btn-hero bg-white text-primary hover:bg-white/90">
                    Get Started
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Browse Templates
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white/10 backdrop-blur rounded-xl">
            <Award className="h-16 w-16 text-accent-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Professional Templates</h3>
            <p className="text-white/80">Choose from dozens of professionally designed certificate templates</p>
          </div>
          <div className="text-center p-8 bg-white/10 backdrop-blur rounded-xl">
            <Shield className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">QR Verification</h3>
            <p className="text-white/80">Built-in QR codes ensure your certificates are authentic and verifiable</p>
          </div>
          <div className="text-center p-8 bg-white/10 backdrop-blur rounded-xl">
            <Sparkles className="h-16 w-16 text-primary-glow mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Easy to Use</h3>
            <p className="text-white/80">Intuitive drag-and-drop editor makes certificate creation effortless</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
