import Image from "next/image";

export default function HeroBanner() {
  return (
    <section
      id="home"
      className="min-h-screen pt-28 pb-16 max-w-[90%] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12"
    >
      {/* Text Content */}
      <div className="flex-1 animate-fade-in">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[78px] font-black leading-[1.1] tracking-tight">
          Get body in{" "}
          <br />
          <span className="relative">
            <span className="font-[Miama] font-normal text-7xl sm:text-8xl lg:text-9xl xl:text-[150px] absolute -top-2 sm:-top-4 lg:-top-6 left-0 text-white/90">
              shape
            </span>
            <span className="invisible text-7xl sm:text-8xl lg:text-9xl xl:text-[150px]">shape</span>
          </span>
          {"  "}& stay
          <br />
          healthy
        </h1>

        <p className="text-secondary-text text-base sm:text-lg mt-6 mb-8 max-w-md leading-relaxed">
          A huge selection of health and fitness content, healthy recipes and
          transformation stories to help you get fit and stay fit!
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            id="join-club-btn"
            className="px-8 sm:px-11 py-4 bg-accent text-white font-semibold text-lg rounded-full hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-accent/30 animate-pulse-glow"
          >
            Join Club Now!
          </button>
          <button
            id="download-app-btn"
            className="px-8 sm:px-11 py-4 bg-transparent text-white font-semibold text-lg rounded-full border border-white/40 hover:border-white hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Download App
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="flex-1 relative flex justify-center lg:justify-end animate-slide-up">
        <div className="relative">
          <Image
            src="/images/Images 2.png"
            alt="Fitness person working out"
            width={460}
            height={560}
            className="relative z-10 drop-shadow-2xl"
            priority
          />

          {/* Decorative glow behind image */}
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px] -z-0" />

          {/* Floating Stat Card - Top Right */}
          <div className="glass absolute top-8 -right-4 sm:right-4 lg:-right-8 rounded-xl p-4 sm:p-5 animate-float z-20">
            <h3 className="text-3xl sm:text-4xl font-black">500+</h3>
            <p className="text-secondary-text text-xs sm:text-sm mt-1">
              Free Workout Video
            </p>
          </div>

          {/* Floating Stat Card - Bottom Left */}
          <div className="glass absolute bottom-16 -left-4 sm:left-0 lg:-left-20 rounded-xl p-4 sm:p-5 flex items-center gap-3 animate-float z-20"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-10 h-10 rounded-full bg-accent shrink-0 shadow-lg shadow-accent/40" />
            <div>
              <h3 className="text-xl sm:text-2xl font-black">350+</h3>
              <p className="text-secondary-text text-xs sm:text-sm">
                Video tutorial
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
