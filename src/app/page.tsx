import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Habits from "@/components/Habits";
import RunSection from "@/components/RunSection";
import TrainingGrid from "@/components/TrainingGrid";
import BMICalculator from "@/components/BMICalculator";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBanner />
        <Habits />
        <RunSection />
        <TrainingGrid />
        <BMICalculator />
        <TeamSection />
      </main>
      <Footer />
    </>
  );
}
