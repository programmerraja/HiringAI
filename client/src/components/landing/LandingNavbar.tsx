import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <div className="rounded-full bg-white p-1.5 sm:p-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">HiringAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Button variant="ghost" size="sm" className="lg:text-base text-neutral-300 hover:text-white hover:bg-neutral-800" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button size="sm" className="bg-white text-black hover:bg-neutral-200 lg:text-base" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden bg-black border-t border-neutral-800 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 py-3 sm:py-4 space-y-2 sm:space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm sm:text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 py-2 px-2 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 sm:pt-4 border-t border-neutral-800 space-y-2 sm:space-y-3">
            <Button variant="outline" className="w-full text-sm sm:text-base border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white" asChild>
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button className="w-full bg-white text-black hover:bg-neutral-200 text-sm sm:text-base" asChild>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
