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
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
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
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer style={{
      background: "linear-gradient(160deg,#0a0c14 0%,#080a10 100%)",
      borderTop: "1px solid #1a1d2e",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 0" }}>

        {/* Top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr repeat(3,1fr)",
          gap: 40,
          paddingBottom: 40,
          borderBottom: "1px solid #1a1d2e",
        }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16, textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(124,92,252,0.3)",
              }}>
                <span style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem" }}>N</span>
              </div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#eef2ff" }}>
                Nova<span style={{ color: "#7c5cfc" }}>Cart</span>
              </span>
            </Link>

            <p style={{ color: "#525878", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
              Your modern e-commerce destination. Shop smarter, live better — everything you need, delivered fast.
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 10, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "#13161f", border: "1px solid #1a1d2e",
                    color: "#525878", transition: "all 0.2s", textDecoration: "none",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.color="#7c5cfc";e.currentTarget.style.borderColor="rgba(124,92,252,0.35)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color="#525878";e.currentTarget.style.borderColor="#1a1d2e";}}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {sections.map(section => (
            <div key={section.title}>
              <h4 style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 600,
                fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#eef2ff", marginBottom: 16,
              }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} style={{
                      color: "#525878", fontSize: "0.85rem", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                      onMouseEnter={e=>e.currentTarget.style.color="#c7d2fe"}
                      onMouseLeave={e=>e.currentTarget.style.color="#525878"}
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
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
          gap: 12, padding: "20px 0",
        }}>
          <p style={{ color: "#525878", fontSize: "0.8rem" }}>
            © {year} NovaCart, Inc. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(label => (
              <a key={label} href="#" style={{
                color: "#525878", fontSize: "0.78rem", textDecoration: "none", transition: "color 0.15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.color="#c7d2fe"}
                onMouseLeave={e=>e.currentTarget.style.color="#525878"}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;