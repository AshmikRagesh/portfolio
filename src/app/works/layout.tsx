import ReelPlayer from "@/components/ReelPlayer";

export default function WorksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ReelPlayer />
    </>
  );
}
