import type { Metadata } from "next";
import Footer from "@/components/Footer";
import FrontDesk from "@/components/bella/FrontDesk";

export const metadata: Metadata = {
  title: "Front desk · Ashmik Ragesh",
  description: "Your guest card: your stay, your stamps, and where you left off.",
  robots: { index: false },
};

export default function FrontDeskPage() {
  return (
    <>
      <main className="relative z-10 min-h-screen bg-surface pt-[160px] pb-[160px]">
        <div className="page-container">
          <FrontDesk />
        </div>
      </main>
      <Footer />
    </>
  );
}
