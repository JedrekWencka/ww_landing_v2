import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Band from "./components/Band.jsx";
import Listen from "./components/Listen.jsx";
import Tour from "./components/Tour.jsx";
import Gallery from "./components/Gallery.jsx";
import Contact from "./components/Contact.jsx";
import Shop from "./components/Shop.jsx";
import Legal from "./components/Legal.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import { strings } from "./i18n.js";

export default function App({ lang = "en", page = "home" }) {
  const t = strings[lang] ?? strings.en;
  return (
    <>
      <Header t={t} lang={lang} page={page} />
      <main className={page === "home" ? undefined : "page-inner"}>
        {page === "home" && (
          <>
            <Hero t={t} />
            <Band t={t} />
            <Listen t={t} />
            <Tour t={t} />
            <Gallery t={t} />
          </>
        )}
        {page === "shop" && <Shop t={t} lang={lang} />}
        {["terms", "privacy", "returns"].includes(page) && <Legal id={page} t={t} lang={lang} />}
      </main>
      <Contact t={t} lang={lang} page={page} />
      <CookieBanner t={t} />
    </>
  );
}
