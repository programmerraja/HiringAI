import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Sign In", href: "/signin" },
    { label: "Sign Up", href: "/signup" },
  ];

  return (
    <footer className="bg-black text-neutral-400 py-8 sm:py-10 md:py-12 border-t border-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="rounded-full bg-white p-1.5 sm:p-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">HiringAI</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {footerLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs sm:text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs sm:text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-neutral-900 text-center text-xs sm:text-sm text-neutral-600">
          © {currentYear} HiringAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
