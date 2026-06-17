"use client";

import Link from "next/link";

type Category = { slug: string; name: string };

export function CategoriesMarquee({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={"/catalogue?categorie=" + c.slug}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            whiteSpace: "nowrap",
            background: "transparent",
            color: "#1a1008",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            border: "1.5px solid rgba(217,119,6,0.45)",
            borderRadius: "4px",
            textDecoration: "none",
            transition: "background .2s, color .2s, border-color .2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#d97706";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#d97706";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#1a1008";
            e.currentTarget.style.borderColor = "rgba(217,119,6,0.45)";
          }}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
