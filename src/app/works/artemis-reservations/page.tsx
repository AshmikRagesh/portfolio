import type { Metadata } from "next";
import Image from "next/image";
import CaseStudyLayout, { CaseStudySection } from "@/components/CaseStudyLayout";

export const metadata: Metadata = {
  title: "Artemis Reservations · Ashmik Ragesh",
  description:
    "Streamlining the Reservations Module in Artemis 3.0 — reducing booking edit time by ~25% and eliminating manual saves.",
};

const SECTIONS: CaseStudySection[] = [
  { id: "overview", label: "Overview" },
  { id: "my-role",  label: "My Role"  },
];

// TODO: Replace with a permanent asset — Figma URL expires ~7 days from 2026-04-13
const OVERVIEW_IMAGE =
  "https://www.figma.com/api/mcp/asset/62a80198-9821-4c85-ad76-0136bebab773";

// ─────────────────────────────────────────────────────────────────────────────
// Section: Overview  (text + contained image)
// ─────────────────────────────────────────────────────────────────────────────
function Overview() {
  return (
    <section
      id="overview"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:px-[80px] lg:py-[80px]"
    >
      <div className="flex flex-col gap-10 w-full max-w-[780px]">
        {/* Date annotation */}
        <div className="flex flex-col gap-5">
          <div className="-rotate-3 w-fit">
            <span className="font-handwriting text-[26px] leading-[32px] tracking-[-0.15px] text-[#fa158c] whitespace-nowrap md:text-[28px]">
              {"< 08/11/2024 >"}
            </span>
          </div>

          {/* Title + subtitle */}
          <div className="flex flex-col gap-5">
            <h1 className="font-heading font-normal text-[28px] leading-[1.2] tracking-[-1.12px] text-[#091624] md:text-[34px] md:tracking-[-1.36px] lg:text-[40px] lg:tracking-[-1.6px]">
              Streamlining the Reservations Module in Artemis 3.0: Saving Time
              for Reservations Team
            </h1>
            <p className="font-body font-normal text-[15px] leading-[1.5] text-[#717379] md:text-[17px] lg:text-[18px] lg:leading-[1.6]">
              Migrated the legacy Bookings UI from Artemis 2.0 into Artemis
              3.0—introducing auto‑save, in‑app notifications, categorised
              flights, and &apos;On Request&apos; status—reducing booking edit
              time by ~25% and eliminating manual saves.
            </p>
          </div>
        </div>

        {/* Overview image — contained, not full-bleed */}
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#f0f0f0]">
          <Image
            src={OVERVIEW_IMAGE}
            alt="Artemis 3.0 Reservations Module — overview screenshot"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: My Role
// ─────────────────────────────────────────────────────────────────────────────
function MyRole() {
  const columns = [
    {
      heading: "My Role",
      content: (
        <>
          Conceptualized the product strategy. Led the end-to-end design
          process.
        </>
      ),
    },
    {
      heading: "Timeline",
      content: <>1 Month</>,
    },
    {
      heading: "Team",
      content: (
        <>
          Srishti Mahajan (PM)
          <br />
          Unnikrishnan Manikoth (Design Manager)
        </>
      ),
    },
    {
      heading: "Tools",
      content: (
        <>
          Figma
          <br />
          FigJam
        </>
      ),
    },
  ];

  return (
    <section
      id="my-role"
      className="bg-white px-[20px] py-[60px] md:px-[60px] md:py-[80px] lg:px-[80px] lg:py-[80px]"
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full max-w-[780px] md:gap-x-[48px] lg:grid-cols-4 lg:gap-x-[64px]">
        {columns.map(({ heading, content }) => (
          <div key={heading} className="flex flex-col gap-3">
            <h2 className="font-heading font-normal text-[20px] leading-[1.2] tracking-[-0.8px] text-[#091624] md:text-[22px] md:tracking-[-0.88px] lg:text-[24px] lg:tracking-[-0.96px]">
              {heading}
            </h2>
            <p className="font-body font-normal text-[14px] leading-[22px] text-[#717379] md:text-[16px] md:leading-[24px] lg:text-[18px] lg:leading-[28px]">
              {content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ArtemisReservationsPage() {
  return (
    <CaseStudyLayout sections={SECTIONS} backHref="/#works">
      <Overview />
      <MyRole />
    </CaseStudyLayout>
  );
}
