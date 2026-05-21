import Image from "next/image";

const trainers = [
  { name: "Jerome Bell", role: "Trainer", image: "/images/trainer1.png" },
  { name: "Cameron Williamson", role: "Trainer", image: "/images/trainer2.png" },
  { name: "Darell Steward", role: "Trainer", image: "/images/trainer3.png" },
  { name: "Dianne Russell", role: "Trainer", image: "/images/trainer4.png" },
  { name: "Cody Fisher", role: "Trainer", image: "/images/trainer5.png" },
  { name: "Theresa Webb", role: "Trainer", image: "/images/trainer6.png" },
];

export default function TeamSection() {
  return (
    <section id="team" className="max-w-[90%] mx-auto py-20 sm:py-28">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">Meet Our Team</h2>
        <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Our certified trainers are dedicated to helping you achieve your fitness goals with personalized guidance and expert knowledge.
        </p>
      </div>
      <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {trainers.map((trainer) => (
            <div key={trainer.name} className="relative h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden group cursor-pointer">
              <Image src={trainer.image} alt={trainer.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h6 className="text-lg sm:text-xl font-bold">{trainer.name}</h6>
                <p className="text-secondary-text text-sm">{trainer.role}</p>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-accent/50 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
