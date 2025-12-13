import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface Stat {
  value: string;
  label: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "HiringAI has transformed our recruiting process. We've cut our time-to-hire by 60% while improving candidate quality.",
    author: "Sarah Chen",
    role: "Head of Talent",
    company: "TechCorp Inc.",
  },
  {
    quote:
      "The AI interviews are incredibly thorough. Candidates tell us they appreciate the consistent, unbiased experience.",
    author: "Michael Rodriguez",
    role: "VP of Engineering",
    company: "StartupXYZ",
  },
  {
    quote:
      "We screen 10x more candidates now without adding headcount. The ROI has been phenomenal.",
    author: "Emily Watson",
    role: "Recruiting Manager",
    company: "Enterprise Solutions",
  },
];

const stats: Stat[] = [
  { value: "10,000+", label: "Interviews Conducted" },
  { value: "60%", label: "Time Saved" },
  { value: "95%", label: "Candidate Satisfaction" },
  { value: "500+", label: "Companies Trust Us" },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-neutral-400 mt-0.5 sm:mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Trusted by Recruiters Everywhere
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto px-4 sm:px-0">
            See what hiring teams are saying about HiringAI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-neutral-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-neutral-800 relative hover:border-neutral-700 transition-colors"
            >
              <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-700 absolute top-3 right-3 sm:top-4 sm:right-4" />
              <p className="text-sm sm:text-base text-neutral-300 mb-4 sm:mb-6 leading-relaxed italic pr-6 sm:pr-8">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm sm:text-base truncate">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-neutral-500 truncate">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
