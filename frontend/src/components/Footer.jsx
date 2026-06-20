import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: "About",
      links: [
        { label: "About NovaCart", to: "/" },
        { label: "Our Story", to: "/" },
        { label: "Careers", to: "/" },
        { label: "Press", to: "/" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", to: "/contact" },
        { label: "Returns & Refunds", to: "/contact" },
        { label: "Shipping Info", to: "/contact" },
        { label: "Track Order", to: "/contact" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "support@novacart.com", to: "/contact" },
        { label: "+1 (800) 123-4567", to: "/contact" },
        { label: "Live Chat", to: "/contact" },
        { label: "Community Forum", to: "/contact" },
      ],
    },
  ];

  const socials = [
    {
      label: "Twitter",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
    },
    {
      label: "GitHub",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
    },
  ];

  const trustBadges = [
    {
      label: "Secure Payments",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      label: "Fast Delivery",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      label: "Easy Returns",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      ),
    },
    {
      label: "24/7 Support",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0a0c14] to-[#070810] border-t border-[#1a1d2e] mt-auto overflow-hidden">
      {/* subtle top accent glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.6), transparent)" }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trust badges strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-6 sm:py-8 border-b border-[#1a1d2e]">
          {trustBadges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#0d0f1a]/60 border border-[#13161f]"
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgba(124,92,252,0.1)] text-[#7c5cfc]">
                {b.icon}
              </span>
              <span className="text-[#9aa0bf] text-[0.74rem] sm:text-[0.8rem] font-medium leading-tight">
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-6 gap-y-10 sm:gap-x-10 py-10 sm:py-12 border-b border-[#1a1d2e]">

          {/* Brand — full width on mobile/tablet, first column on desktop */}
          <div className="col-span-2 lg:col-span-1 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 no-underline">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#7c5cfc] to-[#3b82f6] flex items-center justify-center shadow-[0_0_16px_rgba(124,92,252,0.35)] flex-shrink-0">
                <span className="text-white font-['Syne',sans-serif] font-bold text-base">N</span>
              </div>
              <span className="font-['Syne',sans-serif] font-bold text-xl text-[#eef2ff]">
                Nova<span className="text-[#7c5cfc]">Cart</span>
              </span>
            </Link>

            <p className="text-[#6b7195] text-[0.85rem] leading-relaxed max-w-[320px] mb-6">
              Your modern e-commerce destination. Shop smarter, live better — everything you need, delivered fast.
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#0d0f1a] border border-[#1a1d2e] text-[#6b7195] no-underline transition-all duration-200 hover:text-[#a78bfa] hover:border-[rgba(124,92,252,0.4)] hover:bg-[rgba(124,92,252,0.08)]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h4 className="font-['Syne',sans-serif] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-[#eef2ff] mb-4 relative inline-block">
                {section.title}
                <span className="absolute -bottom-1.5 left-0 w-5 h-[2px] rounded-full bg-[#7c5cfc]" />
              </h4>
              <ul className="list-none flex flex-col gap-2.5 mt-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[#6b7195] text-[0.83rem] no-underline transition-colors duration-200 hover:text-[#c7d2fe] break-words inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-center sm:text-left">
          <p className="text-[#525878] text-[0.78rem] order-2 sm:order-1">
            © {year} NovaCart, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 order-1 sm:order-2">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label) => (
              <a
                key={label}
                href="#"
                className="text-[#525878] text-[0.76rem] no-underline transition-colors duration-200 hover:text-[#c7d2fe]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;