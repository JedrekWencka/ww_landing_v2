import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Band from "./components/Band.jsx";
import Listen from "./components/Listen.jsx";
import Tour from "./components/Tour.jsx";
import Gallery from "./components/Gallery.jsx";
import Contact from "./components/Contact.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import { strings } from "./i18n.js";

export default function App({ lang = "en" }) {
  const t = strings[lang] ?? strings.en;
  return (
    <>
      <Header t={t} lang={lang} />
      <main>
        <Hero t={t} />
        <Band t={t} />
        <Listen t={t} />
        <Tour t={t} />
        <Gallery t={t} />
      </main>
      <Contact t={t} lang={lang} />
      <CookieBanner t={t} />
    </>
  );
}
