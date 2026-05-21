import Image from "next/image";

export default function RunSection() {
  return (
    <section className="max-w-[90%] mx-auto mb-20 sm:mb-28">
      <div className="bg-card-bg rounded-2xl lg:rounded-3xl flex flex-col lg:flex-row items-center justify-between overflow-hidden">
        {/* Text Content */}
        <div className="flex-1 p-8 sm:p-10 lg:p-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4">
            Run an Extra
            <br />
            Mile Easily
          </h2>
          <p className="text-secondary-text text-sm sm:text-base leading-relaxed mb-8 max-w-md">
            We believe fitness should be accessible to everyone, everywhere,
            regardless of income or access to a gym. With hundreds of
            professional workouts.
          </p>
          <button
            id="join-now-btn"
            className="w-full sm:w-auto px-12 py-4 bg-accent text-white font-semibold text-lg rounded-full hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-accent/30"
          >
            Join Now
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 w-full lg:w-auto h-64 sm:h-80 lg:h-[400px] relative overflow-hidden">
          <Image
            src="/images/run.jpg"
            alt="Person running"
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient overlay for text blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-card-bg/80 via-transparent to-transparent lg:block hidden" />
        </div>
      </div>
    </section>
  );
}
