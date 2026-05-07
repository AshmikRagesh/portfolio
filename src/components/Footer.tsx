import Image from "next/image"; // used for telephone illustration

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.com/users/ashmikragesh",
    bg: "#67c23a",
    tiltClass: "hover:-rotate-6",
    icon: <img src="/icons/social-discord.svg" alt="Discord" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ashmikragesh",
    bg: "#1f88f9",
    tiltClass: "hover:rotate-6",
    icon: <img src="/icons/social-linkedin.svg" alt="LinkedIn" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/ashmikragesh",
    bg: "#091624",
    tiltClass: "hover:-rotate-3",
    icon: <img src="/icons/social-x.svg" alt="Twitter / X" className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]" />,
  },
];

export default function Footer() {
  return (
    <footer className="sticky bottom-0 bg-background p-4 md:p-6 lg:p-[40px]">
      <div className="bg-primary relative flex flex-col gap-[60px] items-center px-8 pt-16 pb-16 rounded-[24px] overflow-hidden md:px-16 md:pt-20 md:pb-24 md:gap-[72px] lg:px-[240px] lg:pt-[100px] lg:pb-[80px] lg:gap-[100px] lg:rounded-[40px]">

        {/* Telephone illustration — desktop only */}
        <div className="hidden lg:block absolute top-0 right-0 w-[315px] h-[510px] pointer-events-none select-none">
          <Image
            src="/images/footer-telephone.png"
            alt=""
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 items-center text-center relative z-10 lg:gap-6">
          <h2 className="font-heading font-medium text-[28px] leading-[1.18] tracking-[-0.28px] text-white md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.44px]">
            Making creating easy and
            <br className="hidden md:block" />
            {" "}enjoyable for everyone.
          </h2>
          <p className="font-body font-normal text-[15px] leading-[24px] text-muted max-w-[280px] md:max-w-[500px] md:text-[18px] md:leading-[28px] lg:text-[22px] lg:leading-[32px] lg:max-w-[506px]">
            For any work inquiries, please feel free to get in touch with me anytime.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex items-center relative z-10">
          {socialLinks.map(({ label, href, bg, tiltClass, icon }, i) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`size-[44px] md:size-[57px] rounded-full border border-[#f2f2f2] flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.18] ${tiltClass}`}
              style={{
                background: bg,
                marginRight: i < socialLinks.length - 1 ? "-4px" : 0,
                zIndex: i + 1,
                position: "relative",
              }}
            >
              {icon}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="font-body font-normal text-[14px] leading-[24px] text-muted tracking-[-0.5px] text-center relative z-10 md:text-[16px] lg:tracking-[-0.9px]">
          Designed + Coded with ❤︎ by Ashmik
        </p>

      </div>
    </footer>
  );
}
