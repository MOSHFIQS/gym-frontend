import Image from "next/image";

const habits = [
  {
    image: "/images/image 3.png",
    title: "Movement",
    description: "We believe fitness should be accessible to everyone",
  },
  {
    image: "/images/image 2.png",
    title: "Time",
    description: "We believe fitness should be accessible to everyone",
  },
  {
    image: "/images/image 4.png",
    title: "Practice",
    description: "We believe fitness should be accessible to everyone",
  },
  {
    image: "/images/image 5.png",
    title: "Weight Loss",
    description: "We believe fitness should be accessible to everyone",
  },
];

export default function Habits() {
  return (
    <section id="habits" className="py-20 sm:py-28">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto px-6 mb-14">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
          Change Your Habits
        </h2>
        <p className="text-secondary-text text-sm sm:text-base leading-relaxed">
          We believe fitness should be accessible to everyone, everywhere,
          regardless of income or access to a gym.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-[90%] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {habits.map((habit, i) => (
          <div
            key={habit.title}
            className="group flex flex-col items-center text-center"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="relative mb-5 overflow-hidden rounded-full">
              <Image
                src={habit.image}
                alt={habit.title}
                width={200}
                height={200}
                className="rounded-full transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-accent/0 group-hover:bg-accent/20 transition-all duration-500" />
            </div>
            <h4 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">
              {habit.title}
            </h4>
            <p className="text-secondary-text text-sm max-w-[220px] leading-relaxed">
              {habit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
