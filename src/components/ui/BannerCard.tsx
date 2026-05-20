import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  link_url?: string | null;
};

export function BannerCard({ banner }: { banner: Banner }) {
  const inner = (
    <div
      style={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#1a1008",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        cursor: banner.link_url ? "pointer" : "default",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease",
      }}
      className="banner-card-hover"
    >
      <style>{`
        .banner-card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.30) !important; }
      `}</style>

      {/* Image — 60% height */}
      <div style={{ position: "relative", width: "100%", paddingTop: "62%", overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        {banner.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.image_url}
            alt={banner.title}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.30)" }}>Aucune image</span>
          </div>
        )}
        {/* Gradient overlay bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(26,16,8,0.85), transparent)", pointerEvents: "none" }} />
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.25 }}>
          {banner.title}
        </h3>
        {banner.subtitle && (
          <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.75)", margin: "0 0 16px", lineHeight: 1.5 }}>
            {banner.subtitle}
          </p>
        )}

        {/* CTA Button */}
        {banner.cta_label && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #d97706, #f59e0b)",
            color: "#fff", borderRadius: "999px",
            padding: "10px 20px", fontSize: "13px", fontWeight: 700,
            boxShadow: "0 4px 16px rgba(217,119,6,0.35)",
          }}>
            {banner.cta_label}
            <ArrowRight size={14} />
          </div>
        )}
      </div>
    </div>
  );

  if (banner.link_url) {
    return <Link href={banner.link_url} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
  }
  return <div>{inner}</div>;
}
