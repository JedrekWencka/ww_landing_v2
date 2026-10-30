import { useCallback, useState } from "react";
import { albumPhotos, bandPhotos } from "../data/photos.js";
import GallerySection from "./GallerySection.jsx";
import Lightbox from "./Lightbox.jsx";

export default function Gallery({ t }) {
  const [viewer, setViewer] = useState(null);

  const photos = viewer?.kind === "band" ? bandPhotos : albumPhotos;

  const close = useCallback(() => setViewer(null), []);
  const prev = useCallback(() => {
    setViewer((current) => {
      if (!current) return current;
      const list = current.kind === "band" ? bandPhotos : albumPhotos;
      return { ...current, index: (current.index - 1 + list.length) % list.length };
    });
  }, []);
  const next = useCallback(() => {
    setViewer((current) => {
      if (!current) return current;
      const list = current.kind === "band" ? bandPhotos : albumPhotos;
      return { ...current, index: (current.index + 1) % list.length };
    });
  }, []);

  return (
    <section className="gallery" id="gallery">
      <div className="split-head split">
        <h2 className="label">{t.gallery.title}</h2>
        <nav className="gallery-jump" aria-label={t.gallery.jumpLabel}>
          <a className="pill pill-dashed" href="#gallery-records">
            {t.gallery.albumTitle}
          </a>
          <a className="pill pill-dashed" href="#gallery-band">
            {t.gallery.bandTitle}
          </a>
        </nav>
      </div>

      <GallerySection
        id="gallery-records"
        kicker="01"
        title={t.gallery.albumTitle}
        copy={t.gallery.albumCopy}
        alts={t.alt}
        openLabel={t.gallery.open}
        prevLabel={t.gallery.prev}
        nextLabel={t.gallery.next}
        photos={albumPhotos}
        onOpen={(index) => setViewer({ kind: "album", index })}
      />

      <GallerySection
        id="gallery-band"
        kicker="02"
        title={t.gallery.bandTitle}
        copy={t.gallery.bandCopy}
        alts={t.alt}
        openLabel={t.gallery.open}
        prevLabel={t.gallery.prev}
        nextLabel={t.gallery.next}
        photos={bandPhotos}
        onOpen={(index) => setViewer({ kind: "band", index })}
      />

      <Lightbox
        t={t.lightbox}
        alts={t.alt}
        photos={photos}
        index={viewer?.index ?? -1}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </section>
  );
}
