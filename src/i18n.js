// All visible copy, in English and Polish.
// English lives at "/", Polish at "/pl/". Edit texts here.

// Typography: a one-letter word (a, i, o, u, w, z …) must not end a line.
// Glue it to the next word with a non-breaking space, and keep a dash off the start of a line.
const ORPHAN = /(^|[\s(„"])([AaIiOoUuWwZz])\s+/g;

export function noOrphans(text) {
  return text.replace(ORPHAN, "$1$2 ").replace(/\s+—/g, " —");
}

function glue(value) {
  if (typeof value === "string") return noOrphans(value);
  if (Array.isArray(value)) return value.map(glue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, glue(v)]));
  }
  return value;
}

const en = {
  home: "/",
  nav: {
    label: "Primary",
    home: "Home",
    band: "The Band",
    listen: "Listen",
    shop: "Shop",
    tour: "Tour dates",
    gallery: "Gallery",
    contact: "Contact",
    menu: "Menu",
    close: "Close",
  },
  iconsLabel: "Stream and social",
  langLabel: "Language",
  hero: {
    wordmarkAlt: "WHITEWATER",
    ticker: ["Stoner rock", "Grunge", "Heavy rock"],
    // Headline lines; the link follows, then a full stop.
    lead: ["Afterlife", "available now", "on our"],
    leadLink: "Bandcamp store",
    slider: "Featured photos",
    prev: "Previous slide",
    next: "Next slide",
    captions: {
      afterlife: "Afterlife",
      digipack: "Afterlife — digipack",
      band: "WHITEWATER",
      blackfire: "Blackfire",
    },
    coverAlt: "Afterlife album cover by WHITEWATER",
  },
  band: {
    title: "The Band",
    text:
      "WHITEWATER is a four-piece from Greater Poland. Rooted in stoner rock, grunge and heavy rock, the sound is built around massive riffs, tension and dynamics — QOTSA, Kyuss, All Them Witches, Black Sabbath, Alice In Chains.",
    genreLabel: "Genre",
    genre: "Stoner rock, grunge, heavy rock",
    baseLabel: "Based in",
    base: "Greater Poland",
    lineupLabel: "Line-up",
    lineup: "Four-piece",
    influencesLabel: "Influences",
    influences: ["QOTSA", "Kyuss", "All Them Witches", "Black Sabbath", "Alice In Chains"],
    cta: "Listen",
  },
  listen: {
    title: "Listen",
    ticker: ["Afterlife", "Out now"],
    text: "Stream WHITEWATER's music here:",
    cta: "Listen",
    releases: {
      afterlife: { title: "Afterlife", meta: "CD · Digipack", status: "2024" },
      blackfire: { title: "Blackfire", meta: "CD", status: "2019" },
    },
  },
  tour: {
    title: "Tour dates",
    text: "No shows posted yet. Watch this space, or follow the band on socials above.",
  },
  gallery: {
    title: "Gallery",
    jumpLabel: "Gallery sections",
    albumTitle: "Album photos",
    albumCopy: "Afterlife and the earlier Blackfire — sleeves, discs, and the objects themselves.",
    bandTitle: "Band photos",
    bandCopy: "WHITEWATER as a four-piece — live, in the room, and in stills.",
    open: "View",
    prev: "Previous photos",
    next: "Next photos",
  },
  lightbox: {
    label: "Photo",
    prev: "Previous photo",
    next: "Next photo",
    close: "Close",
  },
  contact: {
    title: "Contact",
    email: "Email",
  },
  alt: {
    digipackOpen: "Afterlife CD digipack by WHITEWATER, open with the disc",
    digipackCover: "Afterlife CD digipack by WHITEWATER, front cover",
    digipackInside: "Inside of the Afterlife CD digipack by WHITEWATER",
    afterlifeFront: "Afterlife CD by WHITEWATER, front cover",
    afterlifeBack: "Afterlife CD by WHITEWATER, back cover with the track list",
    afterlifeSpine: "Afterlife CD by WHITEWATER, spine",
    afterlifeInside: "Afterlife CD by WHITEWATER, inside artwork and disc",
    blackfireCover: "Blackfire CD by WHITEWATER, front cover",
    blackfireDisc: "Blackfire CD by WHITEWATER, disc in the case",
    blackfireOpen: "Blackfire CD by WHITEWATER, open case with the disc",
    blackfireSpine: "Blackfire CD by WHITEWATER, spine",
    blackfireBack: "Blackfire CD by WHITEWATER, back cover",
    band: "WHITEWATER, stoner rock band from Poland",
  },
};

const pl = {
  home: "/pl/",
  nav: {
    label: "Menu główne",
    home: "Start",
    band: "Zespół",
    listen: "Posłuchaj",
    shop: "Sklep",
    tour: "Koncerty",
    gallery: "Galeria",
    contact: "Kontakt",
    menu: "Menu",
    close: "Zamknij",
  },
  iconsLabel: "Streaming i media społecznościowe",
  langLabel: "Język",
  hero: {
    wordmarkAlt: "WHITEWATER",
    ticker: ["Stoner rock", "Grunge", "Heavy rock"],
    lead: ["Afterlife", "już do kupienia", "w naszym"],
    leadLink: "sklepie Bandcamp",
    slider: "Wyróżnione zdjęcia",
    prev: "Poprzedni slajd",
    next: "Następny slajd",
    captions: {
      afterlife: "Afterlife",
      digipack: "Afterlife — digipack",
      band: "WHITEWATER",
      blackfire: "Blackfire",
    },
    coverAlt: "Okładka albumu Afterlife zespołu WHITEWATER",
  },
  band: {
    title: "Zespół",
    text:
      "WHITEWATER to czteroosobowy zespół z Wielkopolski. Wyrasta ze stoner rocka, grunge'u i ciężkiego rocka, a jego brzmienie opiera się na potężnych riffach, napięciu i dynamice — QOTSA, Kyuss, All Them Witches, Black Sabbath, Alice In Chains.",
    genreLabel: "Gatunek",
    genre: "Stoner rock, grunge, ciężki rock",
    baseLabel: "Skąd",
    base: "Wielkopolska",
    lineupLabel: "Skład",
    lineup: "Czteroosobowy",
    influencesLabel: "Inspiracje",
    influences: ["QOTSA", "Kyuss", "All Them Witches", "Black Sabbath", "Alice In Chains"],
    cta: "Posłuchaj",
  },
  listen: {
    title: "Posłuchaj",
    ticker: ["Afterlife", "Już dostępny"],
    text: "Muzyka WHITEWATER w serwisach:",
    cta: "Posłuchaj",
    releases: {
      afterlife: { title: "Afterlife", meta: "CD · Digipack", status: "2024" },
      blackfire: { title: "Blackfire", meta: "CD", status: "2019" },
    },
  },
  tour: {
    title: "Koncerty",
    text: "Na razie brak ogłoszonych koncertów. Zaglądaj tu co jakiś czas albo obserwuj zespół w mediach społecznościowych (linki u góry strony).",
  },
  gallery: {
    title: "Galeria",
    jumpLabel: "Sekcje galerii",
    albumTitle: "Zdjęcia płyt",
    albumCopy: "Afterlife i wcześniejszy Blackfire — okładki, płyty i same nośniki.",
    bandTitle: "Zdjęcia zespołu",
    bandCopy: "WHITEWATER w czteroosobowym składzie — na żywo, na próbie i w kadrze.",
    open: "Zobacz",
    prev: "Poprzednie zdjęcia",
    next: "Następne zdjęcia",
  },
  lightbox: {
    label: "Zdjęcie",
    prev: "Poprzednie zdjęcie",
    next: "Następne zdjęcie",
    close: "Zamknij",
  },
  contact: {
    title: "Kontakt",
    email: "E-mail",
  },
  alt: {
    digipackOpen: "Otwarty digipack CD Afterlife zespołu WHITEWATER z płytą",
    digipackCover: "Digipack CD Afterlife zespołu WHITEWATER, przednia okładka",
    digipackInside: "Wnętrze digipacku CD Afterlife zespołu WHITEWATER",
    afterlifeFront: "Płyta CD Afterlife zespołu WHITEWATER, przednia okładka",
    afterlifeBack: "Płyta CD Afterlife zespołu WHITEWATER, tylna okładka z listą utworów",
    afterlifeSpine: "Płyta CD Afterlife zespołu WHITEWATER, grzbiet",
    afterlifeInside: "Płyta CD Afterlife zespołu WHITEWATER, wnętrze okładki i płyta",
    blackfireCover: "Płyta CD Blackfire zespołu WHITEWATER, przednia okładka",
    blackfireDisc: "Płyta CD Blackfire zespołu WHITEWATER w pudełku",
    blackfireOpen: "Płyta CD Blackfire zespołu WHITEWATER, otwarte pudełko z płytą",
    blackfireSpine: "Płyta CD Blackfire zespołu WHITEWATER, grzbiet",
    blackfireBack: "Płyta CD Blackfire zespołu WHITEWATER, tylna okładka",
    band: "WHITEWATER, zespół stoner rockowy z Wielkopolski",
  },
};

export const strings = { en: glue(en), pl: glue(pl) };
export const LANGS = ["en", "pl"];
