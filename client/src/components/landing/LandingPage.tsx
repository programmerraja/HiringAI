import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Bot } from "lucide-react";
import {
  LandingNavbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "./index";

export function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
        <div className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          <span className="text-white font-bold text-lg sm:text-xl">HiringAI</span>
        </div>
        <Spinner size="lg" className="text-white" />
        <div className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-400">Loading...</div>
      </div>
    );
  }

  // Render landing page for unauthenticated visitors
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
