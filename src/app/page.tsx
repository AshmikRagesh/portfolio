import ChatLayout from "@/components/ChatLayout";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Works from "@/components/Works";
import Playground from "@/components/Playground";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <ChatLayout>
      <Navbar />
      <Hero />
      <Works />
      <Playground />
      <Footer />
    </ChatLayout>
  );
}
