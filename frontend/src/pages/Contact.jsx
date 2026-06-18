import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const T = {
  bg:       "#080a10",
  surface:  "#0d1017",
  border:   "#1c2030",
  text:     "#eef2ff",
  muted:    "#4a5070",
  accent:   "#7c5cfc",
  accentLo: "rgba(124,92,252,0.10)",
  accentRg: "rgba(124,92,252,0.22)",
  success:  "#22c55e",
  danger:   "#ef4444",
};

const inputBase = {
  background: "rgba(8,10,16,0.7)",
  border: `1px solid ${T.border}`,
  color: T.text,
  borderRadius: 10,
  width: "100%",
  fontSize: "0.875rem",
  padding: "11px 14px",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const focusOn  = e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentLo}`; };
const focusOff = e => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = "none"; };

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
      background: T.accentLo, border: `1px solid ${T.accentRg}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: T.muted, fontSize: "0.7rem", fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ color: T.text, fontSize: "0.86rem", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{value}</p>
    </div>
  </div>
);

const Contact = () => {
  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [locState, setLocState] = useState("idle"); // idle | loading | granted | denied
  const [userCity, setUserCity] = useState("");

  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markerRef  = useRef(null);

  /* Load Leaflet CSS + JS once */
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      // already loaded, just init map
      if (window.L) initMap(11.6643, 78.1460);
      return;
    }
    const link  = document.createElement("link");
    link.id     = "leaflet-css";
    link.rel    = "stylesheet";
    link.href   = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script  = document.createElement("script");
    script.src    = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => initMap(11.6643, 78.1460);
    document.head.appendChild(script);
  }, []);

  const initMap = (lat, lng) => {
    if (!mapRef.current || leafletRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lng], 10);
    leafletRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    /* Dark tile — CartoDB Dark Matter */
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: '&copy; <a href="https://carto.com/">CARTO</a>', subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    /* Store HQ marker */
    const storeIcon = L.divIcon({
      className: "",
      html: `<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#7c5cfc,#3b82f6);border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 16px rgba(124,92,252,0.5);"></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    L.marker([11.6643, 78.1460], { icon: storeIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:'DM Sans',sans-serif;padding:4px 2px;min-width:160px"><strong style="color:#7c5cfc;font-size:0.85rem">🏪 NovaCart HQ</strong><br/><span style="color:#888;font-size:0.78rem">Salem, Tamil Nadu</span></div>`)
      .openPopup();
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported by your browser");
    setLocState("loading");

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocState("granted");

        /* Reverse geocode */
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const state = data.address?.state || "";
          setUserCity(city ? `${city}, ${state}` : state);
        } catch { setUserCity(""); }

        /* Drop user pin */
        const L = window.L;
        if (!L || !leafletRef.current) return;

        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 0 0 6px rgba(34,197,94,0.2);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng], { icon: userIcon })
          .addTo(leafletRef.current)
          .bindPopup(`<div style="font-family:'DM Sans',sans-serif;padding:4px 2px"><strong style="color:#22c55e">📍 You are here</strong></div>`)
          .openPopup();

        /* Fit both markers */
        leafletRef.current.fitBounds(
          L.latLngBounds([[11.6643, 78.1460], [lat, lng]]),
          { padding: [60, 60] }
        );

        toast.success("Location found!", {
          style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1c2030" },
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        });
      },
      err => {
        setLocState("denied");
        toast.error(err.code === 1 ? "Location permission denied." : "Couldn't get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill all required fields");
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1300));
      toast.success("Message sent!", {
        style: { background: "#13161e", color: "#e2e8f0", border: "1px solid #1c2030" },
        iconTheme: { primary: "#22c55e", secondary: "#fff" },
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch { toast.error("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>

      {/* Hero */}
      <section style={{
        padding: "112px 24px 56px",
        background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,252,0.09) 0%, transparent 65%)`,
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 9999, marginBottom: 20,
          background: T.accentLo, border: `1px solid ${T.accentRg}`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.success }} />
          <span style={{ color: T.accent, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            We're online — avg response 2–4 hrs
          </span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(2rem,5vw,3.25rem)", color: T.text, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
          Let's Build Something{" "}
          <span style={{ background: "linear-gradient(135deg,#7c5cfc,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Great
          </span>
        </h1>
        <p style={{ color: T.muted, fontSize: "1rem", maxWidth: 480, margin: "0 auto", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
          Got a question, feedback, or partnership idea? We'd love to hear from you.
        </p>
      </section>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "flex-start" }} className="contact-grid">

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "linear-gradient(160deg,#0d1017,#080a10)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.text, fontSize: "0.95rem", margin: "0 0 18px" }}>Contact Info</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <InfoRow icon={<svg width={16} height={16} fill="none" stroke={T.accent} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} label="Email" value="support@novacart.io" />
                <InfoRow icon={<svg width={16} height={16} fill="none" stroke={T.accent} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} label="HQ Location" value="Salem, Tamil Nadu, India" />
                <InfoRow icon={<svg width={16} height={16} fill="none" stroke={T.accent} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Hours" value="Mon – Sat · 9AM – 7PM IST" />
                <InfoRow icon={<svg width={16} height={16} fill="none" stroke={T.accent} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} label="Response Time" value="Usually within 2–4 hours" />
              </div>
            </div>

            <div style={{ background: "linear-gradient(160deg,#0d1017,#080a10)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.text, fontSize: "0.95rem", margin: "0 0 14px" }}>How can we help?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: "📦", text: "Order & delivery support" },
                  { icon: "🔍", text: "Product inquiries" },
                  { icon: "🤝", text: "Partnership requests" },
                  { icon: "🛠", text: "Technical issues" },
                  { icon: "💳", text: "Payments & refunds" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ color: T.muted, fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "linear-gradient(160deg,#0d1017,#080a10)", border: `1px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: T.text, margin: "0 0 4px" }}>Send us a message</h2>
              <p style={{ color: T.muted, fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>We read every message and respond personally.</p>
            </div>

            {sent && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, marginBottom: 20, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <svg width={16} height={16} fill="none" stroke={T.success} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span style={{ color: T.success, fontSize: "0.85rem", fontFamily: "'DM Sans', sans-serif" }}>Message sent! We'll be in touch soon.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-row">
                {[
                  { name: "name",  label: "Full Name",     type: "text",  placeholder: "John Doe",        required: true },
                  { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com", required: true },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: "block", color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      {f.label} {f.required && <span style={{ color: T.danger }}>*</span>}
                    </label>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputBase} onFocus={focusOn} onBlur={focusOff} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: "block", color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g., Order issue, Feedback…" style={inputBase} onFocus={focusOn} onBlur={focusOff} />
              </div>

              <div>
                <label style={{ display: "block", color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Message <span style={{ color: T.danger }}>*</span>
                </label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us what's on your mind…" rows={6} style={{ ...inputBase, resize: "vertical", minHeight: 130 }} onFocus={focusOn} onBlur={focusOff} />
                <p style={{ color: T.muted, fontSize: "0.72rem", fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>{form.message.length} characters</p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px 24px", borderRadius: 11,
                background: loading ? T.surface : "linear-gradient(135deg,#7c5cfc,#3b82f6)",
                color: loading ? T.muted : "#fff",
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.9rem",
                border: loading ? `1px solid ${T.border}` : "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.2s",
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading
                  ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: T.muted, animation: "spin 0.7s linear infinite" }} />Sending…</>
                  : <><svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Message</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div style={{ marginTop: 24, background: "linear-gradient(160deg,#0d1017,#080a10)", border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>

          {/* Map header */}
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: T.text, fontSize: "0.95rem", margin: "0 0 3px" }}>Find Us</p>
              <p style={{ color: T.muted, fontSize: "0.8rem", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                NovaCart HQ · Salem, Tamil Nadu, India
                {userCity && <span style={{ color: T.success, marginLeft: 8 }}>· You: {userCity}</span>}
              </p>
            </div>

            <button
              onClick={detectLocation}
              disabled={locState === "loading"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 9,
                background: locState === "granted" ? "rgba(34,197,94,0.12)" : locState === "denied" ? "rgba(239,68,68,0.10)" : T.accentLo,
                border: `1px solid ${locState === "granted" ? "rgba(34,197,94,0.25)" : locState === "denied" ? "rgba(239,68,68,0.2)" : T.accentRg}`,
                color: locState === "granted" ? T.success : locState === "denied" ? T.danger : T.accent,
                fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                cursor: locState === "loading" ? "wait" : "pointer", transition: "opacity 0.2s",
              }}
            >
              {locState === "loading" && <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(124,92,252,0.3)", borderTopColor: T.accent, animation: "spin 0.7s linear infinite" }} />Detecting…</>}
              {locState === "idle"    && <><svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Show my location</>}
              {locState === "granted" && <><svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Location found</>}
              {locState === "denied"  && <><svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Permission denied</>}
            </button>
          </div>

          {/* Legend */}
          <div style={{ padding: "10px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50% 50% 50% 0", background: "linear-gradient(135deg,#7c5cfc,#3b82f6)", transform: "rotate(-45deg)" }} />
              <span style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>NovaCart HQ</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: T.success, boxShadow: "0 0 0 4px rgba(34,197,94,0.2)" }} />
              <span style={{ color: T.muted, fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>Your location</span>
            </div>
          </div>

          {/* Leaflet map */}
          <div ref={mapRef} style={{ width: "100%", height: 380 }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .form-row { grid-template-columns: 1fr !important; } }
        .leaflet-popup-content-wrapper { background: #0d1017 !important; border: 1px solid #1c2030 !important; border-radius: 10px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; color: #eef2ff !important; }
        .leaflet-popup-tip { background: #0d1017 !important; }
        .leaflet-popup-close-button { color: #4a5070 !important; }
        .leaflet-control-attribution { background: rgba(8,10,16,0.8) !important; color: #4a5070 !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: #7c5cfc !important; }
        .leaflet-bar a { background: #0d1017 !important; border-color: #1c2030 !important; color: #eef2ff !important; }
        .leaflet-bar a:hover { background: #13161f !important; }
      `}</style>
    </div>
  );
};

export default Contact;