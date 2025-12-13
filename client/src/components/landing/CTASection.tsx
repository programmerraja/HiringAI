import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-purple-900/50 to-pink-900/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Ready to Transform Your Hiring?
        </h2>
        <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
          Join hundreds of companies using AI to screen candidates faster and smarter. 
          Start your free trial today.
        </p>
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
      </div>
    </section>
  );
}
