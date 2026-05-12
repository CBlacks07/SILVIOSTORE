"use client";

type Props = { name: string; logo_url: string | null };

export function BrandLogo({ name, logo_url }: Props) {
  return (
    <div
      className="group flex flex-col items-center gap-3 cursor-default"
    >
      {logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo_url}
          alt={name}
          loading="lazy"
          className="h-20 w-auto object-contain transition-all duration-300"
          style={{ filter: "grayscale(1) opacity(0.45)" }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "grayscale(0) opacity(1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = "grayscale(1) opacity(0.45)"; }}
        />
      ) : (
        <span className="text-2xl font-bold tracking-tight text-brand-300 transition duration-300 group-hover:text-brand-950 md:text-3xl">
          {name}
        </span>
      )}
      <span className="text-xs text-brand-400 transition group-hover:text-brand-600">{name}</span>
    </div>
  );
}
