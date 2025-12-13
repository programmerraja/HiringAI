import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <defs>
                <linearGradient id="monogram_grad_nav" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A855F7" /> <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <path d="M14 10C14 8.89543 14.8954 8 16 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="url(#monogram_grad_nav)" />
              <path d="M26 18C26 16.8954 26.8954 16 28 16H32C33.1046 16 34 16.8954 34 18V38C34 39.1046 33.1046 40 32 40H28C26.8954 40 26 39.1046 26 38V18Z" fill="url(#monogram_grad_nav)" fillOpacity="0.8" />
              <path d="M22 22H26" stroke="url(#monogram_grad_nav)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="38" cy="12" r="4" fill="#EC4899" />
            </svg>
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">HiringAI</span>
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
        className={`md:hidden bg-black border-t border-neutral-800 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
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
