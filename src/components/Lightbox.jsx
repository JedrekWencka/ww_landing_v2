import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({ t, alts, photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index];
  const touchX = useRef(null);

  useEffect(() => {
    if (!photo) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, onClose, onPrev, onNext]);

  if (!photo) return null;

  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler();
  };

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.label} onClick={onClose}>
      <button type="button" className="lb-close pill pill-dashed" onClick={stop(onClose)}>
        {t.close}
      </button>
      <button type="button" className="lb-nav lb-prev" aria-label={t.prev} onClick={stop(onPrev)}>
        &lt;
      </button>
      <figure className="lb-figure" onClick={(event) => event.stopPropagation()}>
        <img
          key={photo.src}
          src={photo.src}
          alt={alts[photo.alt]}
          className="lightbox-image"
          onTouchStart={(event) => {
            touchX.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchX.current == null) return;
            const delta = event.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (delta > 40) onPrev();
            if (delta < -40) onNext();
          }}
        />
        <figcaption>
          {alts[photo.alt]}
          <span>
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="lb-nav lb-next" aria-label={t.next} onClick={stop(onNext)}>
        &gt;
      </button>
    </div>,
    document.body,
  );
}
