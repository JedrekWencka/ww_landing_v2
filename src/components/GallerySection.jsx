import { useEffect, useRef } from "react";

export default function GallerySection({ id, kicker, title, copy, photos, alts, openLabel, featured = [], onOpen }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const tiles = [...root.querySelectorAll(".tile")];

    const reveal = (tile) => {
      tile.classList.add("is-in");
    };

    const inView = (tile) => {
      const rect = tile.getBoundingClientRect();
      return rect.bottom > 40 && rect.top < window.innerHeight - 40;
    };

    tiles.forEach((tile) => {
      if (inView(tile)) reveal(tile);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "80px 0px" },
    );

    tiles.forEach((tile) => {
      if (!tile.classList.contains("is-in")) observer.observe(tile);
    });

    const onScroll = () => {
      tiles.forEach((tile) => {
        if (!tile.classList.contains("is-in") && inView(tile)) {
          reveal(tile);
          observer.unobserve(tile);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const safety = window.setTimeout(() => tiles.forEach(reveal), 1200);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(safety);
    };
  }, [photos]);

  return (
    <section className="gallery-section" id={id} ref={rootRef}>
      <header className="gallery-head">
        <p className="gallery-kicker">{kicker}</p>
        <h3>{title}</h3>
        <p className="gallery-copy">{copy}</p>
      </header>
      <div className="mosaic">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            className={`tile${featured.includes(index) ? " tile-wide" : ""}`}
            style={{ "--delay": `${Math.min(index, 12) * 55}ms` }}
            onClick={() => onOpen(index)}
            aria-label={`${openLabel}: ${alts[photo.alt]}`}
          >
            <img src={photo.src} alt={alts[photo.alt]} loading="lazy" decoding="async" />
            <span className="tile-over" aria-hidden="true">
              <span className="pill pill-dashed pill-ghost">{openLabel}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
