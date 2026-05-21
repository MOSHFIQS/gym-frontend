import Image from "next/image";

const exercises = [
  {
    image: "/images/exercise1.jpg",
    label: "Warm Up Stretches",
    overlay: "bg-teal-400/40",
    colSpan: "col-span-2 lg:col-span-1",
  },
  {
    image: "/images/exercise2.png",
    label: "Core Strengthening",
    overlay: "bg-red-500/30",
    colSpan: "col-span-2 lg:col-span-2",
  },
  {
    image: "/images/exercise3.png",
    label: "Leg Press: Works the quadriceps and glutes",
    overlay: "bg-black/50",
    colSpan: "col-span-2 lg:col-span-1 hidden lg:block",
  },
  {
    image: "/images/exercise4.png",
    label: "Full Body Workout",
    overlay: "bg-black/50",
    colSpan: "col-span-2",
  },
  {
    image: "/images/exercise5.jpg",
    label: "Cardio Training",
    overlay: "bg-green-500/30",
    colSpan: "col-span-2 lg:col-span-1",
  },
  {
    image: "/images/exercise6.jpg",
    label: "Weight Training",
    overlay: "bg-blue-600/30",
    colSpan: "col-span-2 lg:col-span-1 hidden lg:block",
  },
];

export default function TrainingGrid() {
  return (
    <section className="max-w-[90%] mx-auto mb-20 sm:mb-28">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
          Training and Exercises
        </h2>
        <p className="text-secondary-text/50 text-base sm:text-xl max-w-lg">
          Discover our curated selection of professional workout routines
          designed for all fitness levels.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {exercises.map((exercise, i) => (
          <div
            key={i}
            className={`${exercise.colSpan} relative h-36 sm:h-56 lg:h-[350px] rounded-xl overflow-hidden group cursor-pointer`}
          >
            <Image
              src={exercise.image}
              alt={exercise.label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Color overlay */}
            <div
              className={`absolute inset-0 ${exercise.overlay} transition-opacity duration-500 group-hover:opacity-70`}
            />
            {/* Label */}
            <div className="absolute inset-0 flex items-end p-4 sm:p-6">
              <p className="text-white font-semibold text-sm sm:text-base drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {exercise.label}
              </p>
            </div>
            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/30 transition-all duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
}
