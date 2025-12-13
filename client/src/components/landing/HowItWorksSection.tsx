import { Briefcase, Phone, FileText } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Set Up Your Job",
    description:
      "Provide your company website and job description. Our AI extracts context automatically to create tailored interview questions.",
    icon: <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-black" />,
  },
  {
    number: 2,
    title: "AI Conducts Interviews",
    description:
      "Candidates receive calls from our voice agent for natural, conversational screening available 24/7 in multiple languages.",
    icon: <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-black" />,
  },
  {
    number: 3,
    title: "Review Assessments",
    description:
      "Get detailed scorecards, full transcripts, and AI-powered recommendations for each candidate to make informed decisions.",
    icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-black" />,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto px-4 sm:px-0">
            Get started in minutes and let AI handle your initial candidate screening.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 lg:top-10 left-[60%] w-full h-0.5 bg-neutral-800" />
              )}
              
              {/* Vertical connector for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute left-1/2 top-[4.5rem] h-8 w-0.5 bg-neutral-800 -translate-x-1/2" />
              )}
              
              <div className="flex flex-col items-center text-center pb-4 md:pb-0">
                <div className="relative z-10 rounded-full bg-white w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg">
                  {step.icon}
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-neutral-900 text-white font-bold text-xs sm:text-sm w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-neutral-700">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xs sm:max-w-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Deliverables Section */}
        <div className="mt-10 sm:mt-12 md:mt-16 bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
          <h3 className="text-lg sm:text-xl font-semibold text-white text-center mb-4 sm:mb-6">
            What You Get After Each Interview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">📊</div>
              <h4 className="font-medium text-white text-sm sm:text-base">Scorecard</h4>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Detailed ratings across all assessment pillars
              </p>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">📝</div>
              <h4 className="font-medium text-white text-sm sm:text-base">Summary</h4>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                AI-generated overview of candidate strengths
              </p>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">💬</div>
              <h4 className="font-medium text-white text-sm sm:text-base">Transcript</h4>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Full conversation record for review
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
