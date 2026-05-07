import Image from "next/image";

const socialLinks = [
  {
    label: "Discord",
    href: "https://discord.com/users/ashmikragesh",
    bg: "#67c23a",
    tiltClass: "hover:-rotate-6",
    icon: (
      <svg className="w-[25px] h-[25px] text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963a.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ashmikragesh",
    bg: "#1f88f9",
    tiltClass: "hover:rotate-6",
    icon: (
      <svg className="w-[25px] h-[25px] text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/ashmikragesh",
    bg: "#091624",
    tiltClass: "hover:-rotate-3",
    icon: (
      <svg className="w-[25px] h-[25px] text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-background p-4 md:p-6 lg:p-[40px]">
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
              className={`size-[57px] rounded-full border border-[#f2f2f2] flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.18] ${tiltClass}`}
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
