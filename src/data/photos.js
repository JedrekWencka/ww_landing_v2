// `alt` is a key into strings[lang].alt (src/i18n.js).
const album = (file, alt) => ({ src: `/gallery/album/${file}`, alt });
const band = (file) => ({ src: `/gallery/band/${file}`, alt: "band" });

export const albumPhotos = [
  album("Digipack_Mockup_2.jpg", "digipackOpen"),
  album("Digipack_Mockup_3.jpg", "digipackCover"),
  album("Digipack_Mockup_4a.jpg", "digipackOpen"),
  album("Digipack_Mockup_5.jpg", "digipackInside"),
  album("IMG_6029.jpg", "afterlifeBack"),
  album("IMG_6030.jpg", "afterlifeSpine"),
  album("IMG_6034.jpg", "afterlifeInside"),
  album("IMG_6035.jpg", "afterlifeFront"),
  album("IMG_6036.jpg", "afterlifeBack"),
  album("FullSizeRender.jpg", "blackfireCover"),
  album("FullSizeRender_1.jpg", "blackfireOpen"),
  album("IMG_20190220_113840.jpg", "blackfireCover"),
  album("IMG_20190220_132638.jpg", "blackfireDisc"),
  album("IMG_20190220_132706.jpg", "blackfireOpen"),
  album("Snapseed.jpg", "blackfireDisc"),
  album("Snapseed_1.jpg", "blackfireOpen"),
  album("Snapseed_2.jpg", "blackfireSpine"),
  album("Snapseed_3.jpg", "blackfireBack"),
];

export const bandPhotos = [
  "IMG_0459.jpg",
  "IMG_0462.jpg",
  "IMG_0463.jpg",
  "IMG_0479.jpg",
  "IMG_0480.jpg",
  "IMG_0487.jpg",
  "_MG_5347.jpg",
  "_MG_5366.jpg",
  "_MG_5526.jpg",
  "_MG_5542.jpg",
].map(band);
