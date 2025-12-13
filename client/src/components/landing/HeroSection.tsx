import { Link } from "react-router-dom";
import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-neutral-900 to-black py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              AI-Powered Phone Screening for{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Smarter Hiring</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto lg:mx-0">
              Let our conversational voice agent conduct initial candidate interviews 24/7. 
              Get detailed assessments, save time, and find the best talent faster.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
                asChild
              >
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                asChild
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="rounded-full bg-white p-2 sm:p-3">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">HiringAI Agent</p>
                    <p className="text-xs sm:text-sm text-emerald-400">● Active</p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-neutral-800 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-neutral-300">
                    "Tell me about your experience with React and TypeScript..."
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-neutral-300 ml-4 sm:ml-8 border border-neutral-700">
                    "I've been working with React for 4 years..."
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-neutral-300">
                    "Great! Can you describe a challenging project..."
                  </div>
                </div>
              </div>
              {/* Decorative elements - hidden on smallest screens */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-20 sm:w-24 h-20 sm:h-24 bg-purple-500/20 rounded-full blur-2xl" />
              <div className="hidden sm:block absolute -bottom-4 -left-4 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
