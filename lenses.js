/*
 * Lazy Camera — справочник по оптике. Данные можно править здесь.
 *
 * Все значения — из официальных источников производителей (ссылки в SOURCES,
 * у каждой линейки поле src). Если производитель не публикует значение, стоит null
 * и в интерфейсе показывается «н/д».
 *
 * Модель:
 *   series = { id, sec: "s16"|"s35"|"ff"|"ana", brand, name, mount,
 *              ic: диаметр пятна, мм,
 *              icType: "circle" — производитель указывает диаметр круга изображения;
 *                      "format" — производитель указывает только формат кадра (ic = его диагональ),
 *              icNote: как это сформулировано у производителя,
 *              sq: коэффициент анаморфота (только для sec "ana"),
 *              mod: от чего меряется МДФ ("sensor" — от плоскости сенсора / кадра; null — не указано),
 *              src: [ключи SOURCES], notes: [],
 *              lenses: [ [фокусное мм, T, МДФ м, Ø передней части мм, вес кг, {note, ic}] ] }
 *   Ø передней части — диаметр под накидной (clamp-on) компендиум / переходное кольцо.
 */
(function () {
  "use strict";

  const SOURCES = {
    "arri-sp": { t: "ARRI — Signature Prime, Technical Data", u: "https://www.arri.com/en/cine-lenses/signature-lenses/signature-primes-zooms/signature-primes/technical-data-signature-prime" },
    "arri-sig-broch": { t: "ARRI — Signature Lens Brochure (PDF, 10/2021): «46.3 mm image circle»", u: "https://www.arri.com/resource/blob/225644/c83fcb0e41b5a241e75cdc399ade586e/signature-brochure-data.pdf" },
    "arri-mp": { t: "ARRI — Master Prime, Technical Data", u: "https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/master-primes/master-primes/arri-master-prime-technical-data" },
    "arri-mp-broch": { t: "ARRI — Master Prime Lenses Brochure (PDF, 04/2011): ID 31,14 мм", u: "https://www.arri.com/resource/blob/178208/eb2ae4f712451cd1e0036a646057c888/master-prime-lenses-brochure-data.pdf" },
    "arri-up": { t: "ARRI — Ultra Prime, Technical Data", u: "https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/legacy/ultra-prime-lenses/arri-ultra-prime-lenses-technical-data" },
    "arri-ma": { t: "ARRI — Master Anamorphic, Technical Data", u: "https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/master-anamorphics/arri-master-anamorphic-technical-data" },
    "arri-ma-sheets": { t: "ARRI — Master Anamorphic Data Sheets (PDF): Image Diameter 29,26 мм", u: "https://www.arri.com/resource/blob/178216/d6fa949dec02494bd9f7e3ee46069aa8/master-anamorhic-data-sheets-data.pdf" },
    "arri-u16": { t: "ARRI — Ultra 16 Product Brochure (PDF, K5.40457.0, 04/2008; копия на rec-roma.com)", u: "https://rec-roma.com/pdf/lenses/zeiss/2008_03-25_Ultra_16_Brochure.pdf" },
    "zeiss-sp": { t: "ZEISS — Supreme Prime, Technical Data", u: "https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/supreme-prime-lenses.html" },
    "zeiss-sp-broch": { t: "ZEISS — SZR, SPR, SP Specifications (PDF на zeiss.com, FDTimes 11/2024): Image Diagonal 46,3 мм", u: "https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/brochure-fd-times-zeiss-supreme-zoom-radiance.pdf" },
    "zeiss-cp3": { t: "ZEISS — Compact Prime CP.3, Technical Data", u: "https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/compact-prime-cp-3-lenses.html" },
    "zeiss-cp3-broch": { t: "ZEISS — CP.3 Brochure (PDF): «Coverage up to 46.3 mm image circle»", u: "https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/brochure-zeiss-compact-prime-cp3-lenses.pdf" },
    "zeiss-horizon": { t: "ZEISS — Horizon Anamorphic, Technical Data", u: "https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/horizon-anamorphic-lenses.html" },
    "cooke-s4": { t: "Cooke — S4/i S35 Specification (PDF, 030623)", u: "https://cookeoptics.com/wp-content/uploads/2021/11/COOKE_S4i_Specification_030623.pdf" },
    "cooke-s4ff": { t: "Cooke — S4 FF/i Specification (PDF, 101926)", u: "https://cookeoptics.com/wp-content/uploads/2026/10/COOKE_S4-FF-i_Specification_101926.pdf" },
    "cooke-s7": { t: "Cooke — S7/i FF Specification (PDF, 030623)", u: "https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_S7i_Specification_030623.pdf" },
    "cooke-pan35": { t: "Cooke — Panchro/i Classic S35 Specification (PDF, 030623)", u: "https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Panchro-i-Classic-S35_Specification_030623.pdf" },
    "cooke-panff": { t: "Cooke — Panchro/i Classic FF Specification (PDF, 051324)", u: "https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Panchro-i-Classic-FF_Specification_051324.pdf" },
    "cooke-ana35": { t: "Cooke — Anamorphic/i S35 Specification (PDF, 030623)", u: "https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Anamorphic-i-S35_Specification_030623.pdf" },
    "cooke-anaff": { t: "Cooke — Anamorphic/i Full Frame Plus Specification (PDF, 030623)", u: "https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Anamorphic-i-Full-Frame_Specification_030623.pdf" },
    "leitz-slx": { t: "Leitz Cine — SUMMILUX-C", u: "https://www.leitz-cine.com/product/summilux-c" },
    "leitz-scr": { t: "Leitz Cine — SUMMICRON-C", u: "https://www.leitz-cine.com/product/summicron-c" },
    "leitz-prime": { t: "Leitz Cine — LEITZ PRIME", u: "https://www.leitz-cine.com/product/leitz-prime" },
    "leitz-thalia": { t: "Leitz Cine — THALIA", u: "https://www.leitz-cine.com/product/thalia" },
    "sigma-ffhs": { t: "SIGMA — Cine FF High Speed Prime Line (страницы объективов, PL)", u: "https://www.sigma-global.com/en/cine-lenses/ff-high-speed-prime/50_15/" },
    "atlas-orion": { t: "Atlas Lens Co. — Orion Series Anamorphic", u: "https://atlaslensco.com/products/orion-series-anamorphic-lenses" }
  };

  const SERIES = [
    // ───────────── Super 16 ─────────────
    {
      id: "arri-ultra16", sec: "s16", brand: "ARRI / ZEISS", name: "Ultra 16", mount: "PL",
      ic: 14.45, icType: "format", icNote: "ARRI: все объективы покрывают полный кадр Super 16 (12,35 × 7,5 мм, диагональ 14,45 мм)",
      mod: "sensor", src: ["arri-u16"],
      notes: ["Снята с производства, встречается в прокате.", "Длина у всех — 91,6 мм от байонета."],
      lenses: [
        [6, 1.3, 0.20, 95, 1.0], [8, 1.3, 0.30, 95, 1.0], [9.5, 1.3, 0.30, 95, 1.0], [12, 1.3, 0.30, 95, 1.0],
        [14, 1.3, 0.30, 95, 1.0], [18, 1.3, 0.30, 95, 1.2], [25, 1.3, 0.30, 95, 1.2], [35, 1.3, 0.35, 95, 1.1], [50, 1.3, 0.40, 95, 1.2]
      ]
    },

    // ───────────── Super 35 ─────────────
    {
      id: "arri-mp", sec: "s35", brand: "ARRI / ZEISS", name: "Master Prime", mount: "PL LDS",
      ic: 31.14, icType: "circle", icNote: "ARRI: рассчитаны на Image Diameter 31,14 мм (ANSI Super 35)",
      mod: "sensor", src: ["arri-mp", "arri-mp-broch"],
      notes: ["12 мм и 150 мм поставляются с опорой (support post)."],
      lenses: [
        [12, 1.3, 0.40, 156, 2.9], [14, 1.3, 0.35, 114, 2.4], [16, 1.3, 0.35, 114, 2.2], [18, 1.3, 0.35, 114, 2.2],
        [21, 1.3, 0.35, 114, 2.4], [25, 1.3, 0.35, 114, 2.6], [27, 1.3, 0.35, 114, 2.2], [32, 1.3, 0.35, 114, 2.3],
        [35, 1.3, 0.35, 114, 2.2], [40, 1.3, 0.40, 114, 2.3], [50, 1.3, 0.50, 114, 2.7], [65, 1.3, 0.65, 114, 2.6],
        [75, 1.3, 0.80, 114, 2.8], [100, 1.3, 1.00, 114, 2.9], [135, 1.3, 0.95, 114, 2.8], [150, 1.3, 1.50, 134, 4.0]
      ]
    },
    {
      id: "arri-up", sec: "s35", brand: "ARRI / ZEISS", name: "Ultra Prime", mount: "PL",
      ic: 31.14, icType: "format", icNote: "ARRI указывает формат ANSI Super 35 (24,9 × 18,7 мм, диагональ 31,14 мм), а не диаметр круга",
      mod: "sensor", src: ["arri-up"],
      notes: ["Линейка в разделе Legacy у ARRI. 10 мм на текущей странице ARRI не приводится.", "8R — ректилинейный сверхширокоугольник."],
      lenses: [
        [8, 2.8, 0.35, 134, 2.0, { note: "8R" }], [12, 2, 0.30, 156, 2.0], [14, 1.9, 0.22, 114, 1.8], [16, 1.9, 0.25, 95, 1.2],
        [20, 1.9, 0.28, 95, 1.2], [24, 1.9, 0.30, 95, 1.0], [28, 1.9, 0.28, 95, 1.0], [32, 1.9, 0.35, 95, 1.1],
        [40, 1.9, 0.38, 95, 1.0], [50, 1.9, 0.60, 95, 1.0], [65, 1.9, 0.65, 95, 1.1], [85, 1.9, 0.90, 95, 1.2],
        [100, 1.9, 1.00, 95, 1.2], [135, 1.9, 1.50, 95, 1.6], [180, 1.9, 2.60, 114, 2.6]
      ]
    },
    {
      id: "cooke-s4", sec: "s35", brand: "Cooke", name: "S4/i", mount: "PL",
      ic: 30, icType: "circle", icNote: "Cooke: Maximum format cover — 30 mm diameter (Super35)",
      mod: "sensor", src: ["cooke-s4"],
      notes: ["Вес — с PL-байонетом.", "Ø — максимальный диаметр передней части (Max. front diameter)."],
      lenses: [
        [12, 2, 0.225, 156, 3.0], [14, 2, 0.225, 110, 2.2], [16, 2, 0.225, 110, 2.4], [18, 2, 0.25, 110, 1.7],
        [21, 2, 0.25, 110, 2.0], [25, 2, 0.25, 110, 1.6], [27, 2, 0.25, 110, 1.6], [32, 2, 0.325, 110, 1.8],
        [35, 2, 0.35, 110, 1.9], [40, 2, 0.45, 110, 2.0], [50, 2, 0.55, 110, 1.5], [65, 2, 0.70, 110, 1.6],
        [75, 2, 0.80, 110, 1.7], [100, 2, 0.95, 110, 2.0], [135, 2, 0.85, 110, 2.2], [150, 2, 1.05, 125, 3.5],
        [180, 2, 1.30, 136, 4.3], [300, 2.8, 2.10, 136, 4.7]
      ]
    },
    {
      id: "cooke-pan35", sec: "s35", brand: "Cooke", name: "Panchro/i Classic S35", mount: "PL / LPL",
      ic: 31.1, icType: "circle", icNote: "Cooke: Super35, optimised for coverage of 31.1 mm",
      mod: "sensor", src: ["cooke-pan35"],
      notes: ["Вес — с PL-байонетом."],
      lenses: [
        [18, 2.2, 0.20, 110, 1.6], [21, 2.2, 0.20, 110, 1.5], [25, 2.2, 0.20, 110, 1.5], [27, 2.2, 0.175, 110, 1.5],
        [32, 2.2, 0.225, 110, 1.1], [40, 2.2, 0.35, 110, 1.4], [50, 2.2, 0.40, 110, 1.5], [65, 2.4, 0.325, 110, 2.8, { note: "Macro" }],
        [75, 2.2, 0.70, 110, 1.8], [100, 2.6, 0.60, 110, 1.8], [135, 2.8, 0.85, 110, 2.1], [152, 3.0, 1.10, 110, 2.1]
      ]
    },
    {
      id: "leitz-slx", sec: "s35", brand: "Leitz", name: "Summilux-C", mount: "PL",
      ic: 33, icType: "circle", icNote: "Leitz: Image Circle 33 mm",
      mod: null, src: ["leitz-slx"],
      notes: ["135 мм: T1.4–T16, Ø 114 мм; остальные — Ø 95 мм.", "Leitz не указывает, от чего меряется дистанция фокусировки."],
      lenses: [
        [16, 1.4, 0.45, 95, 1.7], [18, 1.4, 0.45, 95, 1.6], [21, 1.4, 0.38, 95, 1.6], [25, 1.4, 0.38, 95, 1.8],
        [29, 1.4, 0.45, 95, 1.7], [35, 1.4, 0.45, 95, 1.6], [40, 1.4, 0.45, 95, 1.6], [50, 1.4, 0.60, 95, 1.8],
        [65, 1.4, 0.45, 95, 1.7], [75, 1.4, 0.79, 95, 1.6], [100, 1.4, 0.99, 95, 1.6], [135, 1.4, 1.25, 114, 3.4]
      ]
    },
    {
      id: "leitz-scr", sec: "s35", brand: "Leitz", name: "Summicron-C", mount: "PL",
      ic: 36, icType: "circle", icNote: "Leitz: Image Circle 36 mm",
      mod: null, src: ["leitz-scr"],
      notes: ["Leitz не указывает, от чего меряется дистанция фокусировки."],
      lenses: [
        [15, 2, 0.30, 95, 1.8], [18, 2, 0.30, 95, 1.3], [21, 2, 0.30, 95, 1.3], [25, 2, 0.30, 95, 1.5],
        [29, 2, 0.30, 95, 1.3], [35, 2, 0.36, 95, 1.3], [40, 2, 0.45, 95, 1.3], [50, 2, 0.60, 95, 1.5],
        [75, 2, 0.80, 95, 1.2], [100, 2, 1.00, 95, 1.2], [135, 2, 1.35, 95, 1.8]
      ]
    },

    // ───────────── Full Frame / LF ─────────────
    {
      id: "arri-sig", sec: "ff", brand: "ARRI", name: "Signature Prime", mount: "LPL",
      ic: 46.3, icType: "circle", icNote: "ARRI: 46.3 mm image circle",
      mod: "sensor", src: ["arri-sp", "arri-sig-broch"],
      notes: ["МДФ — от плоскости сенсора (minimum marked distance). На карточках объективов ARRI приводит ещё и МДФ от передней линзы.", "280 мм совместим с экстендером 1,7× (T4.95, 4,9 кг в сборе)."],
      lenses: [
        [12, 1.8, 0.35, 134, 2.8], [15, 1.8, 0.35, 156, 2.8], [18, 1.8, 0.35, 114, 2.0], [21, 1.8, 0.35, 114, 1.9],
        [25, 1.8, 0.35, 114, 1.9], [29, 1.8, 0.35, 114, 1.8], [35, 1.8, 0.35, 114, 1.7], [40, 1.8, 0.35, 114, 1.8],
        [47, 1.8, 0.45, 114, 1.8], [58, 1.8, 0.45, 114, 2.0], [75, 1.8, 0.65, 114, 1.9], [95, 1.8, 0.85, 114, 1.9],
        [125, 1.8, 1.0, 114, 2.3], [150, 1.8, 1.5, 114, 3.25], [200, 2.5, 1.8, 114, 3.1], [280, 2.8, 2.5, 134, 4.3]
      ]
    },
    {
      id: "zeiss-sp", sec: "ff", brand: "ZEISS", name: "Supreme Prime", mount: "PL / LPL",
      ic: 46.3, icType: "circle", icNote: "ZEISS: Image Diagonal 46,3 мм у всех Supreme Prime",
      mod: "sensor", src: ["zeiss-sp", "zeiss-sp-broch"],
      notes: [],
      lenses: [
        [15, 1.8, 0.35, 114, 2.24], [18, 1.5, 0.35, 114, 2.27], [21, 1.5, 0.35, 95, 1.61], [25, 1.5, 0.26, 95, 1.42],
        [29, 1.5, 0.33, 95, 1.61], [35, 1.5, 0.32, 95, 1.40], [40, 1.5, 0.42, 95, 1.49], [50, 1.5, 0.45, 95, 1.22],
        [65, 1.5, 0.60, 95, 1.63], [85, 1.5, 0.84, 95, 1.42], [100, 1.5, 1.10, 95, 1.70], [135, 1.5, 1.40, 114, 2.27],
        [150, 1.8, 1.50, 114, 2.27], [200, 2.2, 2.00, 114, 2.87]
      ]
    },
    {
      id: "cooke-s7", sec: "ff", brand: "Cooke", name: "S7/i FF", mount: "PL / LPL",
      ic: 46.3, icType: "circle", icNote: "Cooke: Full Frame and beyond, coverage of 46.3 mm",
      mod: "sensor", src: ["cooke-s7"],
      notes: ["Вес — с PL-байонетом. 180 и 300 мм — с опорой."],
      lenses: [
        [16, 2, 0.40, 136, 4.0], [18, 2, 0.40, 110, 3.5], [21, 2, 0.40, 110, 3.3], [25, 2, 0.35, 110, 3.3],
        [27, 2, 0.35, 110, 3.3], [32, 2, 0.35, 110, 3.4], [40, 2, 0.45, 110, 3.5], [50, 2, 0.50, 110, 3.4],
        [65, 2, 0.50, 110, 3.0], [75, 2, 0.475, 110, 3.0], [100, 2, 0.70, 110, 3.3], [135, 2, 0.95, 110, 3.7],
        [180, 2, 1.30, 110, 3.6], [300, 3.3, 2.10, 110, 4.4]
      ]
    },
    {
      id: "cooke-s4ff", sec: "ff", brand: "Cooke", name: "S4 FF/i", mount: "PL / LPL",
      ic: 43.27, icType: "format", icNote: "Cooke: Full Frame (36 × 24 мм, диагональ 43,27 мм); диаметр круга не указан",
      mod: "sensor", src: ["cooke-s4ff"],
      notes: ["Новая линейка (спецификация 10/2026).", "Вес — с байонетом."],
      lenses: [
        [18, 2, 0.30, 87, 1.8], [25, 2, 0.28, 87, 1.65], [35, 2, 0.28, 87, 1.7], [50, 2, 0.35, 87, 1.45],
        [75, 2, 0.45, 87, 1.6], [100, 2, 0.65, 87, 1.65]
      ]
    },
    {
      id: "cooke-panff", sec: "ff", brand: "Cooke", name: "Panchro/i Classic FF", mount: "PL / LPL",
      ic: 43.3, icType: "circle", icNote: "Cooke: Full Frame, optimised for coverage of 43.3 mm",
      mod: "sensor", src: ["cooke-panff"],
      notes: ["Вес — с PL-байонетом. Для 18 мм Cooke оговаривает, что часть характеристик может измениться."],
      lenses: [
        [18, 2.2, 0.30, 125, 2.2], [21, 2.2, 0.30, 110, 1.9], [25, 2.2, 0.35, 110, 2.0], [27, 2.2, 0.35, 110, 2.1],
        [32, 2.2, 0.35, 110, 1.9], [40, 2.2, 0.35, 110, 1.5], [50, 2.2, 0.40, 110, 1.4], [65, 2.4, 0.325, 110, 2.8, { note: "Macro" }],
        [75, 2.2, 0.70, 110, 1.8], [100, 2.6, 0.60, 110, 1.8], [135, 2.8, 0.85, 110, 2.1], [152, 3.0, 1.10, 110, 2.1]
      ]
    },
    {
      id: "leitz-prime", sec: "ff", brand: "Leitz", name: "Leitz Prime", mount: "PL / LPL",
      ic: 46.5, icType: "circle", icNote: "Leitz: Image Circle 46.5 mm",
      mod: null, src: ["leitz-prime"],
      notes: ["Leitz не указывает, от чего меряется дистанция фокусировки."],
      lenses: [
        [18, 1.8, 0.35, 114, 3.2], [21, 1.8, 0.55, 114, 2.76], [25, 1.8, 0.55, 114, 2.8], [29, 1.8, 0.35, 114, 2.67],
        [35, 1.8, 0.45, 114, 2.87], [40, 1.8, 0.35, 114, 2.71], [50, 1.8, 0.47, 114, 2.7], [65, 1.8, 0.65, 114, 2.78],
        [75, 1.8, 0.75, 114, 2.83], [100, 1.8, 1.2, 114, 2.77], [135, 1.8, 1.2, 114, 2.89], [180, 2, 1.5, 114, 3.1],
        [350, 3.6, 3.0, 114, 4.4]
      ]
    },
    {
      id: "zeiss-cp3", sec: "ff", brand: "ZEISS", name: "CP.3 / CP.3 XD", mount: "PL (сменный)",
      ic: 46.3, icType: "circle", icNote: "ZEISS (брошюра): coverage up to 46.3 mm image circle",
      mod: "sensor", src: ["zeiss-cp3", "zeiss-cp3-broch"],
      notes: ["100 мм — версия CF (close focus)."],
      lenses: [
        [15, 2.9, 0.30, 95, 0.87], [18, 2.9, 0.30, 95, 0.86], [21, 2.9, 0.24, 95, 0.82], [25, 2.1, 0.26, 95, 0.82],
        [28, 2.1, 0.24, 95, 0.84], [35, 2.1, 0.30, 95, 0.80], [50, 2.1, 0.45, 95, 0.77], [85, 2.1, 1.0, 95, 0.88],
        [100, 2.1, 0.70, 95, 1.01, { note: "CF" }], [135, 2.1, 1.0, 95, 1.15]
      ]
    },
    {
      id: "sigma-ffhs", sec: "ff", brand: "SIGMA", name: "FF High Speed", mount: "PL / EF / E",
      ic: 43.3, icType: "circle", icNote: "SIGMA: Image Circle FF φ43.3 mm (illumination circle более 46.3 мм)",
      mod: null, src: ["sigma-ffhs"],
      notes: ["Вес — для версии PL (/i).", "SIGMA не уточняет на странице, от чего меряется Close Focus."],
      lenses: [
        [14, 2, 0.27, 95, 1.4], [20, 1.5, 0.28, 95, 1.3], [24, 1.5, 0.25, 95, 1.1], [28, 1.5, 0.28, 95, 1.3],
        [35, 1.5, 0.30, 95, 1.1], [40, 1.5, 0.40, 95, 1.5], [50, 1.5, 0.40, 95, 1.2], [65, 1.5, 0.65, 95, 1.5],
        [85, 1.5, 0.85, 95, 1.4], [105, 1.5, 1.0, 95, 1.7], [135, 2, 0.88, 95, 1.5]
      ]
    },
    {
      id: "leitz-thalia", sec: "ff", brand: "Leitz", name: "Thalia (65 / VistaVision)", mount: "PL / LPL",
      ic: 60, icType: "circle", icNote: "Leitz: Image Circle 60 mm (до ALEXA 65)",
      mod: null, src: ["leitz-thalia"],
      notes: ["Покрывает больше FF — до ALEXA 65 / 265.", "Leitz не указывает, от чего меряется дистанция фокусировки."],
      lenses: [
        [20, 3.6, 0.40, 95, 1.95], [24, 3.6, 0.20, 95, 1.42], [30, 2.9, 0.50, 95, 1.50], [35, 2.6, 0.55, 95, 1.40],
        [45, 2.9, 0.60, 95, 1.46], [55, 2.8, 0.30, 95, 1.64], [70, 2.6, 0.50, 95, 1.06], [90, 2.2, 0.90, 95, 1.04],
        [100, 2.2, 0.70, 95, 1.16], [120, 2.6, 0.57, 95, 1.66], [180, 3.6, 1.50, 95, 1.62]
      ]
    },

    // ───────────── Анаморфот ─────────────
    {
      id: "arri-ma", sec: "ana", brand: "ARRI / ZEISS", name: "Master Anamorphic", mount: "PL LDS", sq: 2,
      ic: 29.26, icType: "circle", icNote: "ARRI: Image Diameter 29,26 мм (кадр Super 35 Cinemascope 22,5 × 18,7 мм)",
      mod: "sensor", src: ["arri-ma", "arri-ma-sheets"],
      notes: ["Коэффициент 2×."],
      lenses: [
        [28, 1.9, 0.65, 114, 2.5], [35, 1.9, 0.75, 95, 2.6], [40, 1.9, 0.70, 95, 2.7], [50, 1.9, 0.75, 95, 2.6],
        [60, 1.9, 0.90, 95, 2.7], [75, 1.9, 0.90, 95, 2.6], [100, 1.9, 0.95, 95, 3.1], [135, 1.9, 1.20, 95, 3.8],
        [180, 2.8, 1.5, 95, 3.2]
      ]
    },
    {
      id: "cooke-ana35", sec: "ana", brand: "Cooke", name: "Anamorphic/i S35", mount: "PL / LPL", sq: 2,
      ic: 31.1, icType: "circle", icNote: "Cooke: Super35, optimised for coverage of 31.1 mm",
      mod: "sensor", src: ["cooke-ana35"],
      notes: ["Коэффициент 2×. Вес — с PL-байонетом. 25, 135, 180, 300 мм и 65 Macro — с опорой."],
      lenses: [
        [25, 2.3, 1.0, 136, 4.2], [32, 2.3, 0.85, 110, 3.2], [40, 2.3, 0.85, 110, 3.4], [50, 2.3, 0.85, 110, 3.6],
        [65, 2.6, 0.44, 136, 5.2, { note: "Macro" }], [75, 2.3, 1.0, 110, 3.2], [100, 2.3, 1.2, 110, 3.4],
        [135, 2.3, 1.4, 110, 4.2], [180, 2.8, 2.0, 110, 5.8], [300, 3.5, 3.0, 136, 9.4]
      ]
    },
    {
      id: "cooke-anaff", sec: "ana", brand: "Cooke", name: "Anamorphic/i FF Plus", mount: "PL / LPL", sq: 1.8,
      ic: 43.3, icType: "circle", icNote: "Cooke: Full Frame, optimised for coverage of 43.3 mm",
      mod: "sensor", src: ["cooke-anaff"],
      notes: ["Коэффициент 1,8×. Вес — с PL-байонетом."],
      lenses: [
        [32, 2.3, 0.90, 136, 4.2], [40, 2.3, 0.90, 136, 4.4], [50, 2.3, 0.85, 110, 4.0], [75, 2.3, 1.0, 110, 3.5],
        [85, 2.8, 0.55, 136, 5.2, { note: "Macro" }], [100, 2.3, 1.2, 110, 3.8], [135, 2.3, 1.5, 110, 5.0], [180, 2.9, 2.1, 110, 6.2]
      ]
    },
    {
      id: "zeiss-horizon", sec: "ana", brand: "ZEISS", name: "Horizon Anamorphic", mount: "LPL", sq: 2,
      ic: 43.27, icType: "format", icNote: "ZEISS: full frame 2x anamorphic (36 × 24 мм, диагональ 43,27 мм); диаметр круга не указан",
      mod: "sensor", src: ["zeiss-horizon"],
      notes: ["Коэффициент 2×. Новая линейка ZEISS."],
      lenses: [
        [35, 2.3, 0.79, 114, 2.42], [40, 2.3, 0.74, 114, 2.42], [50, 2.3, 0.80, 114, 2.57], [75, 2.3, 0.99, 114, 2.70],
        [100, 2.3, 1.18, 114, 3.25], [150, 2.3, 1.60, 114, 3.10], [200, 2.9, 2.22, 114, 3.25]
      ]
    },
    {
      id: "atlas-orion", sec: "ana", brand: "Atlas", name: "Orion", mount: "PL", sq: 2,
      ic: 31, icType: "circle", icNote: "Atlas: Image Circle 31 mm (4-perf Super 35)",
      mod: null, src: ["atlas-orion"],
      notes: ["Коэффициент 2×.", "Atlas не указывает, от чего меряется Min Focus."],
      lenses: [
        [18, 2, 0.45, 136, 3.15], [21, 2, 0.45, 136, 3.1], [25, 2, 0.45, 136, 2.8], [28, 2, 0.45, 136, 2.9],
        [32, 2, 0.53, 114, 2.1], [40, 2, 0.56, 114, 2.4], [50, 2, 0.76, 114, 2.3], [65, 2, 0.84, 114, 2.3],
        [80, 2, 0.91, 114, 2.7], [100, 2, 1.1, 114, 3.0], [135, 2.2, 1.1, 114, 3.99], [200, 3.2, 1.1, 114, 4.0]
      ]
    }
  ];

  const SECTIONS = [
    { id: "s16", label: "S16", title: "Super 16" },
    { id: "s35", label: "S35", title: "Super 35" },
    { id: "ff", label: "FF", title: "Full Frame / LF" },
    { id: "ana", label: "ANAM", title: "Анаморфот" }
  ];

  window.LC_LENSES = { SOURCES, SERIES, SECTIONS, UPDATED: "2026-11-24" };
})();
