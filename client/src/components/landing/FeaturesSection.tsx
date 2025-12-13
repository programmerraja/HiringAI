import { CheckCircle, MessageSquare, Brain, Users } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
    title: "Experience Verification",
    description:
      "AI validates technical depth and work history with intelligent follow-up questions that dig deeper into candidate expertise.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
    title: "Behavioral Assessment",
    description:
      "STAR method questions evaluate problem-solving abilities and situational responses to real-world scenarios.",
  },
  {
    icon: <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
    title: "Role-Specific Knowledge",
    description:
      "Custom questions assess tools, frameworks, and domain expertise tailored to your specific job requirements.",
  },
  {
    icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
    title: "Cultural Fit Analysis",
    description:
      "Evaluate alignment with company values, work style preferences, and team dynamics for better hiring decisions.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Four Pillars of Assessment
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto px-4 sm:px-0">
            Our AI conducts comprehensive interviews covering all critical dimensions 
            of candidate evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-900 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 hover:bg-neutral-800 transition-colors border border-neutral-800"
            >
              <div className="rounded-full bg-neutral-800 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center mb-3 sm:mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
