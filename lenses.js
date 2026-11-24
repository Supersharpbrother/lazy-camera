/*
 * Lazy Camera — справочник по оптике. Данные можно править здесь.
 *
 * Все значения — из официальных источников производителей (ссылки в SOURCES,
 * у каждой линейки поле src). Если производитель не публикует значение, стоит null
 * и в интерфейсе показывается «н/д».
 *
 * Модель:
 *   series = { id, sec: "s16"|"s35"|"ff"|"l65"|"ana"|"zoom", brand, name, mount,
 *              ic: диаметр пятна, мм,
 *              icType: "circle" — производитель указывает диаметр круга изображения;
 *                      "format" — производитель указывает только формат кадра (ic = его диагональ),
 *              icNote: как это сформулировано у производителя,
 *              sq: коэффициент анаморфота (только для sec "ana"),
 *              mod: от чего меряется МДФ ("sensor" — от плоскости сенсора / кадра; null — не указано),
 *              src: [ключи SOURCES], notes: [],
 *              lenses: [ [фокусное мм, T, МДФ м, Ø передней части мм, вес кг, {note, ic}] ] }
 *   zoom: true — строки зумов, F = [мин, макс]; tags: ["vintage"|"rental"|"secondary"].
 *   icType "nominal" — производитель пятно не публикует, ic = ориентир по формату (в расчёте помечается).
 *   Файл собирается скриптом lazy-camera-notes/lens-build/build.js.
 *   Ø передней части — диаметр под накидной (clamp-on) компендиум / переходное кольцо.
 */
(function () {
  "use strict";

  const SOURCES = {
    "arri-sp": {"t":"ARRI — Signature Prime, Technical Data","u":"https://www.arri.com/en/cine-lenses/signature-lenses/signature-primes-zooms/signature-primes/technical-data-signature-prime"},
    "arri-sig-broch": {"t":"ARRI — Signature Lens Brochure (PDF, 10/2021): «46.3 mm image circle»","u":"https://www.arri.com/resource/blob/225644/c83fcb0e41b5a241e75cdc399ade586e/signature-brochure-data.pdf"},
    "arri-mp": {"t":"ARRI — Master Prime, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/master-primes/master-primes/arri-master-prime-technical-data"},
    "arri-mp-broch": {"t":"ARRI — Master Prime Lenses Brochure (PDF, 04/2011): ID 31,14 мм","u":"https://www.arri.com/resource/blob/178208/eb2ae4f712451cd1e0036a646057c888/master-prime-lenses-brochure-data.pdf"},
    "arri-up": {"t":"ARRI — Ultra Prime, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/legacy/ultra-prime-lenses/arri-ultra-prime-lenses-technical-data"},
    "arri-ma": {"t":"ARRI — Master Anamorphic, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/master-anamorphics/arri-master-anamorphic-technical-data"},
    "arri-ma-sheets": {"t":"ARRI — Master Anamorphic Data Sheets (PDF): Image Diameter 29,26 мм","u":"https://www.arri.com/resource/blob/178216/d6fa949dec02494bd9f7e3ee46069aa8/master-anamorhic-data-sheets-data.pdf"},
    "arri-u16": {"t":"ARRI — Ultra 16 Product Brochure (PDF, K5.40457.0, 04/2008; копия на rec-roma.com)","u":"https://rec-roma.com/pdf/lenses/zeiss/2008_03-25_Ultra_16_Brochure.pdf"},
    "zeiss-sp": {"t":"ZEISS — Supreme Prime, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/supreme-prime-lenses.html"},
    "zeiss-sp-broch": {"t":"ZEISS — SZR, SPR, SP Specifications (PDF на zeiss.com, FDTimes 11/2024): Image Diagonal 46,3 мм","u":"https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/brochure-fd-times-zeiss-supreme-zoom-radiance.pdf"},
    "zeiss-cp3": {"t":"ZEISS — Compact Prime CP.3, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/compact-prime-cp-3-lenses.html"},
    "zeiss-cp3-broch": {"t":"ZEISS — CP.3 Brochure (PDF): «Coverage up to 46.3 mm image circle»","u":"https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/brochure-zeiss-compact-prime-cp3-lenses.pdf"},
    "zeiss-horizon": {"t":"ZEISS — Horizon Anamorphic, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/horizon-anamorphic-lenses.html"},
    "cooke-s4": {"t":"Cooke — S4/i S35 Specification (PDF, 030623)","u":"https://cookeoptics.com/wp-content/uploads/2021/11/COOKE_S4i_Specification_030623.pdf"},
    "cooke-s4ff": {"t":"Cooke — S4 FF/i Specification (PDF, 101926)","u":"https://cookeoptics.com/wp-content/uploads/2026/10/COOKE_S4-FF-i_Specification_101926.pdf"},
    "cooke-s7": {"t":"Cooke — S7/i FF Specification (PDF, 030623)","u":"https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_S7i_Specification_030623.pdf"},
    "cooke-pan35": {"t":"Cooke — Panchro/i Classic S35 Specification (PDF, 030623)","u":"https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Panchro-i-Classic-S35_Specification_030623.pdf"},
    "cooke-panff": {"t":"Cooke — Panchro/i Classic FF Specification (PDF, 051324)","u":"https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Panchro-i-Classic-FF_Specification_051324.pdf"},
    "cooke-ana35": {"t":"Cooke — Anamorphic/i S35 Specification (PDF, 030623)","u":"https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Anamorphic-i-S35_Specification_030623.pdf"},
    "cooke-anaff": {"t":"Cooke — Anamorphic/i Full Frame Plus Specification (PDF, 030623)","u":"https://cookeoptics.com/wp-content/uploads/2022/10/COOKE_Anamorphic-i-Full-Frame_Specification_030623.pdf"},
    "leitz-slx": {"t":"Leitz Cine — SUMMILUX-C","u":"https://www.leitz-cine.com/product/summilux-c"},
    "leitz-scr": {"t":"Leitz Cine — SUMMICRON-C","u":"https://www.leitz-cine.com/product/summicron-c"},
    "leitz-prime": {"t":"Leitz Cine — LEITZ PRIME","u":"https://www.leitz-cine.com/product/leitz-prime"},
    "leitz-thalia": {"t":"Leitz Cine — THALIA","u":"https://www.leitz-cine.com/product/thalia"},
    "sigma-ffhs": {"t":"SIGMA — Cine FF High Speed Prime Line (страницы объективов, PL)","u":"https://www.sigma-global.com/en/cine-lenses/ff-high-speed-prime/50_15/"},
    "atlas-orion": {"t":"Atlas Lens Co. — Orion Series Anamorphic","u":"https://atlaslensco.com/products/orion-series-anamorphic-lenses"},
    "arri-up-zeiss": {"t":"ZEISS — ARRI/ZEISS Master Prime, Ultra Prime, Master Anamorphic: технические данные (включая Ultra Prime 10 мм)","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/arrizeiss.html"},
    "arri-up-lds": {"t":"ARRI — LDS Ultra Prime, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/legacy/ultra-prime-lds/arri-ultra-prime-lds-technical-data"},
    "arri-mm100": {"t":"ARRI — Master Macro 100, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/master-primes/master-macro-100/arri-master-macro-100-technical-data"},
    "arri-enso": {"t":"ARRI — Ensō Prime, Technical Data","u":"https://www.arri.com/en/cine-lenses/enso-prime-lenses/enso-lenses-technical-data"},
    "arri-enso-faq": {"t":"ARRI — Ensō Prime FAQ: «designed for large-format/full-frame cameras»","u":"https://www.arri.com/en/cine-lenses/enso-prime-lenses/arri-enso-lenses-faq"},
    "arri-sigzoom": {"t":"ARRI — Signature Zoom, Technical Data","u":"https://www.arri.com/en/cine-lenses/signature-lenses/signature-primes-zooms/signature-zooms/technical-data-signature-zoom"},
    "arri-uwz": {"t":"ARRI — Ultra Wide Zoom UWZ 9.5-18, Technical Data (+ брошюра ARRI Lenses: «image circle of 34.5 mm»)","u":"https://www.arri.com/en/cine-lenses/arri-ultra-wide-zooms/ultra-wide-zoom/arri-ultra-wide-zoom-technical-data"},
    "arri-auwz": {"t":"ARRI — Anamorphic Ultra Wide Zoom AUWZ 19-36, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-ultra-wide-zooms/anamorphic-ultra-wide-zoom/arri-anamorphic-ultra-wide-zoom-technical-data"},
    "arri-alura-s": {"t":"ARRI — Alura Studio Zooms, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/legacy/alura-studio-zooms/arri-alura-studio-zoom-technical-data"},
    "arri-alura-l": {"t":"ARRI — Alura Lightweight Zooms, Technical Data","u":"https://www.arri.com/en/cine-lenses/arri-zeiss-fujinon-lenses/legacy/alura-lightweight-zooms/arri-alura-lightweight-zooms-technical-data"},
    "arri-rental-35": {"t":"ARRI Rental — 35 mm lens lists (список парка, без ТТХ)","u":"https://www.arrirental.com/en/lenses/35-mm-lenses"},
    "arri-rental-16": {"t":"ARRI Rental — 16 mm lens lists","u":"https://www.arrirental.com/en/lenses/16-mm-lenses"},
    "arri-rental-ff": {"t":"ARRI Rental — Full-frame lens lists","u":"https://www.arrirental.com/en/lenses/full-frame-lenses"},
    "arri-rental-65": {"t":"ARRI Rental — 65 mm lens lists","u":"https://www.arrirental.com/en/lenses/65-mm-lenses"},
    "arri-rental-ana": {"t":"ARRI Rental — Anamorphic lens lists","u":"https://www.arrirental.com/en/lenses/anamorphic-lenses"},
    "rent-masterzoom": {"t":"Вторичный источник: PhotoCineRent — Zeiss Master Zoom 16.5-110 (ТТХ проката)","u":"https://photocinerent.com/en/lenses/zeiss/zeiss-zoom-lenses/zeiss-masterzoom-165-110mm-t23"},
    "cooke-5i": {"t":"Cooke — 5/i S35 Specification (PDF, 030623)","u":"https://www.cookeoptics.com/wp-content/uploads/2022/01/COOKE_5i-S35_Specification_030623.pdf"},
    "cooke-mini4": {"t":"Cooke — miniS4/i S35 Specification (PDF, 030623)","u":"https://www.cookeoptics.com/wp-content/uploads/2021/11/COOKE_Mini-S4i-S35_Specification_030623.pdf"},
    "cooke-s8": {"t":"Cooke — S8/i FF Specification (PDF, 092424)","u":"https://www.cookeoptics.com/wp-content/uploads/2023/08/COOKE_S8i_Specification_092424.pdf"},
    "cooke-macro": {"t":"Cooke — Macro/i Specification (PDF, 052523)","u":"https://www.cookeoptics.com/wp-content/uploads/2022/10/COOKE_Macro-i_Specification_052523.pdf"},
    "cooke-varotal": {"t":"Cooke — Varotal/i FF Specification (PDF, 030923)","u":"https://www.cookeoptics.com/wp-content/uploads/2022/10/COOKE_Varotal-i_Specification_030923.pdf"},
    "cooke-pan65": {"t":"Cooke — Panchro 65/i Specification (PDF, 100125)","u":"https://www.cookeoptics.com/wp-content/uploads/2025/10/COOKE_PANCHRO-65-i_Specification_100125-1.pdf"},
    "cooke-sp3": {"t":"Cooke — SP3 Specification (PDF, 022924)","u":"https://www.cookeoptics.com/wp-content/uploads/2024/09/COOKE_SP3_Specification_6_LENSES_022924-1.pdf"},
    "cooke-ap3": {"t":"Cooke — AP3 Specification (PDF, 042826)","u":"https://www.cookeoptics.com/wp-content/uploads/2026/05/COOKE_AP3_Specification_042826.pdf"},
    "cooke-book": {"t":"Cooke Book 2016 (Film and Digital Times, PDF на cookeoptics.com) — SK4, CXX, Anamorphic/i 35-140, история Speed Panchro","u":"https://www.cookeoptics.com/wp-content/uploads/2021/11/Cooke-Book-2016-FDTimes-300.pdf"},
    "zeiss-spr": {"t":"ZEISS — Supreme Prime Radiance, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/supreme-prime-radiance-lenses.html"},
    "zeiss-aatma": {"t":"ZEISS — Aatma, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/aatma-lenses.html"},
    "zeiss-aatma-fdt": {"t":"ZEISS — Aatma report (FDTimes, PDF на zeiss.com): Image circle 46.3 mm","u":"https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/film-and-digital-times-zeiss-aatma-report.pdf"},
    "zeiss-nano": {"t":"ZEISS — Nano Prime Brochure (PDF)","u":"https://www.zeiss.com/content/dam/pno/downloads/cine-lenses/brochures/brochure-zeiss-nano-prime-lenses.pdf"},
    "zeiss-panoptes": {"t":"ZEISS — Panoptes 65, Technical Data («59.9mm image circle»)","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/panoptes-65-lenses.html"},
    "zeiss-cz2": {"t":"ZEISS — Compact Zoom CZ.2, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/cinema-zoom-lenses.html"},
    "zeiss-lwz3": {"t":"ZEISS — Lightweight Zoom LWZ.3, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/lightweight-zoom-lwz-3.html"},
    "zeiss-szr": {"t":"ZEISS — Supreme Zoom Radiance, Technical Data","u":"https://www.zeiss.com/photonics-and-optics/en/cinematography/lenses/supreme-zoom-radiance-lenses.html"},
    "tls-ss": {"t":"Вторичный источник: True Lens Services — Zeiss Super Speed MkII/III (замер пятна при реставрации)","u":"https://www.truelens.co.uk/zeiss-super-speed-mkii/iii"},
    "cinematechnic-zeiss": {"t":"Вторичный источник: CinemaTechnic — Zeiss Cinematography Lenses Guide (поколения и фокусные)","u":"https://cinematechnic.com/resources/zeiss_cinematography_lens/"},
    "tls-kowa": {"t":"Вторичный источник: True Lens Services — Kowa Cine Prominar (реставрация)","u":"https://www.truelens.co.uk/kowa-cine-prominar"},
    "keslow-kowa": {"t":"Вторичный источник: Keslow Camera — Kowa Cine Prominar (TLS), Close Focus","u":"https://www.keslowcamera.com/gear/kowa-cine-prominar-spherical-primes-tls-conversion/"},
    "rule-leicar": {"t":"Вторичный источник: Rule Camera — G.L. Optics Leica R (ТТХ рехауса)","u":"https://www.rule.com/product/gl-optics-leica-r/"},
    "cinevisuals-leicar": {"t":"Вторичный источник: Cine Visuals — GL Optics Leica R: «44 mm image circle»","u":"https://cinevisuals.com/product/gl-optics-leica-r/"},
    "pv-primo": {"t":"Panavision — Primo (официальная страница; только аренда)","u":"https://www.panavision.com/camera-and-optics/optics/product-detail/sl-primo"},
    "leitz-hugo": {"t":"Leitz Cine — HUGO","u":"https://www.leitz-cine.com/product/hugo"},
    "leitz-elsie": {"t":"Leitz Cine — ELSIE","u":"https://www.leitz-cine.com/product/elsie"},
    "leitz-hektor": {"t":"Leitz Cine — HEKTOR","u":"https://www.leitz-cine.com/product/hektor"},
    "leitz-m08": {"t":"Leitz Cine — M 0.8","u":"https://www.leitz-cine.com/product/m-08"},
    "leitz-zoom": {"t":"Leitz Cine — LEITZ ZOOM","u":"https://www.leitz-cine.com/product/leitz-zoom"},
    "sigma-aizu": {"t":"SIGMA — Aizu Prime Line (страницы объективов, PL)","u":"https://www.sigma-global.com/en/cine-lenses/aizu-prime/50_13/"},
    "sigma-classic": {"t":"SIGMA — FF Classic Prime Line (страницы объективов, PL)","u":"https://www.sigma-global.com/en/cine-lenses/ff-classic-prime/50_25/"},
    "sigma-zoom": {"t":"SIGMA — Cine High Speed Zoom / FF Zoom (страницы объективов)","u":"https://www.sigma-global.com/en/cine-lenses/high-speed-zoom/18_35_2/"},
    "canon-sumire": {"t":"Canon Europe — Sumire Prime Series Specifications","u":"https://www.canon-europe.com/lenses/sumire-prime-series/specifications/"},
    "canon-flex": {"t":"Canon — Flex Zoom Operation Manual (PDF, CN-E20-50 / 45-135 / 14-35 / 31.5-95)","u":"https://gdlp01.c-wss.com/gds/3/0300048053/01/flexzoomlenz-om-en.pdf"},
    "ang-prime": {"t":"Angénieux — Optimo Prime Series","u":"https://www.angenieux.com/lenses/optimo-prime-series/"},
    "ang-uc": {"t":"Angénieux — Optimo Ultra Compact","u":"https://www.angenieux.com/lenses/optimo-ultra-compact/"},
    "ang-12x": {"t":"Angénieux — Optimo Ultra 12x","u":"https://www.angenieux.com/lenses/optimo-ultra-12x/"},
    "ang-ez": {"t":"Angénieux — Type EZ Series","u":"https://www.angenieux.com/lenses/type-ez-series/"},
    "ang-legacy": {"t":"Angénieux — Legacy Series (Optimo 28-76, 19.5-94, Style 48-130, A2S 56-152)","u":"https://www.angenieux.com/lenses/legacy-series/"},
    "fuji-premista": {"t":"FUJIFILM — Premista Series","u":"https://www.fujifilm.com/us/en/business/cine-and-broadcast/cine-lens/premista"},
    "fuji-cat": {"t":"FUJIFILM — FUJINON Catalogue 2023 (PDF): Cabrio ZK, XK, MK","u":"https://asset.fujifilm.com/master/emea/files/2023-09/fa5698133ed3e6f734726dabd2c53bb0/Fujifilm_Fujinon_catalogue_2023_.pdf"},
    "dzo-vespid": {"t":"DZOFILM — Vespid Prime User's Manual (PDF)","u":"https://dzofilm.oss-cn-shenzhen.aliyuncs.com/dzofilm/PDF/Vespid%20Prime-Instructions.pdf"},
    "dzo-arles": {"t":"DZOFILM — Arles Prime (страница и User's Manual)","u":"https://dzofilm.com/en/lens/prime/arles-prime"},
    "tribe7": {"t":"TRIBE7 — Blackwing7 Technical Specifications (PDF, SS23)","u":"https://blackwing7.directus.app/assets/6fef6a87-3216-4c13-9bdb-e9738bfe5b1e?download="},
    "vantage-one4": {"t":"Vantage Film — Vantage One4, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/1x-spherical-lenses-made-by-hawk/vantageone4-technical-data.pdf"},
    "vantage-one": {"t":"Vantage Film — Vantage One, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/1x-spherical-lenses-made-by-hawk/vantageone-technical-data-.pdf"},
    "vantage-minihawk": {"t":"Vantage Film — MiniHawk, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/1x-spherical-lenses-made-by-hawk/0646v_minihawktechdata20.pdf"},
    "hawk-vlite": {"t":"Vantage Film — Hawk V-Lite 2x, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-v-lite-technical-data.pdf"},
    "hawk-v74": {"t":"Vantage Film — Hawk V-Lite Vintage74, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-v-lite-vintage74-technical-data.pdf"},
    "hawk-classx": {"t":"Vantage Film — Hawk Class-X, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-class-x-technical-data.pdf"},
    "hawk-c": {"t":"Vantage Film — Hawk C-Series, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-c-series-technical-data.pdf"},
    "hawk-vplus": {"t":"Vantage Film — Hawk V-Plus, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-v-plus-technical-data.pdf"},
    "hawk-vseries": {"t":"Vantage Film — Hawk V-Series, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/2x-hawk-anamorphic-lenses/hawk-v-series-technical-data.pdf"},
    "hawk65": {"t":"Vantage Film — Hawk65 1.3x, Technical Data (PDF)","u":"https://www.vantagefilm.com/file/edee/downloads/optics/1.3x-hawk-anamorphic-lenses/hawk65-technical-data.pdf"},
    "atlas-mercury": {"t":"Atlas Lens Co. — Mercury Series Anamorphic","u":"https://atlaslensco.com/products/mercury-series-anamorphic-lenses"},
    "laowa-nano": {"t":"Venus Optics / LAOWA — Nanomorph S35 1.5x (официальная страница)","u":"https://laowacine.com/product/laowa-1-5x-nanomorph-27mm-t2-8-35mm-t2-4-50mm-t2-4-pl-ef/"}
  };

  const SERIES = [
    {"id":"arri-ultra16","sec":"s16","brand":"ARRI / ZEISS","name":"Ultra 16","mount":"PL","ic":14.45,"icType":"format","icNote":"ARRI: все объективы покрывают полный кадр Super 16 (12,35 × 7,5 мм, диагональ 14,45 мм)","mod":"sensor","src":["arri-u16"],"notes":["Снята с производства, встречается в прокате.","Длина у всех — 91,6 мм от байонета."],"lenses":[
      [6,1.3,0.2,95,1],
      [8,1.3,0.3,95,1],
      [9.5,1.3,0.3,95,1],
      [12,1.3,0.3,95,1],
      [14,1.3,0.3,95,1],
      [18,1.3,0.3,95,1.2],
      [25,1.3,0.3,95,1.2],
      [35,1.3,0.35,95,1.1],
      [50,1.3,0.4,95,1.2]
    ]},
    {"id":"cooke-sk4","sec":"s16","brand":"Cooke","name":"SK4","mount":"PL","ic":14.45,"icType":"format","icNote":"Cooke: объективы для Super 16 (диагональ кадра 14,45 мм); диаметр круга не опубликован","mod":"sensor","src":["cooke-book"],"tags":["vintage"],"notes":["Снята с производства. Вес 6 мм в Cooke Book не приведён.","Прокат (welabplus) указывает 1,6 / 1,4 / 1,5 кг — расходится с Cooke Book."],"lenses":[
      [6,2,0.2,110,null],
      [9.5,2,0.2,110,1.85],
      [12,2,0.2,110,1.8]
    ]},
    {"id":"zeiss-ss16","sec":"s16","brand":"ZEISS","name":"Super Speed S16 (Mk II/III)","mount":"PL","ic":14.45,"icType":"nominal","icNote":"Super 16 — по описанию поколений (CinemaTechnic); ZEISS данных не публикует","mod":null,"src":["cinematechnic-zeiss","arri-rental-16"],"tags":["vintage"],"notes":["ARRI Rental держит также 8 мм T1.3.","Кроме фокусных и T, характеристики не опубликованы."],"lenses":[
      [9.5,1.3,null,null,null],
      [12,1.3,null,null,null],
      [16,1.3,null,null,null],
      [25,1.3,null,null,null],
      [50,1.3,null,null,null]
    ]},
    {"id":"arri-mp","sec":"s35","brand":"ARRI / ZEISS","name":"Master Prime","mount":"PL LDS","ic":31.14,"icType":"circle","icNote":"ARRI: рассчитаны на Image Diameter 31,14 мм (ANSI Super 35)","mod":"sensor","src":["arri-mp","arri-mp-broch"],"notes":["12 мм и 150 мм поставляются с опорой (support post).","25 мм: 2,3 кг (5,1 lb) — по ZEISS; на странице ARRI опечатка «2.6 kg / 5.1 lb»."],"lenses":[
      [12,1.3,0.4,156,2.9],
      [14,1.3,0.35,114,2.4],
      [16,1.3,0.35,114,2.2],
      [18,1.3,0.35,114,2.2],
      [21,1.3,0.35,114,2.4],
      [25,1.3,0.35,114,2.3],
      [27,1.3,0.35,114,2.2],
      [32,1.3,0.35,114,2.3],
      [35,1.3,0.35,114,2.2],
      [40,1.3,0.4,114,2.3],
      [50,1.3,0.5,114,2.7],
      [65,1.3,0.65,114,2.6],
      [75,1.3,0.8,114,2.8],
      [100,1.3,1,114,2.9],
      [135,1.3,0.95,114,2.8],
      [150,1.3,1.5,134,4]
    ]},
    {"id":"arri-up","sec":"s35","brand":"ARRI / ZEISS","name":"Ultra Prime","mount":"PL","ic":31.14,"icType":"format","icNote":"ARRI указывает формат ANSI Super 35 (24,9 × 18,7 мм, диагональ 31,14 мм), а не диаметр круга","mod":"sensor","src":["arri-up","arri-up-zeiss"],"notes":["Линейка в разделе Legacy у ARRI. 10 мм — по данным ZEISS (на текущей странице ARRI не приводится).","8R — ректилинейный сверхширокоугольник.","Версия LDS Ultra Prime имеет другие Ø и вес — отдельная линейка."],"lenses":[
      [8,2.8,0.35,134,2,{"note":"8R"}],
      [10,2.1,0.35,156,2.9],
      [12,2,0.3,156,2],
      [14,1.9,0.22,114,1.8],
      [16,1.9,0.25,95,1.2],
      [20,1.9,0.28,95,1.2],
      [24,1.9,0.3,95,1],
      [28,1.9,0.28,95,1],
      [32,1.9,0.35,95,1.1],
      [40,1.9,0.38,95,1],
      [50,1.9,0.6,95,1],
      [65,1.9,0.65,95,1.1],
      [85,1.9,0.9,95,1.2],
      [100,1.9,1,95,1.2],
      [135,1.9,1.5,95,1.6],
      [180,1.9,2.6,114,2.6]
    ]},
    {"id":"cooke-s4","sec":"s35","brand":"Cooke","name":"S4/i","mount":"PL","ic":30,"icType":"circle","icNote":"Cooke: Maximum format cover — 30 mm diameter (Super35)","mod":"sensor","src":["cooke-s4"],"notes":["Вес — с PL-байонетом.","Ø — максимальный диаметр передней части (Max. front diameter)."],"lenses":[
      [12,2,0.225,156,3],
      [14,2,0.225,110,2.2],
      [16,2,0.225,110,2.4],
      [18,2,0.25,110,1.7],
      [21,2,0.25,110,2],
      [25,2,0.25,110,1.6],
      [27,2,0.25,110,1.6],
      [32,2,0.325,110,1.8],
      [35,2,0.35,110,1.9],
      [40,2,0.45,110,2],
      [50,2,0.55,110,1.5],
      [65,2,0.7,110,1.6],
      [75,2,0.8,110,1.7],
      [100,2,0.95,110,2],
      [135,2,0.85,110,2.2],
      [150,2,1.05,125,3.5],
      [180,2,1.3,136,4.3],
      [300,2.8,2.1,136,4.7]
    ]},
    {"id":"cooke-pan35","sec":"s35","brand":"Cooke","name":"Panchro/i Classic S35","mount":"PL / LPL","ic":31.1,"icType":"circle","icNote":"Cooke: Super35, optimised for coverage of 31.1 mm","mod":"sensor","src":["cooke-pan35"],"notes":["Вес — с PL-байонетом."],"lenses":[
      [18,2.2,0.2,110,1.6],
      [21,2.2,0.2,110,1.5],
      [25,2.2,0.2,110,1.5],
      [27,2.2,0.175,110,1.5],
      [32,2.2,0.225,110,1.1],
      [40,2.2,0.35,110,1.4],
      [50,2.2,0.4,110,1.5],
      [65,2.4,0.325,110,2.8,{"note":"Macro"}],
      [75,2.2,0.7,110,1.8],
      [100,2.6,0.6,110,1.8],
      [135,2.8,0.85,110,2.1],
      [152,3,1.1,110,2.1]
    ]},
    {"id":"leitz-slx","sec":"s35","brand":"Leitz","name":"Summilux-C","mount":"PL","ic":33,"icType":"circle","icNote":"Leitz: Image Circle 33 mm","mod":null,"src":["leitz-slx"],"notes":["135 мм: T1.4–T16, Ø 114 мм; остальные — Ø 95 мм.","Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [16,1.4,0.45,95,1.7],
      [18,1.4,0.45,95,1.6],
      [21,1.4,0.38,95,1.6],
      [25,1.4,0.38,95,1.8],
      [29,1.4,0.45,95,1.7],
      [35,1.4,0.45,95,1.6],
      [40,1.4,0.45,95,1.6],
      [50,1.4,0.6,95,1.8],
      [65,1.4,0.45,95,1.7],
      [75,1.4,0.79,95,1.6],
      [100,1.4,0.99,95,1.6],
      [135,1.4,1.25,114,3.4]
    ]},
    {"id":"leitz-scr","sec":"s35","brand":"Leitz","name":"Summicron-C","mount":"PL","ic":36,"icType":"circle","icNote":"Leitz: Image Circle 36 mm","mod":null,"src":["leitz-scr"],"notes":["Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [15,2,0.3,95,1.8],
      [18,2,0.3,95,1.3],
      [21,2,0.3,95,1.3],
      [25,2,0.3,95,1.5],
      [29,2,0.3,95,1.3],
      [35,2,0.36,95,1.3],
      [40,2,0.45,95,1.3],
      [50,2,0.6,95,1.5],
      [75,2,0.8,95,1.2],
      [100,2,1,95,1.2],
      [135,2,1.35,95,1.8]
    ]},
    {"id":"arri-up-lds","sec":"s35","brand":"ARRI / ZEISS","name":"LDS Ultra Prime","mount":"PL LDS","ic":31.14,"icType":"format","icNote":"ARRI: формат ANSI Super 35 (диагональ 31,14 мм)","mod":"sensor","src":["arri-up-lds"],"notes":["Версия Ultra Prime с Lens Data System: другие корпуса — Ø и вес отличаются от обычных Ultra Prime.","Линейка в разделе Legacy у ARRI."],"lenses":[
      [12,2,0.3,156,2.2],
      [14,1.9,0.22,114,1.8],
      [16,1.9,0.25,104,1.5],
      [20,1.9,0.28,104,1.5],
      [24,1.9,0.3,104,1.3],
      [28,1.9,0.28,104,1.5],
      [32,1.9,0.35,104,1.4],
      [40,1.9,0.38,104,1.4],
      [50,1.9,0.6,104,1.2],
      [65,1.9,0.65,104,1.4],
      [85,1.9,0.9,104,1.5],
      [100,1.9,1,104,1.5],
      [135,1.9,1.5,104,2],
      [180,1.9,2.6,114,2.8]
    ]},
    {"id":"arri-mm100","sec":"s35","brand":"ARRI / ZEISS","name":"Master Macro 100","mount":"PL LDS","ic":31.14,"icType":"nominal","icNote":"Линейка Master Prime (Super 35); диаметр круга для Macro ARRI не публикует","mod":"sensor","src":["arri-mm100"],"notes":["T2.0 на бесконечности, T4.3 при 1:1."],"lenses":[
      [100,2,0.35,114,2.6,{"note":"Macro 1:1"}]
    ]},
    {"id":"cooke-5i","sec":"s35","brand":"Cooke","name":"5/i (S5/i)","mount":"PL","ic":30,"icType":"circle","icNote":"Cooke: Super35, 30 mm","mod":"sensor","src":["cooke-5i"],"notes":["Вес — с PL-байонетом. T1.4."],"lenses":[
      [18,1.4,0.35,110,3],
      [25,1.4,0.35,110,3],
      [32,1.4,0.35,110,2.8],
      [40,1.4,0.4,110,2.8],
      [50,1.4,0.5,110,3.2],
      [65,1.4,0.6,110,3.1],
      [75,1.4,0.65,110,3],
      [100,1.4,0.75,110,2.9],
      [135,1.4,0.85,136,5.1]
    ]},
    {"id":"cooke-mini4","sec":"s35","brand":"Cooke","name":"miniS4/i","mount":"PL","ic":33.54,"icType":"circle","icNote":"Cooke: maximum format cover 33,54 мм","mod":"sensor","src":["cooke-mini4","cooke-book"],"notes":["Раньше называлась Panchro/i (T2.8) — не путать с Panchro/i Classic.","Вес — с PL-байонетом."],"lenses":[
      [18,2.8,0.25,110,1.3],
      [21,2.8,0.25,87,1.6],
      [25,2.8,0.25,87,1.4],
      [32,2.8,0.3,87,1.6],
      [40,2.8,0.4,87,1.7],
      [50,2.8,0.5,87,1.5],
      [65,2.8,0.7,87,1.6],
      [75,2.8,0.75,87,1.6],
      [100,2.8,0.9,87,1.6],
      [135,2.8,1,87,1.8]
    ]},
    {"id":"zeiss-hs","sec":"s35","brand":"ZEISS","name":"High Speed / Super Speed (Mk II/III)","mount":"PL","ic":37,"icType":"circle","icNote":"Super 35. Пятно — замер реставратора TLS на бесконечности при T1.3 (у каждого фокусного своё); ZEISS данных не публикует","mod":"sensor","src":["tls-ss","cinematechnic-zeiss","arri-rental-35"],"tags":["vintage"],"notes":["Это объективы Super 35, а не FF: на FF углы темнеют (видно и в тестах ARRI на LF).","МДФ — оригинальная гравировка по данным TLS (дюймы → м). Ø 95 и вес — у корпуса TLS; оригинальный Ø 80 мм (прокат Camtec), вес оригинала не опубликован.","Mk I — T1.4 (18–85 мм), байонет."],"lenses":[
      [18,1.3,0.28,95,1.55,{"ic":33}],
      [25,1.3,0.25,95,1.1,{"ic":37}],
      [35,1.3,0.3,95,1.14,{"ic":37}],
      [50,1.3,0.48,95,1.13,{"ic":41}],
      [65,1.3,0.69,95,1.23,{"ic":49}],
      [85,1.3,0.91,95,1.46,{"ic":60}]
    ]},
    {"id":"zeiss-std","sec":"s35","brand":"ZEISS","name":"Standard Speed T2.1 (Mk II)","mount":"PL","ic":31.14,"icType":"nominal","icNote":"Super 35 (ориентир по формату); ZEISS данных не публикует","mod":null,"src":["cinematechnic-zeiss","arri-rental-35"],"tags":["vintage"],"notes":["Mk I — T2.2 (16–85 мм)."],"lenses":[
      [10,2.1,null,null,null],
      [12,2.1,null,null,null],
      [14,2.1,null,null,null],
      [16,2.1,null,null,null],
      [20,2.1,null,null,null],
      [24,2.1,null,null,null],
      [28,2.1,null,null,null],
      [32,2.1,null,null,null],
      [40,2.1,null,null,null],
      [50,2.1,null,null,null],
      [85,2.1,null,null,null],
      [100,2.1,null,null,null],
      [135,2.1,null,null,null]
    ]},
    {"id":"cooke-speedpanchro","sec":"s35","brand":"Cooke","name":"Speed Panchro","mount":"PL (рехаус)","ic":31.14,"icType":"nominal","icNote":"Академический / Super 35 кадр — ориентир; Cooke данных по винтажу не публикует","mod":null,"src":["arri-rental-35","cooke-book"],"tags":["vintage"],"notes":["T2.2–T2.8 в зависимости от фокусного (точные значения по объективам не опубликованы).","Выпускались с 1930-х (Cooke Book: 24–108 мм в 1935 г.); сегодня — в рехаусах (TLS и др.)."],"lenses":[
      [18,null,null,null,null],
      [25,null,null,null,null],
      [32,null,null,null,null],
      [40,null,null,null,null],
      [50,null,null,null,null],
      [75,null,null,null,null],
      [100,null,null,null,null]
    ]},
    {"id":"bl-superbaltar","sec":"s35","brand":"Bausch & Lomb","name":"Super Baltar","mount":"PL (рехаус)","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир; производитель данных не публикует","mod":null,"src":["arri-rental-35"],"tags":["vintage"],"notes":["T2.3 по списку ARRI Rental. Остальное — н/д."],"lenses":[
      [20,2.3,null,null,null],
      [25,2.3,null,null,null],
      [35,2.3,null,null,null],
      [50,2.3,null,null,null],
      [75,2.3,null,null,null],
      [100,2.3,null,null,null]
    ]},
    {"id":"kowa-prominar","sec":"s35","brand":"Kowa","name":"Cine Prominar (TLS)","mount":"PL (рехаус)","ic":31.14,"icType":"nominal","icNote":"Super 35 (прокат Camtec); производитель данных не публикует","mod":null,"src":["tls-kowa","keslow-kowa"],"tags":["vintage"],"notes":["Объективы 1960-х в корпусе TLS: Ø и вес — у корпуса TLS, МДФ — по прокату Keslow (совпадает с Camtec).","Прокат No Drama указывает, что 32, 50, 75, 100 мм покрывают FF."],"lenses":[
      [15,4,0.18,125,0.9],
      [20,2.6,0.25,110,1.63],
      [25,2.3,0.28,110,2.02],
      [32,2.3,0.25,110,1.08],
      [40,2.3,0.33,110,0.99],
      [50,2.3,0.48,110,1.01],
      [75,2.3,0.71,110,1.37],
      [100,2.6,0.99,110,1.85]
    ]},
    {"id":"lomo-sph","sec":"s35","brand":"LOMO","name":"Spherical (Round Front)","mount":"OCT-19 / PL (рехаус)","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир; ЛОМО данных не публикует","mod":null,"src":["arri-rental-35"],"tags":["vintage"],"notes":["T2.2–T3.1 по фокусным (по объективам не опубликовано)."],"lenses":[
      [18,null,null,null,null],
      [22,null,null,null,null],
      [28,null,null,null,null],
      [35,null,null,null,null],
      [50,null,null,null,null],
      [75,null,null,null,null],
      [100,null,null,null,null]
    ]},
    {"id":"lomo-illumina","sec":"s35","brand":"LOMO","name":"Illumina MkII","mount":"PL","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир","mod":null,"src":["arri-rental-35"],"tags":["vintage"],"notes":[],"lenses":[
      [18,1.3,null,null,null],
      [25,1.3,null,null,null],
      [35,1.3,null,null,null],
      [50,1.3,null,null,null],
      [85,1.3,null,null,null]
    ]},
    {"id":"pv-primo","sec":"s35","brand":"Panavision","name":"Primo","mount":"PV","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир; Panavision диаметр круга не публикует","mod":null,"src":["pv-primo"],"tags":["rental"],"notes":["Только аренда Panavision (не продаются); байонет PV.","Есть также Primo Classic, Primo V, Primo 70 и анаморфоты Panavision — тоже только аренда, без полных ТТХ."],"lenses":[
      [10,1.9,0.61,116.3,3],
      [14.5,1.9,0.61,113,1.7],
      [17.5,1.9,0.61,113,1.5],
      [21,1.9,0.61,113,1.8],
      [27,1.9,0.61,113,2.4],
      [35,1.9,0.61,113,2.4],
      [40,1.9,0.61,113,2.1],
      [50,1.9,0.61,113,2.7],
      [65,1.8,0.61,113,2.4],
      [75,1.9,0.914,113,1.6],
      [85,1.8,0.61,113,1.5],
      [100,1.9,0.914,113,1.8],
      [125,1.8,0.66,113,null],
      [150,1.9,1.543,113,3.4]
    ]},
    {"id":"vantage-minihawk","sec":"s35","brand":"Vantage / Hawk","name":"MiniHawk","mount":"PL","ic":31.5,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (30,9–37 мм)","mod":"sensor","src":["vantage-minihawk"],"notes":["Сферические (1×) «гибридные» объективы с анаморфотным характером боке.","МДФ — CFD (close focus distance) из таблицы Vantage."],"lenses":[
      [29,1.7,0.25,128,2.3,{"ic":31.5}],
      [35,1.7,0.25,110,2.1,{"ic":30.9}],
      [40,1.7,0.25,110,1.9,{"ic":32}],
      [50,1.7,0.25,110,1.8,{"ic":33.7}],
      [65,1.7,0.25,110,1.9,{"ic":34.4}],
      [80,1.7,0.35,110,1.6,{"ic":34}],
      [100,1.7,0.35,110,1.5,{"ic":35.5}],
      [135,1.7,0.35,110,1.7,{"ic":37}],
      [180,1.7,0.5,128,2.1,{"ic":35}]
    ]},
    {"id":"vantage-one","sec":"s35","brand":"Vantage / Hawk","name":"Vantage One (T1)","mount":"PL","ic":30,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (30–39 мм)","mod":"sensor","src":["vantage-one"],"notes":["МДФ — CFD из таблицы Vantage."],"lenses":[
      [14.5,1,0.25,128,2.4,{"ic":32.2}],
      [17.5,1,0.25,110,2,{"ic":30}],
      [21,1,0.25,110,1.8,{"ic":32.2}],
      [25,1,0.25,110,1.6,{"ic":33.5}],
      [32,1,0.25,110,1.8,{"ic":34}],
      [40,1,0.35,110,1.5,{"ic":34}],
      [50,1,0.29,110,1.4,{"ic":36}],
      [65,1,0.39,110,1.6,{"ic":38}],
      [90,1,0.59,128,2,{"ic":36}],
      [120,1,0.81,156,3.7,{"ic":39}]
    ]},
    {"id":"arri-sig","sec":"ff","brand":"ARRI","name":"Signature Prime","mount":"LPL","ic":46.3,"icType":"circle","icNote":"ARRI: 46.3 mm image circle","mod":"sensor","src":["arri-sp","arri-sig-broch"],"notes":["МДФ — от плоскости сенсора (minimum marked distance). На карточках объективов ARRI приводит ещё и МДФ от передней линзы.","280 мм совместим с экстендером 1,7× (T4.95, 4,9 кг в сборе)."],"lenses":[
      [12,1.8,0.35,134,2.8],
      [15,1.8,0.35,156,2.8],
      [18,1.8,0.35,114,2],
      [21,1.8,0.35,114,1.9],
      [25,1.8,0.35,114,1.9],
      [29,1.8,0.35,114,1.8],
      [35,1.8,0.35,114,1.7],
      [40,1.8,0.35,114,1.8],
      [47,1.8,0.45,114,1.8],
      [58,1.8,0.45,114,2],
      [75,1.8,0.65,114,1.9],
      [95,1.8,0.85,114,1.9],
      [125,1.8,1,114,2.3],
      [150,1.8,1.5,114,3.25],
      [200,2.5,1.8,114,3.1],
      [280,2.8,2.5,134,4.3]
    ]},
    {"id":"zeiss-sp","sec":"ff","brand":"ZEISS","name":"Supreme Prime","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"ZEISS: Image Diagonal 46,3 мм у всех Supreme Prime","mod":"sensor","src":["zeiss-sp","zeiss-sp-broch"],"notes":[],"lenses":[
      [15,1.8,0.35,114,2.24],
      [18,1.5,0.35,114,2.27],
      [21,1.5,0.35,95,1.61],
      [25,1.5,0.26,95,1.42],
      [29,1.5,0.33,95,1.61],
      [35,1.5,0.32,95,1.4],
      [40,1.5,0.42,95,1.49],
      [50,1.5,0.45,95,1.22],
      [65,1.5,0.6,95,1.63],
      [85,1.5,0.84,95,1.42],
      [100,1.5,1.1,95,1.7],
      [135,1.5,1.4,114,2.27],
      [150,1.8,1.5,114,2.27],
      [200,2.2,2,114,2.87]
    ]},
    {"id":"cooke-s7","sec":"ff","brand":"Cooke","name":"S7/i FF","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"Cooke: Full Frame and beyond, coverage of 46.3 mm","mod":"sensor","src":["cooke-s7"],"notes":["Вес — с PL-байонетом. 180 и 300 мм — с опорой."],"lenses":[
      [16,2,0.4,136,4],
      [18,2,0.4,110,3.5],
      [21,2,0.4,110,3.3],
      [25,2,0.35,110,3.3],
      [27,2,0.35,110,3.3],
      [32,2,0.35,110,3.4],
      [40,2,0.45,110,3.5],
      [50,2,0.5,110,3.4],
      [65,2,0.5,110,3],
      [75,2,0.475,110,3],
      [100,2,0.7,110,3.3],
      [135,2,0.95,110,3.7],
      [180,2,1.3,110,3.6],
      [300,3.3,2.1,110,4.4]
    ]},
    {"id":"cooke-s4ff","sec":"ff","brand":"Cooke","name":"S4 FF/i","mount":"PL / LPL","ic":43.27,"icType":"format","icNote":"Cooke: Full Frame (36 × 24 мм, диагональ 43,27 мм); диаметр круга не указан","mod":"sensor","src":["cooke-s4ff"],"notes":["Новая линейка (спецификация 10/2026).","Вес — с байонетом."],"lenses":[
      [18,2,0.3,87,1.8],
      [25,2,0.28,87,1.65],
      [35,2,0.28,87,1.7],
      [50,2,0.35,87,1.45],
      [75,2,0.45,87,1.6],
      [100,2,0.65,87,1.65]
    ]},
    {"id":"cooke-panff","sec":"ff","brand":"Cooke","name":"Panchro/i Classic FF","mount":"PL / LPL","ic":43.3,"icType":"circle","icNote":"Cooke: Full Frame, optimised for coverage of 43.3 mm","mod":"sensor","src":["cooke-panff"],"notes":["Вес — с PL-байонетом. Для 18 мм Cooke оговаривает, что часть характеристик может измениться."],"lenses":[
      [18,2.2,0.3,125,2.2],
      [21,2.2,0.3,110,1.9],
      [25,2.2,0.35,110,2],
      [27,2.2,0.35,110,2.1],
      [32,2.2,0.35,110,1.9],
      [40,2.2,0.35,110,1.5],
      [50,2.2,0.4,110,1.4],
      [65,2.4,0.325,110,2.8,{"note":"Macro"}],
      [75,2.2,0.7,110,1.8],
      [100,2.6,0.6,110,1.8],
      [135,2.8,0.85,110,2.1],
      [152,3,1.1,110,2.1]
    ]},
    {"id":"leitz-prime","sec":"ff","brand":"Leitz","name":"Leitz Prime","mount":"PL / LPL","ic":46.5,"icType":"circle","icNote":"Leitz: Image Circle 46.5 mm","mod":null,"src":["leitz-prime"],"notes":["Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [18,1.8,0.35,114,3.2],
      [21,1.8,0.55,114,2.76],
      [25,1.8,0.55,114,2.8],
      [29,1.8,0.35,114,2.67],
      [35,1.8,0.45,114,2.87],
      [40,1.8,0.35,114,2.71],
      [50,1.8,0.47,114,2.7],
      [65,1.8,0.65,114,2.78],
      [75,1.8,0.75,114,2.83],
      [100,1.8,1.2,114,2.77],
      [135,1.8,1.2,114,2.89],
      [180,2,1.5,114,3.1],
      [350,3.6,3,114,4.4]
    ]},
    {"id":"zeiss-cp3","sec":"ff","brand":"ZEISS","name":"CP.3 / CP.3 XD","mount":"PL (сменный)","ic":46.3,"icType":"circle","icNote":"ZEISS (брошюра): coverage up to 46.3 mm image circle","mod":"sensor","src":["zeiss-cp3","zeiss-cp3-broch"],"notes":["100 мм — версия CF (close focus)."],"lenses":[
      [15,2.9,0.3,95,0.87],
      [18,2.9,0.3,95,0.86],
      [21,2.9,0.24,95,0.82],
      [25,2.1,0.26,95,0.82],
      [28,2.1,0.24,95,0.84],
      [35,2.1,0.3,95,0.8],
      [50,2.1,0.45,95,0.77],
      [85,2.1,1,95,0.88],
      [100,2.1,0.7,95,1.01,{"note":"CF"}],
      [135,2.1,1,95,1.15]
    ]},
    {"id":"sigma-ffhs","sec":"ff","brand":"SIGMA","name":"FF High Speed","mount":"PL / EF / E","ic":43.3,"icType":"circle","icNote":"SIGMA: Image Circle FF φ43.3 mm (illumination circle более 46.3 мм)","mod":null,"src":["sigma-ffhs"],"notes":["Вес — для версии PL (/i).","SIGMA не уточняет на странице, от чего меряется Close Focus."],"lenses":[
      [14,2,0.27,95,1.4],
      [20,1.5,0.28,95,1.3],
      [24,1.5,0.25,95,1.1],
      [28,1.5,0.28,95,1.3],
      [35,1.5,0.3,95,1.1],
      [40,1.5,0.4,95,1.5],
      [50,1.5,0.4,95,1.2],
      [65,1.5,0.65,95,1.5],
      [85,1.5,0.85,95,1.4],
      [105,1.5,1,95,1.7],
      [135,2,0.88,95,1.5]
    ]},
    {"id":"arri-enso","sec":"ff","brand":"ARRI","name":"Ensō Prime","mount":"LPL","ic":44.71,"icType":"format","icNote":"ARRI: «designed for large-format/full-frame cameras»; диаметр не опубликован — в расчёте берём диагональ ALEXA LF Open Gate 44,71 мм","mod":"sensor","src":["arri-enso","arri-enso-faq"],"notes":["Новая линейка ARRI. Ø 10,5 и 14 мм: 134 или 156 мм.","Совместимы с Ensō Vintage Elements (сменные задние элементы для «винтажного» рисунка)."],"lenses":[
      [10.5,2.8,0.27,134,2.3],
      [14,2.5,0.27,134,2],
      [18,2.1,0.2,95,1.4],
      [21,2.1,0.22,95,1.4],
      [24,2.1,0.23,95,1.4],
      [28,2.1,0.23,95,1.5],
      [32,2.1,0.25,95,1.4],
      [40,2.1,0.28,95,1.3],
      [47,2.1,0.32,95,1.3],
      [58,2.1,0.36,95,1.5],
      [75,2.1,0.43,95,1.5],
      [105,2.1,0.59,95,1.6],
      [150,2.5,0.77,95,1.9],
      [250,2.8,1.3,114,2.9],
      [350,4,1.33,114,3.5],
      [500,5.8,1.34,114,3.6]
    ]},
    {"id":"cooke-s8","sec":"ff","brand":"Cooke","name":"S8/i FF","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"Cooke: 46,3 мм (18 мм оптимизирован для 43,3 мм)","mod":"sensor","src":["cooke-s8"],"notes":["T1.4. Вес — с PL-байонетом."],"lenses":[
      [18,1.4,0.6,136,3.4,{"ic":43.3}],
      [21,1.4,0.6,125,3.5],
      [25,1.4,0.55,104,2.4],
      [27,1.4,0.6,104,2.6],
      [32,1.4,0.65,104,2.4],
      [35,1.4,0.7,104,2.4],
      [40,1.4,0.65,104,2.3],
      [50,1.4,0.7,104,2.5],
      [65,1.4,0.75,104,2.6],
      [75,1.4,0.8,104,2.4],
      [100,1.4,0.85,104,2.6],
      [135,1.4,1.2,104,3.2]
    ]},
    {"id":"cooke-macro","sec":"ff","brand":"Cooke","name":"Macro/i FF","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"Cooke: 46,3 мм","mod":null,"src":["cooke-macro"],"notes":["Все — до 1:1. МДФ Cooke указывает как масштаб 1:1; от передней линзы: 46 / 92 / 172 мм. МДФ от сенсора — н/д.","Потеря света на 1:1: −1,4 / −1,8 / −1,7 ступени."],"lenses":[
      [60,2.5,null,87,2.3,{"note":"1:1"}],
      [90,2.5,null,87,2.5,{"note":"1:1"}],
      [150,2.5,null,87,2.9,{"note":"1:1"}]
    ]},
    {"id":"cooke-sp3","sec":"ff","brand":"Cooke","name":"SP3","mount":"E / RF / L / Z","ic":43.3,"icType":"circle","icNote":"Cooke: Full Frame 43,3 мм","mod":"sensor","src":["cooke-sp3"],"notes":["Компактные объективы для беззеркальных камер. Вес в граммах из спецификации → кг."],"lenses":[
      [18,2.4,0.25,82,0.688],
      [25,2.4,0.25,64,0.575],
      [32,2.4,0.35,64,0.52],
      [50,2.4,0.5,64,0.5],
      [75,2.4,0.8,64,0.52],
      [100,2.4,0.8,82,0.69]
    ]},
    {"id":"cooke-ap3","sec":"ff","brand":"Cooke","name":"AP3","mount":"E","ic":43.3,"icType":"circle","icNote":"Cooke: Full Frame 43,3 мм","mod":"sensor","src":["cooke-ap3"],"notes":["Новая линейка (спецификация 04/2026)."],"lenses":[
      [35,2.4,0.5,87,1.279],
      [50,2.4,0.6,87,1.177],
      [85,2.4,0.9,87,1.41]
    ]},
    {"id":"zeiss-spr","sec":"ff","brand":"ZEISS","name":"Supreme Prime Radiance","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"ZEISS: Image Diagonal 46,3 мм","mod":"sensor","src":["zeiss-spr","zeiss-sp-broch"],"notes":["Контролируемые блики (T* blue)."],"lenses":[
      [18,1.5,0.35,114,2.27],
      [21,1.5,0.35,95,1.5],
      [25,1.5,0.26,95,1.42],
      [29,1.5,0.33,95,1.61],
      [35,1.5,0.32,95,1.4],
      [40,1.5,0.42,95,1.49],
      [50,1.5,0.45,95,1.22],
      [65,1.5,0.6,95,1.63],
      [85,1.5,0.84,95,1.42],
      [100,1.5,1.1,95,1.7],
      [135,1.5,1.4,114,2.27]
    ]},
    {"id":"zeiss-aatma","sec":"ff","brand":"ZEISS","name":"Aatma","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"ZEISS (FDTimes на zeiss.com): Image circle 46,3 мм","mod":"sensor","src":["zeiss-aatma","zeiss-aatma-fdt"],"notes":["Новая линейка ZEISS."],"lenses":[
      [18,1.5,0.35,114,2.27],
      [25,1.5,0.26,95,1.42],
      [35,1.5,0.32,95,1.4],
      [40,1.5,0.43,95,1.49],
      [50,1.5,0.46,95,1.22],
      [65,1.5,0.61,95,1.63],
      [85,1.5,0.84,95,1.42],
      [100,1.5,1.1,95,1.7],
      [135,1.5,1.4,114,2.27]
    ]},
    {"id":"zeiss-nano","sec":"ff","brand":"ZEISS","name":"Nano Prime","mount":"E / RF","ic":43.27,"icType":"format","icNote":"ZEISS: full frame (36 × 24 мм, диагональ 43,27 мм); диаметр круга не указан","mod":"sensor","src":["zeiss-nano"],"notes":["Для беззеркальных камер. T1.5–T16."],"lenses":[
      [18,1.5,0.25,95,1.19],
      [24,1.5,0.35,95,0.88],
      [35,1.5,0.45,95,0.87],
      [50,1.5,0.5,95,0.92],
      [75,1.5,0.75,95,1.13],
      [100,1.5,1,95,1.26]
    ]},
    {"id":"leitz-hugo","sec":"ff","brand":"Leitz","name":"Hugo","mount":"LPL / L","ic":43.3,"icType":"circle","icNote":"Leitz: Image Circle 43,3 мм","mod":null,"src":["leitz-hugo"],"notes":["Series I — T1.5 (135 мм T1.9); Series II — T2.1; 50-N — T1.0.","Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [18,1.5,0.22,95,1.04],
      [21,1.5,0.3,95,0.85],
      [24,1.5,0.3,95,0.86],
      [28,1.5,0.35,95,0.82],
      [35,1.5,0.36,95,0.82],
      [40,1.5,0.36,95,0.87],
      [50,1.5,0.5,95,0.84],
      [50,1,0.5,95,1.16,{"note":"50-N"}],
      [66,2.1,0.6,95,0.82,{"note":"II"}],
      [75,1.5,0.75,95,1.4],
      [75,2.1,0.75,95,0.9,{"note":"II"}],
      [90,1.5,0.85,95,1.37],
      [90,2.1,0.85,95,0.91,{"note":"II"}],
      [135,1.9,1,95,1.59]
    ]},
    {"id":"leitz-elsie","sec":"ff","brand":"Leitz","name":"Elsie","mount":"LPL","ic":46.5,"icType":"circle","icNote":"Leitz: Image Circle 46,5 мм","mod":null,"src":["leitz-elsie"],"notes":["T2.1.","Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [15,2.1,0.35,114,2.5],
      [18,2.1,0.35,114,2.4],
      [21,2.1,0.35,114,2.4],
      [25,2.1,0.35,95,2],
      [29,2.1,0.35,95,2.1],
      [35,2.1,0.35,95,2.1],
      [40,2.1,0.35,95,2.1],
      [50,2.1,0.5,95,2],
      [65,2.1,0.65,95,2.1],
      [75,2.1,0.75,95,2.1],
      [100,2.1,0.85,95,2.1],
      [125,2.1,1.25,114,2.4],
      [150,2.1,1.5,114,2.4]
    ]},
    {"id":"leitz-hektor","sec":"ff","brand":"Leitz","name":"Hektor","mount":"L / E / Z / RF / G","ic":47.8,"icType":"circle","icNote":"Leitz: Image Circle 47,8 мм","mod":null,"src":["leitz-hektor"],"notes":["T2.1, для беззеркальных камер.","Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [18,2.1,0.22,80,0.84],
      [25,2.1,0.3,80,0.77],
      [35,2.1,0.35,80,0.71],
      [50,2.1,0.5,80,0.66],
      [73,2.1,0.75,80,0.72],
      [100,2.1,0.85,80,0.97]
    ]},
    {"id":"leitz-m08","sec":"ff","brand":"Leitz","name":"M 0.8","mount":"M","ic":43.3,"icType":"circle","icNote":"Leitz: Image Circle 43,3 мм","mod":null,"src":["leitz-m08"],"notes":["Leitz указывает диафрагму в f, а не T: в колонке T — н/д, f — в пометке.","Ø передней части не опубликован."],"lenses":[
      [21,null,0.7,null,0.515,{"note":"f/1.4"}],
      [24,null,0.7,null,0.505,{"note":"f/1.4"}],
      [28,null,0.7,null,0.48,{"note":"f/1.4"}],
      [35,null,0.7,null,0.38,{"note":"f/1.4"}],
      [50,null,0.7,null,0.466,{"note":"f/1.4"}],
      [50,null,1,null,0.835,{"note":"50-N f/0.95"}],
      [75,null,0.7,null,0.572,{"note":"f/2"}],
      [90,null,1,null,0.605,{"note":"f/2"}]
    ]},
    {"id":"sigma-aizu","sec":"ff","brand":"SIGMA","name":"Aizu Prime","mount":"PL / E / L","ic":46.3,"icType":"circle","icNote":"SIGMA: Image Circle 46,3 мм","mod":null,"src":["sigma-aizu"],"notes":["T1.3. Вес — версия PL.","SIGMA не уточняет на странице, от чего меряется Close Focus."],"lenses":[
      [21,1.3,0.35,95,1.6],
      [25,1.3,0.31,95,1.7],
      [27,1.3,0.33,95,1.7],
      [32,1.3,0.34,95,1.7],
      [35,1.3,0.35,95,1.6],
      [40,1.3,0.38,95,1.6],
      [50,1.3,0.48,95,1.7],
      [65,1.3,0.61,95,1.6],
      [75,1.3,0.73,95,1.7],
      [100,1.3,1,95,2.2],
      [125,1.3,1.25,114,2.2]
    ]},
    {"id":"sigma-classic","sec":"ff","brand":"SIGMA","name":"FF Classic","mount":"PL","ic":43.3,"icType":"circle","icNote":"SIGMA: Image Circle FF φ43,3 мм","mod":null,"src":["sigma-classic"],"notes":["Оптика FF High Speed с пониженным просветлением (T2.5/T3.2). Вес — PL."],"lenses":[
      [14,3.2,0.27,95,1.4],
      [20,2.5,0.28,95,1.3],
      [24,2.5,0.25,95,1.1],
      [28,2.5,0.28,95,1.3],
      [35,2.5,0.3,95,1.1],
      [40,2.5,0.4,95,1.5],
      [50,2.5,0.4,95,1.2],
      [65,2.5,0.65,95,1.6],
      [85,2.5,0.85,95,1.4],
      [105,2.5,1,95,1.7],
      [135,3.2,0.88,95,1.5]
    ]},
    {"id":"canon-sumire","sec":"ff","brand":"Canon","name":"Sumire Prime (CN-E FP X)","mount":"PL (EF в сервисе)","ic":43.27,"icType":"format","icNote":"Canon: Full-Frame coverage (36 × 24 мм, диагональ 43,27 мм)","mod":"sensor","src":["canon-sumire"],"notes":["Ø передней части — 114 мм (страница Canon USA)."],"lenses":[
      [14,3.1,0.2,114,1.2],
      [20,1.5,0.3,114,1.2],
      [24,1.5,0.3,114,1.2],
      [35,1.5,0.3,114,1.1],
      [50,1.3,0.45,114,1.1],
      [85,1.3,0.95,114,1.3],
      [135,2.2,1,114,1.4]
    ]},
    {"id":"canon-cne","sec":"ff","brand":"Canon","name":"CN-E Prime (первое поколение)","mount":"EF","ic":43.27,"icType":"nominal","icNote":"FF — по списку ARRI Rental; характеристики в этой версии не собраны","mod":null,"src":["arri-rental-ff"],"notes":["T1.5–T3.1 по линейке (по объективам не сверено с Canon)."],"lenses":[
      [14,null,null,null,null],
      [20,null,null,null,null],
      [24,null,null,null,null],
      [35,null,null,null,null],
      [50,null,null,null,null],
      [85,null,null,null,null],
      [135,null,null,null,null]
    ]},
    {"id":"canon-k35","sec":"ff","brand":"Canon","name":"K35","mount":"PL (рехаус)","ic":43.27,"icType":"nominal","icNote":"ARRI Rental относит к FF (и к 35 мм); Canon данных не публикует","mod":null,"src":["arri-rental-ff","arri-rental-35"],"tags":["vintage"],"notes":["T1.4–T1.6 по списку ARRI Rental; в списке 35 мм есть 50 и 135 мм (T1.3–T2).","Есть K35 High-Speed (18/24/35/50/85, T1.3–T1.5)."],"lenses":[
      [18,null,null,null,null],
      [24,null,null,null,null],
      [35,null,null,null,null],
      [55,null,null,null,null],
      [85,null,null,null,null]
    ]},
    {"id":"leica-r","sec":"ff","brand":"Leica (рехаус GL Optics)","name":"Leica R","mount":"PL (рехаус)","ic":44,"icType":"circle","icNote":"Вторичный: прокат Cine Visuals — «44 mm image circle»; Leica данных не публикует","mod":null,"src":["rule-leicar","cinevisuals-leicar"],"tags":["vintage"],"notes":["Объективы Leica R в корпусах G.L. Optics (Mk IV): Ø и вес — у корпуса.","Есть также 15, 16, 21, 100 Macro, 180, 280 мм."],"lenses":[
      [19,2.9,0.3,95,0.91],
      [24,2.9,0.23,95,0.73],
      [28,2.9,0.2,95,0.73],
      [35,1.5,0.48,95,1.27],
      [35,2.1,0.2,95,1],
      [50,1.5,0.3,95,0.82],
      [50,2.1,0.43,95,0.82],
      [60,2.9,0.28,95,1.36,{"note":"Macro"}],
      [80,1.5,0.46,95,1.18],
      [90,2.1,0.53,95,1.09],
      [135,2.9,0.71,95,1.54]
    ]},
    {"id":"ang-prime","sec":"ff","brand":"Angénieux","name":"Optimo Prime","mount":"PL / LPL","ic":46.31,"icType":"circle","icNote":"Angénieux: Image Circle 46,31 мм","mod":"sensor","src":["ang-prime"],"notes":["Вес у Angénieux — «менее» (<) указанного.","100 мм: МДФ в таблице 0,55 м / 2,4 ft — расхождение единиц у производителя."],"lenses":[
      [18,2,0.37,95,1.9],
      [21,1.8,0.37,95,1.9],
      [24,1.8,0.37,95,1.7],
      [28,1.8,0.37,95,1.7],
      [32,1.8,0.37,95,1.7],
      [40,1.8,0.37,95,1.7],
      [50,1.8,0.43,95,1.7],
      [60,1.8,0.55,95,1.7],
      [75,1.8,0.6,95,1.7],
      [100,1.8,0.55,95,1.8],
      [135,1.8,1,95,2],
      [200,2.2,1.22,114,2.3]
    ]},
    {"id":"dzo-vespid","sec":"ff","brand":"DZOFILM","name":"Vespid Prime","mount":"PL / EF","ic":46.5,"icType":"circle","icNote":"DZOFILM: Image Circle 46,5 мм (VV/FF)","mod":"sensor","src":["dzo-vespid"],"notes":["Вес в граммах из инструкции → кг."],"lenses":[
      [12,2.8,0.2,80,0.725],
      [16,2.8,0.25,80,0.93],
      [21,2.1,0.28,80,0.88],
      [25,2.1,0.3,80,1.021],
      [35,2.1,0.3,80,0.962],
      [40,2.1,0.3,80,0.905],
      [50,2.1,0.46,80,0.857],
      [75,2.1,0.6,80,0.887],
      [90,2.8,0.258,80,0.839,{"note":"Macro 1:1.5"}],
      [100,2.1,0.7,80,0.945],
      [125,2.1,0.79,80,0.981]
    ]},
    {"id":"dzo-arles","sec":"ff","brand":"DZOFILM","name":"Arles Prime","mount":"PL / LPL / EF","ic":46.5,"icType":"circle","icNote":"DZOFILM: Image Circle 46,5 мм (VV/FF)","mod":"sensor","src":["dzo-arles"],"notes":["Вес 1,4–1,9 кг; в инструкции веса не сопоставлены с фокусными однозначно — поэтому н/д.","18 мм есть на сайте, но нет в таблице инструкции: T1.4 и 0,29 м — по прокату TRM (вторичный)."],"lenses":[
      [14,1.9,0.28,95,null],
      [18,1.4,0.29,95,null],
      [21,1.4,0.33,95,null],
      [25,1.4,0.35,95,null],
      [35,1.4,0.35,95,null],
      [40,1.4,0.4,95,null],
      [50,1.4,0.5,95,null],
      [75,1.4,0.75,95,null],
      [100,1.4,0.9,95,null],
      [135,1.8,0.98,95,null],
      [180,2.4,1.07,95,null]
    ]},
    {"id":"tribe7-bw7","sec":"ff","brand":"TRIBE7","name":"Blackwing7","mount":"PL","ic":50,"icType":"circle","icNote":"TRIBE7: максимальная зона освещения по объективам 50–62 мм","mod":null,"src":["tribe7"],"notes":["T1.9 (77 и 107 мм — T1.8). Три варианта «настройки» на каждое фокусное.","TRIBE7 не уточняет, от чего меряется Close Focus."],"lenses":[
      [20.7,1.9,0.23,104,1.5,{"ic":50}],
      [23.7,1.9,0.26,104,1.5,{"ic":50}],
      [27,1.9,0.34,104,1.7,{"ic":55}],
      [37,1.9,0.457,104,1.6,{"ic":60}],
      [47,1.9,0.445,104,1.5,{"ic":60}],
      [57,1.9,0.483,104,1.6,{"ic":60}],
      [77,1.8,0.66,104,1.4,{"ic":60}],
      [107,1.8,0.685,104,1.4,{"ic":62}],
      [137,1.9,0.813,104,1.5,{"ic":62}]
    ]},
    {"id":"vantage-one4","sec":"ff","brand":"Vantage / Hawk","name":"Vantage One4","mount":"PL / LPL","ic":45,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (45–60+ мм)","mod":"sensor","src":["vantage-one4"],"notes":["T1.4. МДФ — CFD из таблицы Vantage. 140 мм — пятно «>60 мм»."],"lenses":[
      [19,1.4,0.22,156,2.9,{"ic":45}],
      [22,1.4,0.25,136,2.8,{"ic":45}],
      [27,1.4,0.3,136,3.1,{"ic":45.5}],
      [35,1.4,0.25,136,2.7,{"ic":46}],
      [42,1.4,0.26,136,3.3,{"ic":48.5}],
      [50,1.4,0.35,120,2,{"ic":48}],
      [65,1.4,0.4,120,1.5,{"ic":55}],
      [80,1.4,0.5,120,1.6,{"ic":59}],
      [105,1.4,0.7,120,1.8,{"ic":59}],
      [140,1.4,0.92,120,2.8,{"ic":60,"note":">60"}]
    ]},
    {"id":"tokina-vista","sec":"ff","brand":"Tokina","name":"Cinema Vista","mount":"PL","ic":46.3,"icType":"nominal","icNote":"VistaVision — по описанию; в этой версии характеристики с сайта Tokina не собраны","mod":null,"src":["arri-rental-ff"],"notes":["T1.5 по списку ARRI Rental."],"lenses":[
      [18,1.5,null,null,null],
      [25,1.5,null,null,null],
      [35,1.5,null,null,null],
      [40,1.5,null,null,null],
      [50,1.5,null,null,null],
      [65,1.5,null,null,null],
      [85,1.5,null,null,null],
      [105,1.5,null,null,null],
      [135,1.5,null,null,null]
    ]},
    {"id":"arri-dnalf","sec":"ff","brand":"ARRI Rental","name":"DNA LF","mount":"LPL","ic":44.71,"icType":"nominal","icNote":"Только аренда ARRI Rental, ТТХ не публикуются; ориентир — ALEXA LF","mod":null,"src":["arri-rental-ff"],"tags":["rental"],"notes":["T1.5–T2 по линейке. Настраиваемые («тюнингуемые») винтажные оптические схемы."],"lenses":[
      [21,null,null,null,null],
      [25,null,null,null,null],
      [29,null,null,null,null],
      [35,null,null,null,null],
      [50,null,null,null,null],
      [75,null,null,null,null],
      [85,null,null,null,null],
      [100,null,null,null,null],
      [135,null,null,null,null]
    ]},
    {"id":"arri-moviecam","sec":"ff","brand":"ARRI Rental","name":"Moviecam","mount":"LPL","ic":44.71,"icType":"nominal","icNote":"Только аренда ARRI Rental, ТТХ не публикуются; ориентир — ALEXA LF","mod":null,"src":["arri-rental-ff"],"tags":["rental"],"notes":["T1.5–T2.8 по линейке."],"lenses":[
      [16,null,null,null,null],
      [20,null,null,null,null],
      [24,null,null,null,null],
      [28,null,null,null,null],
      [35,null,null,null,null],
      [40,null,null,null,null],
      [50,null,null,null,null],
      [60,null,null,null,null],
      [85,null,null,null,null],
      [100,null,null,null,null],
      [135,null,null,null,null]
    ]},
    {"id":"leitz-thalia","sec":"l65","brand":"Leitz","name":"Thalia","mount":"PL / LPL","ic":60,"icType":"circle","icNote":"Leitz: Image Circle 60 mm (до ALEXA 65)","mod":null,"src":["leitz-thalia"],"notes":["Пятно 60 мм — покрывает ALEXA 65 / 265; ARRI Rental относит к 65 мм.","Leitz не указывает, от чего меряется дистанция фокусировки."],"lenses":[
      [20,3.6,0.4,95,1.95],
      [24,3.6,0.2,95,1.42],
      [30,2.9,0.5,95,1.5],
      [35,2.6,0.55,95,1.4],
      [45,2.9,0.6,95,1.46],
      [55,2.8,0.3,95,1.64],
      [70,2.6,0.5,95,1.06],
      [90,2.2,0.9,95,1.04],
      [100,2.2,0.7,95,1.16],
      [120,2.6,0.57,95,1.66],
      [180,3.6,1.5,95,1.62]
    ]},
    {"id":"cooke-pan65","sec":"l65","brand":"Cooke","name":"Panchro 65/i","mount":"PL / LPL","ic":59.86,"icType":"circle","icNote":"Cooke: покрытие ALEXA 65 (54,12 × 25,58 мм, диагональ 59,86 мм)","mod":"sensor","src":["cooke-pan65"],"notes":["Вес — с байонетом, без крышек. Новая линейка (10/2025)."],"lenses":[
      [30,2.8,0.4,125,2.2],
      [40,2.8,0.45,110,1.9],
      [55,2.5,0.5,110,1.7],
      [75,2.5,0.6,110,1.7],
      [100,2.5,0.7,110,1.7],
      [152,2.9,1.3,110,1.8]
    ]},
    {"id":"zeiss-panoptes","sec":"l65","brand":"ZEISS","name":"Panoptes 65","mount":"PL / LPL","ic":59.9,"icType":"circle","icNote":"ZEISS: 59,9 мм image circle","mod":"sensor","src":["zeiss-panoptes"],"notes":["Новая линейка. По 25 и 180 мм ZEISS пока публикует не все данные (н/д)."],"lenses":[
      [25,2.2,null,null,null],
      [35,2.2,0.28,95,1.92],
      [40,2.2,0.35,95,2.09],
      [45,2.2,0.35,95,1.88],
      [55,2.2,0.43,95,1.97],
      [70,2.2,0.49,95,1.62],
      [90,2.2,0.62,95,2.12],
      [110,2.2,0.86,95,1.8],
      [135,2.2,1.1,95,2.18],
      [180,2.2,null,114,null]
    ]},
    {"id":"arri-primedna","sec":"l65","brand":"ARRI Rental","name":"Prime DNA","mount":"XPL / LPL","ic":59.86,"icType":"nominal","icNote":"Только аренда ARRI Rental для ALEXA 65; ТТХ не публикуются — ориентир по кадру ALEXA 65 (59,86 мм)","mod":null,"src":["arri-rental-65"],"tags":["rental"],"notes":["T1.6–T2.8 по линейке (по объективам не опубликовано)."],"lenses":[
      [28,null,null,null,null],
      [35,null,null,null,null],
      [45,null,null,null,null],
      [50,null,null,null,null],
      [55,null,null,null,null],
      [60,null,null,null,null],
      [65,null,null,null,null],
      [70,null,null,null,null],
      [80,null,null,null,null],
      [110,null,null,null,null],
      [150,null,null,null,null],
      [200,null,null,null,null]
    ]},
    {"id":"arri-prime65s","sec":"l65","brand":"ARRI Rental","name":"Prime 65 S","mount":"XPL / LPL","ic":59.86,"icType":"nominal","icNote":"Только аренда ARRI Rental для ALEXA 65; ТТХ не публикуются — ориентир по кадру ALEXA 65 (59,86 мм)","mod":null,"src":["arri-rental-65"],"tags":["rental"],"notes":["T2.5–T2.8 по линейке (по объективам не опубликовано)."],"lenses":[
      [35,null,null,null,null],
      [45,null,null,null,null],
      [55,null,null,null,null],
      [75,null,null,null,null],
      [90,null,null,null,null],
      [120,null,null,null,null],
      [150,null,null,null,null]
    ]},
    {"id":"arri-prime65","sec":"l65","brand":"ARRI Rental","name":"Prime 65","mount":"XPL / LPL","ic":59.86,"icType":"nominal","icNote":"Только аренда ARRI Rental для ALEXA 65; ТТХ не публикуются — ориентир по кадру ALEXA 65 (59,86 мм)","mod":null,"src":["arri-rental-65"],"tags":["rental"],"notes":["T2.2–T4.5 по линейке (по объективам не опубликовано)."],"lenses":[
      [24,null,null,null,null],
      [28,null,null,null,null],
      [35,null,null,null,null],
      [50,null,null,null,null],
      [80,null,null,null,null],
      [100,null,null,null,null],
      [150,null,null,null,null],
      [300,null,null,null,null]
    ]},
    {"id":"arri-vintage765","sec":"l65","brand":"ARRI Rental","name":"Vintage 765","mount":"XPL / LPL","ic":59.86,"icType":"nominal","icNote":"Только аренда ARRI Rental для ALEXA 65; ТТХ не публикуются — ориентир по кадру ALEXA 65 (59,86 мм)","mod":null,"src":["arri-rental-65"],"tags":["rental"],"notes":["T2.1–T4.2 по линейке (по объективам не опубликовано)."],"lenses":[
      [30,null,null,null,null],
      [40,null,null,null,null],
      [50,null,null,null,null],
      [60,null,null,null,null],
      [80,null,null,null,null],
      [100,null,null,null,null],
      [110,null,null,null,null],
      [120,null,null,null,null],
      [150,null,null,null,null],
      [250,null,null,null,null],
      [350,null,null,null,null]
    ]},
    {"id":"arri-ma","sec":"ana","brand":"ARRI / ZEISS","name":"Master Anamorphic","mount":"PL LDS","sq":2,"ic":29.26,"icType":"circle","icNote":"ARRI: Image Diameter 29,26 мм (кадр Super 35 Cinemascope 22,5 × 18,7 мм)","mod":"sensor","src":["arri-ma","arri-ma-sheets","arri-up-zeiss"],"notes":["Коэффициент 2×.","135 мм: ARRI — 3,8 кг, ZEISS — 3,7 кг."],"lenses":[
      [28,1.9,0.65,114,2.5],
      [35,1.9,0.75,95,2.6],
      [40,1.9,0.7,95,2.7],
      [50,1.9,0.75,95,2.6],
      [60,1.9,0.9,95,2.7],
      [75,1.9,0.9,95,2.6],
      [100,1.9,0.95,95,3.1],
      [135,1.9,1.2,95,3.8],
      [180,2.8,1.5,95,3.2]
    ]},
    {"id":"cooke-ana35","sec":"ana","brand":"Cooke","name":"Anamorphic/i S35","mount":"PL / LPL","sq":2,"ic":31.1,"icType":"circle","icNote":"Cooke: Super35, optimised for coverage of 31.1 mm","mod":"sensor","src":["cooke-ana35"],"notes":["Коэффициент 2×. Вес — с PL-байонетом. 25, 135, 180, 300 мм и 65 Macro — с опорой.","SF (Special Flair) — опциональное просветление той же оптики, не отдельная линейка."],"lenses":[
      [25,2.3,1,136,4.2],
      [32,2.3,0.85,110,3.2],
      [40,2.3,0.85,110,3.4],
      [50,2.3,0.85,110,3.6],
      [65,2.6,0.44,136,5.2,{"note":"Macro"}],
      [75,2.3,1,110,3.2],
      [100,2.3,1.2,110,3.4],
      [135,2.3,1.4,110,4.2],
      [180,2.8,2,110,5.8],
      [300,3.5,3,136,9.4]
    ]},
    {"id":"cooke-anaff","sec":"ana","brand":"Cooke","name":"Anamorphic/i Full Frame Plus","mount":"PL / LPL","sq":1.8,"ic":43.3,"icType":"circle","icNote":"Cooke: Full Frame, optimised for coverage of 43.3 mm","mod":"sensor","src":["cooke-anaff"],"notes":["Коэффициент 1,8×. Вес — с PL-байонетом.","SF (Special Flair) — опциональное просветление той же оптики, не отдельная линейка."],"lenses":[
      [32,2.3,0.9,136,4.2],
      [40,2.3,0.9,136,4.4],
      [50,2.3,0.85,110,4],
      [75,2.3,1,110,3.5],
      [85,2.8,0.55,136,5.2,{"note":"Macro"}],
      [100,2.3,1.2,110,3.8],
      [135,2.3,1.5,110,5],
      [180,2.9,2.1,110,6.2]
    ]},
    {"id":"zeiss-horizon","sec":"ana","brand":"ZEISS","name":"Horizon Anamorphic","mount":"LPL","sq":2,"ic":43.27,"icType":"format","icNote":"ZEISS: full frame 2x anamorphic (36 × 24 мм, диагональ 43,27 мм); диаметр круга не указан","mod":"sensor","src":["zeiss-horizon"],"notes":["Коэффициент 2×. Новая линейка ZEISS."],"lenses":[
      [35,2.3,0.79,114,2.42],
      [40,2.3,0.74,114,2.42],
      [50,2.3,0.8,114,2.57],
      [75,2.3,0.99,114,2.7],
      [100,2.3,1.18,114,3.25],
      [150,2.3,1.6,114,3.1],
      [200,2.9,2.22,114,3.25]
    ]},
    {"id":"atlas-orion","sec":"ana","brand":"Atlas","name":"Orion","mount":"PL","sq":2,"ic":31,"icType":"circle","icNote":"Atlas: Image Circle 31 mm (4-perf Super 35)","mod":null,"src":["atlas-orion"],"notes":["Коэффициент 2×.","Atlas не указывает, от чего меряется Min Focus."],"lenses":[
      [18,2,0.45,136,3.15],
      [21,2,0.45,136,3.1],
      [25,2,0.45,136,2.8],
      [28,2,0.45,136,2.9],
      [32,2,0.53,114,2.1],
      [40,2,0.56,114,2.4],
      [50,2,0.76,114,2.3],
      [65,2,0.84,114,2.3],
      [80,2,0.91,114,2.7],
      [100,2,1.1,114,3],
      [135,2.2,1.1,114,3.99],
      [200,3.2,1.1,114,4]
    ]},
    {"id":"hawk-vlite","sec":"ana","brand":"Vantage / Hawk","name":"Hawk V-Lite 2×","mount":"PL","sq":2,"ic":28.5,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (28.5–42 мм)","mod":"sensor","src":["hawk-vlite"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу."],"lenses":[
      [28,2.2,0.8,120,2.1,{"ic":28.5}],
      [35,2.2,1,120,2.9,{"ic":30}],
      [45,2.2,1,104,2,{"ic":31.5}],
      [55,2.2,1,104,2,{"ic":32.5}],
      [55,2.2,0.35,120,3,{"ic":29.5,"note":"Macro"}],
      [65,2.2,1,104,2.2,{"ic":31.5}],
      [80,2.2,1,104,2.4,{"ic":34.5}],
      [110,3,1,104,2.7,{"ic":42}],
      [140,3.5,1,104,2.9,{"ic":42}]
    ]},
    {"id":"hawk-v74","sec":"ana","brand":"Vantage / Hawk","name":"Hawk V-Lite Vintage74 2×","mount":"PL","sq":2,"ic":28.5,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (28.5–42 мм)","mod":"sensor","src":["hawk-v74"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу.","Оптика V-Lite с покрытием 1970-х (Vintage74)."],"lenses":[
      [28,2.3,0.8,120,2.1,{"ic":28.5}],
      [35,2.3,1,120,2.9,{"ic":30}],
      [45,2.3,1,104,2,{"ic":31.5}],
      [55,2.3,1,104,2,{"ic":32.5}],
      [55,2.3,0.35,120,3,{"ic":29.5,"note":"Macro"}],
      [65,2.3,1,104,2.2,{"ic":31.5}],
      [80,2.3,1,104,2.4,{"ic":34.5}],
      [110,3.1,1,104,2.7,{"ic":42}],
      [140,3.6,1,104,2.9,{"ic":42}]
    ]},
    {"id":"hawk-classx","sec":"ana","brand":"Vantage / Hawk","name":"Hawk Class-X 2×","mount":"PL","sq":2,"ic":28.5,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (28.5–42 мм)","mod":"sensor","src":["hawk-classx"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу."],"lenses":[
      [28,2.2,0.8,125,2.2,{"ic":28.5}],
      [35,2.2,0.75,125,3,{"ic":30}],
      [45,2.2,0.75,125,2.5,{"ic":31.5}],
      [55,2.2,0.75,114,2.3,{"ic":32.5}],
      [55,2.2,0.35,125,3,{"ic":29.5,"note":"Macro"}],
      [65,2.2,0.5,114,2.5,{"ic":31.5}],
      [80,2.2,0.75,114,2.6,{"ic":34.5}],
      [110,3,0.75,114,2.8,{"ic":42}],
      [140,3.5,0.75,114,3,{"ic":42}]
    ]},
    {"id":"hawk-c","sec":"ana","brand":"Vantage / Hawk","name":"Hawk C-Series 2×","mount":"PL","sq":2,"ic":29,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (29–40 мм)","mod":"sensor","src":["hawk-c"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу.","Зум C-Series 55-165 — во вкладке ZOOM."],"lenses":[
      [40,2.2,0.9,110,2.2,{"ic":29}],
      [50,2.2,0.93,110,2.1,{"ic":30}],
      [60,2.2,0.93,110,2.2,{"ic":34}],
      [75,2.2,0.95,110,2.5,{"ic":35}],
      [100,3,0.99,110,2.8,{"ic":40}],
      [100,2.8,0.93,110,2.3,{"ic":40,"note":"MkII"}]
    ]},
    {"id":"hawk-vplus","sec":"ana","brand":"Vantage / Hawk","name":"Hawk V-Plus 2×","mount":"PL","sq":2,"ic":28,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (28–35.5 мм)","mod":"sensor","src":["hawk-vplus"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу."],"lenses":[
      [30,2.2,0.75,156,6,{"ic":28}],
      [35,2.2,0.73,156,5.3,{"ic":30}],
      [40,2.2,0.73,156,5.7,{"ic":31}],
      [50,2.2,0.58,125,3.7,{"ic":30.5}],
      [75,2.2,0.6,125,4.3,{"ic":32}],
      [85,2.2,0.6,125,4.5,{"ic":32}],
      [100,2.2,0.98,125,5.7,{"ic":33.5}],
      [135,3,0.98,125,5.4,{"ic":35.5}],
      [150,3,0.98,125,5.6,{"ic":35.5}]
    ]},
    {"id":"hawk-vseries","sec":"ana","brand":"Vantage / Hawk","name":"Hawk V-Series 2×","mount":"PL","sq":2,"ic":28,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (28–42 мм)","mod":"sensor","src":["hawk-vseries"],"notes":["Коэффициент 2×.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу."],"lenses":[
      [25,2.2,1,142,2.8,{"ic":28}],
      [30,2.2,0.8,156,5.8,{"ic":28}],
      [35,2.2,0.75,156,5.7,{"ic":29}],
      [40,2.2,0.75,156,5.6,{"ic":30.5}],
      [50,2.2,0.6,125,3.7,{"ic":30.5}],
      [60,2.2,0.6,125,4,{"ic":31}],
      [75,2.2,0.6,125,4.6,{"ic":31.5}],
      [100,2.2,1,125,6.6,{"ic":34}],
      [120,3.5,0.4,125,5.6,{"ic":32,"note":"Macro"}],
      [135,3,0.95,125,6.4,{"ic":38}],
      [180,3,1.95,142,7.5,{"ic":40}],
      [250,3,2,142,7.8,{"ic":42}],
      [350,4,2,142,8.4,{"ic":37}]
    ]},
    {"id":"hawk65","sec":"ana","brand":"Vantage / Hawk","name":"Hawk65 1.3×","mount":"PL","sq":1.3,"ic":46,"icType":"circle","icNote":"Vantage: Image Circle по каждому объективу (46–60 мм)","mod":"sensor","src":["hawk65"],"notes":["Коэффициент 1,3× — для ALEXA 65 / LF.","МДФ — CFD (close focus distance) из таблицы Vantage; пятно — Image Circle по каждому объективу."],"lenses":[
      [35,2.2,0.8,156,3.5,{"ic":46}],
      [40,2.2,1,156,3.6,{"ic":48}],
      [45,2.2,1,156,3.8,{"ic":50}],
      [50,2.2,0.8,142,3.8,{"ic":51}],
      [60,2.2,1,125,3.3,{"ic":52}],
      [65,2.2,0.55,125,3.4,{"ic":51.5,"note":"Macro"}],
      [70,2.2,1,120,2.9,{"ic":51.5}],
      [80,2.8,0.8,104,2.8,{"ic":53.5}],
      [95,2.8,1,104,2.5,{"ic":54}],
      [120,2.8,1,120,3.9,{"ic":58}],
      [150,2.8,1,120,3.9,{"ic":60,"note":">60"}]
    ]},
    {"id":"atlas-mercury","sec":"ana","brand":"Atlas","name":"Mercury 1.5×","mount":"PL","sq":1.5,"ic":43.27,"icType":"format","icNote":"Atlas: Full-frame sensor coverage (36 × 24 мм, диагональ 43,27 мм)","mod":null,"src":["atlas-mercury"],"notes":["T2.2 (138 мм — T2.6). Ø 95 мм (24 мм — 114 мм).","Таблица Atlas с объединёнными ячейками не даёт однозначно МДФ и вес по объективам (0,46–1,2 м; 1,1–2,1 кг) — поэтому н/д."],"lenses":[
      [24,2.2,null,114,null],
      [27,2.2,null,95,null],
      [32,2.2,null,95,null],
      [36,2.2,null,95,null],
      [42,2.2,null,95,null],
      [54,2.2,null,95,null],
      [72,2.2,null,95,null],
      [95,2.2,null,95,null],
      [138,2.6,null,95,null]
    ]},
    {"id":"laowa-nanomorph","sec":"ana","brand":"LAOWA","name":"Nanomorph S35 1.5×","mount":"PL / EF / E / RF / L / MFT","sq":1.5,"ic":30.2,"icType":"circle","icNote":"LAOWA: пятно 25,6 × 16 мм (диагональ ≈30,2 мм) для 27–50 мм; 65 мм — 28,8 × 18 мм (≈34 мм)","mod":null,"src":["laowa-nano"],"tags":["secondary"],"notes":["Данные — по сводке страницы LAOWA, перепроверить по официальному сайту.","Вес — версия PL."],"lenses":[
      [27,2.8,null,null,0.49],
      [35,2.4,null,null,0.52],
      [50,2.4,null,null,0.55],
      [65,2.4,null,null,0.82,{"ic":33.96}],
      [80,2.4,null,null,0.83,{"ic":33.96}]
    ]},
    {"id":"arri-alfa","sec":"ana","brand":"ARRI Rental","name":"ALFA","mount":"LPL","ic":44.71,"icType":"nominal","icNote":"Только аренда ARRI Rental: «designed for large format»; ТТХ не публикуются","mod":null,"src":["arri-rental-ana"],"tags":["rental"],"notes":["T2.5–T3 по линейке. Коэффициент анаморфирования ARRI Rental в списке не указывает."],"lenses":[
      [32,null,null,null,null],
      [40,null,null,null,null],
      [47,null,null,null,null],
      [60,null,null,null,null],
      [72,null,null,null,null],
      [90,null,null,null,null],
      [108,null,null,null,null],
      [145,null,null,null,null],
      [190,null,null,null,null]
    ]},
    {"id":"canon-xtal","sec":"ana","brand":"Canon","name":"Xtal Express","mount":"PL (рехаус)","sq":2,"ic":28.8,"icType":"nominal","icNote":"Ориентир: кадр 4-perf Scope (диагональ ≈28,8 мм); производитель данных не публикует","mod":null,"src":["arri-rental-ana"],"tags":["vintage"],"notes":["T1.4–T1.6 по линейке (по объективам не опубликовано).","Коэффициент 2×."],"lenses":[
      [24,null,null,null,null],
      [30,null,null,null,null],
      [35,null,null,null,null],
      [50,null,null,null,null],
      [85,null,null,null,null]
    ]},
    {"id":"cooke-xtal","sec":"ana","brand":"Cooke","name":"Xtal Express","mount":"PL (рехаус)","sq":2,"ic":28.8,"icType":"nominal","icNote":"Ориентир: кадр 4-perf Scope (диагональ ≈28,8 мм); производитель данных не публикует","mod":null,"src":["arri-rental-ana"],"tags":["vintage"],"notes":["T2.2–T2.9 по линейке (по объективам не опубликовано).","Коэффициент 2×."],"lenses":[
      [35,null,null,null,null],
      [50,null,null,null,null],
      [75,null,null,null,null],
      [100,null,null,null,null],
      [200,null,null,null,null]
    ]},
    {"id":"cineovision","sec":"ana","brand":"Cineovision","name":"Cineovision","mount":"PL (рехаус)","sq":2,"ic":28.8,"icType":"nominal","icNote":"Ориентир: кадр 4-perf Scope (диагональ ≈28,8 мм); производитель данных не публикует","mod":null,"src":["arri-rental-ana"],"tags":["vintage"],"notes":["T1.4–T2.8 по линейке (по объективам не опубликовано).","Коэффициент 2×."],"lenses":[
      [24,null,null,null,null],
      [35,null,null,null,null],
      [40,null,null,null,null],
      [50,null,null,null,null],
      [85,null,null,null,null],
      [100,null,null,null,null],
      [135,null,null,null,null],
      [200,null,null,null,null]
    ]},
    {"id":"kowa-mirrorscope","sec":"ana","brand":"Kowa","name":"Mirrorscope / Kowa Anamorphic","mount":"PL (рехаус)","sq":2,"ic":28.8,"icType":"nominal","icNote":"Ориентир: кадр 4-perf Scope (диагональ ≈28,8 мм); производитель данных не публикует","mod":null,"src":["arri-rental-ana"],"tags":["vintage"],"notes":["T2.3–T3.4 по линейке (по объективам не опубликовано).","Коэффициент 2×.","В комплекте ARRI Rental — широкоугольная насадка 30 мм."],"lenses":[
      [40,null,null,null,null],
      [50,null,null,null,null],
      [75,null,null,null,null],
      [100,null,null,null,null]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"arri-sigzoom","brand":"ARRI","name":"Signature Zoom","mount":"LPL","ic":46.3,"icType":"circle","icNote":"ARRI: линейка Signature — 46,3 мм","src":["arri-sigzoom","arri-sig-broch"],"notes":["65-300 — с экстендером 1,7×: 110–510 мм, T4.95, 8,7 кг в сборе."],"lenses":[
      [[16,32],2.8,0.45,156,3.2],
      [[24,75],2.8,0.7,114,3.7],
      [[45,135],2.8,1,114,3.6],
      [[65,300],2.8,1.8,156,8.1]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"arri-uwz","brand":"ARRI","name":"Ultra Wide Zoom UWZ","mount":"PL LDS","ic":34.5,"icType":"circle","icNote":"ARRI: image circle 34,5 мм","src":["arri-uwz"],"notes":["Ø 134 или 156 мм (сменное кольцо)."],"lenses":[
      [[9.5,18],2.9,0.55,134,4.8]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"arri-alura","brand":"ARRI / FUJINON","name":"Alura Zoom","mount":"PL LDS","ic":31.14,"icType":"nominal","icNote":"Super 35 — диаметр круга ARRI не публикует","src":["arri-alura-s","arri-alura-l"],"notes":["Legacy у ARRI. Есть экстендеры LDS 1,4× и 2×."],"lenses":[
      [[15.5,45],2.8,0.6,114,2.2,{"note":"LW"}],
      [[30,80],2.8,0.6,114,2.2,{"note":"LW"}],
      [[18,80],2.6,0.7,134,4.7,{"note":"Studio"}],
      [[45,250],2.6,1.2,134,7.5,{"note":"Studio"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"arri-masterzoom","brand":"ARRI / ZEISS","name":"Master Zoom","mount":"PL","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир","tags":["secondary"],"src":["rent-masterzoom","arri-rental-35"],"notes":["Официальных ТТХ в открытом доступе нет — данные проката (вторичный источник)."],"lenses":[
      [[16.5,110],2.6,0.7,165,12.6]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"zeiss-vp","brand":"ZEISS","name":"Variable Prime","mount":"PL","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир","tags":["vintage"],"src":["arri-rental-35"],"notes":["Снята с производства, ТТХ не опубликованы."],"lenses":[
      [[16,30],2.2,null,null,null,{"note":"VP1"}],
      [[29,60],2.2,null,null,null,{"note":"VP2"}],
      [[55,105],2.2,null,null,null,{"note":"VP3"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"zeiss-lwz3","brand":"ZEISS","name":"Lightweight Zoom LWZ.3","mount":"PL / EF / E / MFT / F","ic":31.1,"icType":"format","icNote":"ZEISS: Coverage ANSI Super 35, 31,1 мм","src":["zeiss-lwz3"],"notes":["Парфокальный."],"lenses":[
      [[21,100],2.9,0.8,114,2]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"zeiss-cz2","brand":"ZEISS","name":"Compact Zoom CZ.2","mount":"PL / EF / E / MFT / F","ic":43.27,"icType":"format","icNote":"ZEISS: Full-frame coverage (36 × 24 мм)","src":["zeiss-cz2"],"notes":[],"lenses":[
      [[15,30],2.9,0.55,114,2.6],
      [[28,80],2.9,0.83,95,2.5],
      [[70,200],2.9,1.52,95,2.8]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"zeiss-szr","brand":"ZEISS","name":"Supreme Zoom Radiance","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"ZEISS: Image Diagonal 46,3 мм","src":["zeiss-szr","zeiss-sp-broch"],"notes":[],"lenses":[
      [[15,30],2.9,0.55,114,2.95],
      [[28,80],2.9,0.83,114,2.76],
      [[70,200],2.9,1.5,114,3.18]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"cooke-varotal","brand":"Cooke","name":"Varotal/i FF","mount":"PL / LPL","ic":46.3,"icType":"circle","icNote":"Cooke: 46,3 мм","src":["cooke-varotal"],"notes":[],"lenses":[
      [[19,40],2.9,0.6,114,3.5],
      [[30,95],2.9,0.8,114,4],
      [[85,215],2.9,1.5,114,4]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"cooke-legacyzoom","brand":"Cooke","name":"CXX и винтажные зумы","mount":"PL","ic":30,"icType":"circle","icNote":"CXX: 30 мм (Cooke Book); у винтажных зумов — Super 35 / академический кадр, данных нет","tags":["vintage"],"src":["cooke-book","arri-rental-35"],"notes":["Кроме CXX — только фокусные и T по списку ARRI Rental."],"lenses":[
      [[15,40],2,0.45,136,3.6,{"note":"CXX"}],
      [[14,70],3.1,null,null,null,{"note":"Varotal"}],
      [[18,100],3.1,null,null,null,{"note":"Varotal"}],
      [[20,60],3.1,null,null,null,{"note":"Varopanchro"}],
      [[20,100],3.1,null,null,null,{"note":"Varotal"}],
      [[25,250],3.9,null,null,null,{"note":"Varotal"}],
      [[25,250],3.7,null,null,null,{"note":"Cinetal"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"ang-uc","brand":"Angénieux","name":"Optimo Ultra Compact","mount":"PL","ic":46.3,"icType":"circle","icNote":"Angénieux: FF/VV 46,3 мм; с задним блоком U35 — 34,6 мм","src":["ang-uc"],"notes":["Сменный задний блок (IRO): FF/VV или U35 — меняются фокусные и T.","Заменили Optimo 15-40 и 28-76."],"lenses":[
      [[21,56],2.9,0.6,114,2.6,{"note":"FF"}],
      [[16,42],2.2,0.6,114,2.6,{"note":"U35","ic":34.6}],
      [[37,102],2.9,0.6,114,2.5,{"note":"FF"}],
      [[28,76],2.2,0.6,114,2.5,{"note":"U35","ic":34.6}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"ang-12x","brand":"Angénieux","name":"Optimo Ultra 12x","mount":"PL","ic":46.3,"icType":"circle","icNote":"Angénieux: FF/VV 46,3 / U35 34,6 / S35 31,1 мм — зависит от заднего блока","src":["ang-12x"],"notes":["S35-версия 24-290 — это классический Optimo 24-290 T2.8."],"lenses":[
      [[36,435],4.2,1.27,162,12.75,{"note":"FF"}],
      [[26,320],3.1,1.24,162,12.75,{"note":"U35","ic":34.6}],
      [[24,290],2.8,1.22,162,12.6,{"note":"S35","ic":31.1}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"ang-ez","brand":"Angénieux","name":"Type EZ","mount":"PL / EF / E","ic":46.3,"icType":"circle","icNote":"Angénieux: FF 46,3 мм; с задним блоком S35 — 30,4 мм","src":["ang-ez"],"notes":["Сменный задний блок FF / S35."],"lenses":[
      [[45,135],3,0.6,114,2.1,{"note":"EZ-1 FF"}],
      [[30,90],2,0.6,114,2.1,{"note":"EZ-1 S35","ic":30.4}],
      [[22,60],3,0.6,114,2.1,{"note":"EZ-2 FF"}],
      [[15,40],2,0.6,114,2.1,{"note":"EZ-2 S35","ic":30.4}],
      [[68,250],"3.5–4.5",1.2,114,2.6,{"note":"EZ-3 FF"}],
      [[45,165],"2.3–3",1.2,114,2.6,{"note":"EZ-3 S35","ic":30.4}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"ang-legacy","brand":"Angénieux","name":"Optimo (legacy)","mount":"PL","ic":31.4,"icType":"circle","icNote":"Angénieux: S35+ 31,4 мм (Style 48-130 — до 34,6 мм)","src":["ang-legacy","arri-rental-35"],"notes":["15-40, 17-80, 45-120 — сняты с сайта Angénieux; T по списку ARRI Rental, остальное н/д."],"lenses":[
      [[28,76],2.6,0.6,114,1.92],
      [[19.5,94],2.6,0.62,136,5.6],
      [[48,130],3,0.94,114,1.95,{"note":"Style","ic":34.6}],
      [[15,40],2.6,null,null,null],
      [[17,80],2.2,null,null,null],
      [[45,120],2.8,null,null,null],
      [[25,250],3.5,null,null,null,{"note":"HR"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"fuji-premista","brand":"FUJINON","name":"Premista","mount":"PL","ic":46.3,"icType":"circle","icNote":"FUJIFILM: Maximum Image Size 46,3 мм","src":["fuji-premista"],"notes":[],"lenses":[
      [[19,45],2.9,0.6,114,3.3],
      [[28,100],2.9,0.8,114,3.8],
      [[80,250],"2.9–3.5",1.5,114,3.8]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"fuji-cabrio","brand":"FUJINON","name":"Cabrio (ZK)","mount":"PL","ic":31.5,"icType":"circle","icNote":"FUJIFILM: Compatible Image Size max 31,5 мм","src":["fuji-cat"],"notes":["Вес — без привода (с приводом +0,5 кг). 25-300 — Ø 136 мм."],"lenses":[
      [[14,35],2.9,0.6,114,2.4],
      [[19,90],2.9,0.85,114,2.3],
      [[85,300],"2.9–4",1.2,114,2.6],
      [[25,300],"3.5–3.85",1.2,136,8.4]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"fuji-xkmk","brand":"FUJINON","name":"XK / MK","mount":"PL / E","ic":28.5,"icType":"circle","icNote":"FUJIFILM: Compatible Image Size max 28,5 мм","src":["fuji-cat"],"notes":["MK — для Super 35 / APS-C с байонетом E."],"lenses":[
      [[20,120],3.5,1.1,114,2.4,{"note":"XK"}],
      [[18,55],2.9,0.85,85,0.98,{"note":"MK"}],
      [[50,135],2.9,null,null,null,{"note":"MK"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"fuji-premier","brand":"FUJINON","name":"Premier HK","mount":"PL","ic":31.14,"icType":"nominal","icNote":"Super 35 — ориентир","tags":["vintage"],"src":["arri-rental-35"],"notes":["ТТХ в каталоге FUJIFILM больше не публикуются."],"lenses":[
      [[18,85],2,null,null,null],
      [[24,180],2.6,null,null,null],
      [[75,400],"2.8–3.8",null,null,null]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"canon-flex","brand":"Canon","name":"Flex Zoom","mount":"PL / EF","ic":46.4,"icType":"circle","icNote":"Canon: Image Circle φ46,4 мм (FF) / φ31,4 мм (S35)","src":["canon-flex"],"notes":["Ø передней части — 114 мм."],"lenses":[
      [[20,50],2.4,0.6,114,3.3,{"note":"FF"}],
      [[45,135],2.4,1,114,3.4,{"note":"FF"}],
      [[14,35],1.7,0.6,114,3.4,{"note":"S35","ic":31.4}],
      [[31.5,95],1.7,1,114,3.5,{"note":"S35","ic":31.4}]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"leitz-zoom","brand":"Leitz","name":"Leitz Zoom","mount":"PL / LPL","ic":46.5,"icType":"circle","icNote":"Leitz: Image Circle 46,5 мм","src":["leitz-zoom"],"notes":["Ø передней части не опубликован."],"lenses":[
      [[25,75],2.8,0.91,null,3.7],
      [[55,125],2.8,1.05,null,4.4]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"sigma-zoom","brand":"SIGMA","name":"Cine Zoom","mount":"PL / EF / E","ic":28.4,"icType":"circle","icNote":"SIGMA: S35 Digital φ28,4 мм; FF 24-35 — φ43,3 мм","src":["sigma-zoom"],"notes":["24-35: вес версии E-mount (1,6 кг)."],"lenses":[
      [[18,35],2,0.28,95,1.4],
      [[50,100],2,0.95,95,1.9],
      [[24,35],2.2,0.28,95,1.6,{"note":"FF","ic":43.3}]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"s16-zooms","brand":"Разные","name":"Super 16 зумы","mount":"PL","ic":14.45,"icType":"nominal","icNote":"Super 16 — ориентир","tags":["vintage"],"src":["arri-rental-16"],"notes":["Список ARRI Rental; ТТХ не собраны."],"lenses":[
      [[11.5,138],2.3,null,null,null,{"note":"Angénieux"}],
      [[7,63],2.5,null,null,null,{"note":"Canon"}],
      [[6.6,66],2.7,null,null,null,{"note":"Canon"}],
      [[8,64],2.4,null,null,null,{"note":"Canon"}],
      [[11,165],2.5,null,null,null,{"note":"Canon"}],
      [[10.4,52],2.8,null,null,null,{"note":"Cooke"}],
      [[12,120],2.2,null,null,null,{"note":"ZEISS"}]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"arri-rental-65z","brand":"ARRI Rental","name":"65 мм зумы","mount":"XPL / LPL","ic":59.86,"icType":"nominal","icNote":"Для ALEXA 65 — ориентир 59,86 мм; ТТХ не публикуются","tags":["rental"],"src":["arri-rental-65"],"notes":[],"lenses":[
      [[38,210],6.3,null,null,null],
      [[50,110],"3.5–4.5",null,null,null],
      [[80,200],2.8,null,null,null],
      [[150,600],6.3,null,null,null]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"arri-auwz","brand":"ARRI","name":"Anamorphic Ultra Wide Zoom AUWZ","mount":"PL LDS","sq":2,"ic":29.26,"icType":"circle","icNote":"ARRI: Image circle 29,26 мм (Super 35 Cinemascope)","src":["arri-auwz"],"notes":["Анаморфот 2×."],"lenses":[
      [[19,36],4.2,0.6,114,5.5]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"cooke-anazoom","brand":"Cooke","name":"Anamorphic/i Zoom","mount":"PL","sq":2,"ic":31.1,"icType":"nominal","icNote":"Super 35 — ориентир (как Anamorphic/i S35)","src":["cooke-book"],"notes":["Анаморфот 2×. Данные — Cooke Book 2016."],"lenses":[
      [[35,140],3.1,1.2,136,10.3]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"ang-a2s","brand":"Angénieux","name":"Optimo Anamorphic","mount":"PL","sq":2,"ic":28.8,"icType":"circle","icNote":"Angénieux: 4 perf. scope+ 28,8 мм","src":["ang-legacy","arri-rental-ana"],"notes":["Анаморфот 2×. 56-152 A2S — данные Angénieux; остальные — по списку ARRI Rental."],"lenses":[
      [[56,152],4,0.63,114,2.2,{"note":"A2S"}],
      [[30,72],4,null,null,null],
      [[44,440],4.5,null,null,null],
      [[48,580],4.5,null,null,null],
      [[50,500],5.6,null,null,null]
    ]},
    {"sec":"zoom","zoom":true,"mod":"sensor","id":"hawk-czoom","brand":"Vantage / Hawk","name":"Hawk C-Series Zoom","mount":"PL","sq":2,"ic":31.5,"icType":"circle","icNote":"Vantage: Image Circle 31,5 мм","src":["hawk-c"],"notes":["Анаморфот 2×."],"lenses":[
      [[55,165],4,0.9,110,2.2]
    ]},
    {"sec":"zoom","zoom":true,"mod":null,"id":"ffa-scorpio","brand":"Разные","name":"Винтажные анаморфотные зумы (FF/S35)","mount":"PL","sq":2,"ic":28.8,"icType":"nominal","icNote":"Ориентир 4-perf Scope; данных нет","tags":["vintage"],"src":["arri-rental-ana"],"notes":["Список ARRI Rental."],"lenses":[
      [[138,405],4.3,null,null,null,{"note":"FFA Scorpio FF","ic":43.27}],
      [[28,140],4.5,null,null,null,{"note":"Cooke"}],
      [[36,200],4.5,null,null,null,{"note":"Cooke"}],
      [[40,200],4.5,null,null,null,{"note":"Cooke"}],
      [[76,300],5.9,null,null,null,{"note":"Ultrascope"}]
    ]}
  ];

  const SECTIONS = [{"id":"s16","label":"S16","title":"Super 16"},{"id":"s35","label":"S35","title":"Super 35"},{"id":"ff","label":"FF","title":"Full Frame / LF / VV"},{"id":"l65","label":"65","title":"65 мм (ALEXA 65)"},{"id":"ana","label":"ANAM","title":"Анаморфот"},{"id":"zoom","label":"ZOOM","title":"Зумы"}];

  window.LC_LENSES = { SOURCES, SERIES, SECTIONS, UPDATED: "2026-11-24" };
})();
