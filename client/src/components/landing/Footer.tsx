import { Link } from "react-router-dom";

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
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="monogram_grad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#A855F7" /> <stop offset="1" stop-color="#3B82F6" /> </linearGradient>
                </defs>
                <path d="M14 10C14 8.89543 14.8954 8 16 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="url(#monogram_grad)" />
                <path d="M26 18C26 16.8954 26.8954 16 28 16H32C33.1046 16 34 16.8954 34 18V38C34 39.1046 33.1046 40 32 40H28C26.8954 40 26 39.1046 26 38V18Z" fill="url(#monogram_grad)" fill-opacity="0.8" />
                <path d="M22 22H26" stroke="url(#monogram_grad)" stroke-width="4" stroke-linecap="round" />
                <circle cx="38" cy="12" r="4" fill="#EC4899" /> </svg>
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
