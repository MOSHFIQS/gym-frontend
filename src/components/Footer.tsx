import Link from "next/link";

const getStartedLinks = [
  { label: "Service", href: "#habits" },
  { label: "Contact Us", href: "#bmi" },
  { label: "Affiliate Program", href: "#" },
  { label: "About Us", href: "#team" },
];

const exploreLinks = [
  { label: "Fitness", href: "#home" },
  { label: "Platform", href: "#" },
  { label: "Workout Library", href: "#training" },
  { label: "App Design", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-card-bg pt-16 sm:pt-20">
      <div className="max-w-[90%] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-md">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-accent italic mb-5">
              Fitness
            </h2>
            <p className="text-footer-text text-sm leading-relaxed">
              We believe fitness should be accessible to everyone, everywhere,
              regardless of income or access to a gym. With hundreds of
              professional workouts.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 sm:gap-24 lg:gap-36">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Get Started</h3>
              <ul className="space-y-4">
                {getStartedLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-footer-text text-base sm:text-lg hover:text-accent transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-6">Explore</h3>
              <ul className="space-y-4">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-footer-text text-base sm:text-lg hover:text-accent transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 py-8 text-center">
          <p className="text-footer-text text-sm sm:text-base">
            All rights reserved &copy; Fitness {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
