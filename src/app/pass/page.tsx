import type { Metadata } from "next";
import Footer from "@/components/Footer";
import PassPage from "@/components/bella/PassPage";

export const metadata: Metadata = {
  title: "Your Curiosity Pass · Ashmik Ragesh",
  description: "Your stay, your stamps, and a pass to share.",
  robots: { index: false },
};

export default function Page() {
  return (
    <>
      <main className="relative z-10 min-h-screen">
        <PassPage />
      </main>
      <Footer />
    </>
  );
}
