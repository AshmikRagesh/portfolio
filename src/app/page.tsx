import Hero from "@/components/Hero";
import Works from "@/components/Works";
import Testimonials from "@/components/Testimonials";
import TasteNotes from "@/components/TasteNotes";
import Footer from "@/components/Footer";
import ReelPlayer from "@/components/ReelPlayer";

export default function Home() {
  return (
    <>
      {/* Content layers — each sticky so they stack and slide over the footer below */}
      <div className="relative z-10 bg-background">
        <Hero />
        <Works />
        <Testimonials />
        <TasteNotes />
      </div>
      <Footer />
      <ReelPlayer />
    </>
  );
}
