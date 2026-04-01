const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ashmikragesh",
    bg: "#1d6abd",
    // Full Tailwind class string — must appear literally for JIT to include it
    tiltClass: "group-hover:-rotate-6",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/AshmikRagesh",
    bg: "#12c748",
    tiltClass: "group-hover:rotate-6",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/ashmikragesh",
    bg: "#354454",
    tiltClass: "group-hover:-rotate-3",
    icon: (
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-background p-4 md:p-6 lg:p-[40px]">
      <div className="bg-primary flex flex-col gap-14 items-center px-8 pt-16 pb-24 rounded-2xl w-full md:px-16 md:pt-20 md:pb-32 md:gap-16 lg:gap-[100px] lg:px-[240px] lg:pt-[100px] lg:pb-[200px] lg:rounded-[24px]">

        {/* Header */}
        <div className="flex flex-col gap-4 items-center text-center lg:gap-6">
          <h2 className="font-heading font-medium text-[28px] leading-[1.18] tracking-[-0.28px] text-white md:text-[36px] md:leading-[44px] lg:text-[48px] lg:leading-[50px] lg:tracking-[-0.48px]">
            Making creating easy and
            <br className="hidden md:block" />
            {" "}enjoyable for everyone.
          </h2>
          <p className="font-body font-normal text-[15px] leading-[24px] tracking-[-0.4px] text-[#c8ccd4] max-w-[280px] md:max-w-[500px] md:text-[18px] md:leading-[28px] lg:text-[24px] lg:leading-[32px] lg:tracking-[-0.9px] lg:max-w-full">
            For any work inquiries, please feel free to get in touch with me anytime.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex items-center">
          {socialLinks.map(({ label, href, bg, tiltClass, icon }, i) => (
            <div
              key={label}
              className="group relative"
              style={{
                marginRight: i < socialLinks.length - 1 ? "-4px" : 0,
                zIndex: i + 1,
              }}
            >
              {/* Tooltip */}
              <div
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white text-primary text-[11px] font-brand rounded-md whitespace-nowrap pointer-events-none shadow-md
                  opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150"
              >
                {label}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
              </div>

              {/* Icon button — border flips to white on hover, z lifts above siblings */}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="relative size-[48px] rounded-[12px] border-[0.5px] border-[#c8ccd4] hover:border-white hover:z-10 flex items-center justify-center transition-colors duration-200"
                style={{ background: bg }}
              >
                {/* Icon — scales 115% + tilts on hover */}
                <div
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] ${tiltClass}`}
                >
                  {icon}
                </div>
              </a>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
