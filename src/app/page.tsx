import Hero from "@/components/Hero";
import Works from "@/components/Works";
import Playground from "@/components/Playground";
import Footer from "@/components/Footer";
import ReelPlayer from "@/components/ReelPlayer";

export default function Home() {
  return (
    <>
      <div className="relative z-10 bg-background">
        <Hero />
        <Works />
        <Playground />
      </div>
      <Footer />
      <ReelPlayer />
    </>
  );
}
