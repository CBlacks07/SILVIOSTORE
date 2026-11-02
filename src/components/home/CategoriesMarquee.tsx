"use client";

import Link from "next/link";

type Category = { slug: string; name: string };

export function CategoriesMarquee({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={"/catalogue?categorie=" + c.slug}
          className="group"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            whiteSpace: "nowrap",
            background: i % 3 === 0
              ? "linear-gradient(135deg, rgba(217,119,6,0.10), rgba(217,119,6,0.04))"
              : "rgba(26,16,8,0.03)",
            color: "#1a1008",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            border: "1.5px solid",
            borderColor: i % 3 === 0 ? "rgba(217,119,6,0.40)" : "rgba(26,16,8,0.12)",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
          }}
          onMouseOver={(e) => {
            const el = e.currentTarget;
            el.style.background = "linear-gradient(135deg, #d97706, #b45309)";
            el.style.color = "#fff";
            el.style.borderColor = "#d97706";
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = "0 6px 20px rgba(217,119,6,0.25)";
          }}
          onMouseOut={(e) => {
            const el = e.currentTarget;
            el.style.background = i % 3 === 0
              ? "linear-gradient(135deg, rgba(217,119,6,0.10), rgba(217,119,6,0.04))"
              : "rgba(26,16,8,0.03)";
            el.style.color = "#1a1008";
            el.style.borderColor = i % 3 === 0 ? "rgba(217,119,6,0.40)" : "rgba(26,16,8,0.12)";
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: i % 3 === 0 ? "#d97706" : "rgba(26,16,8,0.25)",
              flexShrink: 0,
              transition: "background 0.22s ease",
            }}
          />
          {c.name}
        </Link>
      ))}
    </div>
  );
}
