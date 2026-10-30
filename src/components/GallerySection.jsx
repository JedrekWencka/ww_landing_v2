import { useCallback, useEffect, useRef, useState } from "react";

// A strip of small photos. Swipe / scroll sideways, use the arrows, or click a photo to open it big.
export default function GallerySection({ id, kicker, title, copy, photos, alts, openLabel, prevLabel, nextLabel, onOpen }) {
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [thumb, setThumb] = useState({ left: 0, width: 100 });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const width = Math.min(100, (el.clientWidth / el.scrollWidth) * 100);
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    setThumb({ left: max > 0 ? (el.scrollLeft / max) * (100 - width) : 0, width });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let frame = 0;
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [measure]);

  // Move by whole photos: as many as fit on screen.
  const page = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const tiles = el.children;
    const step = tiles.length > 1 ? tiles[1].offsetLeft - tiles[0].offsetLeft : el.clientWidth;
    const fit = Math.max(1, Math.floor(el.clientWidth / step));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step * fit, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section className="gallery-section" id={id}>
      <header className="gallery-head">
        <p className="gallery-kicker">{kicker}</p>
        <h3>{title}</h3>
        <div className="gallery-side">
          <p className="gallery-copy">{copy}</p>
          <div className="carousel-ctrl">
            <button type="button" className="carousel-btn" aria-label={prevLabel} disabled={edge.start} onClick={() => page(-1)}>
              &lt;
            </button>
            <button type="button" className="carousel-btn" aria-label={nextLabel} disabled={edge.end} onClick={() => page(1)}>
              &gt;
            </button>
          </div>
        </div>
      </header>

      <div className="carousel">
        <div className="carousel-track" ref={trackRef} role="group" aria-label={title} tabIndex={0}>
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="tile"
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
        <div className="carousel-bar" aria-hidden="true">
          <span style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }} />
        </div>
      </div>
    </section>
  );
}
