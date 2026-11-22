/*
 * Lazy Camera — справочник по камерам. Данные можно править здесь.
 *
 * Все значения — из официальных источников производителей (ссылки в SOURCES,
 * у каждой камеры поле src). Если число производитель не публикует, стоит null
 * и в интерфейсе показывается «н/д». Поле calc:true у размеров в мм означает,
 * что мм посчитаны из пикселей и шага пикселя производителя (а не взяты из таблицы).
 *
 * Модель:
 *   camera = { id, brand, name, sensor, size, pitch, src:[ключи SOURCES], notes:[], modes:[...] }
 *   mode   = { name, px:[w,h], mm:[w,h], calc, sph (false — только анаморфот),
 *              ana (true — производитель обозначает режим как анаморфотный),
 *              dsq:[...] — коэффициенты де-сквиза, которые камера поддерживает в этом режиме (если известны),
 *              lic — нужная лицензия, note, generic (true — карточка кодека без привязки к режиму сенсора),
 *              rec:[ { f: семейство кодека, c: кодек, r: разрешение файла, fps: максимум, lo: ниже на другом носителе, note } ] }
 */
(function () {
  "use strict";

  const SOURCES = {
    "arri-a35": { t: "ARRI — ALEXA 35, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/legacy-cine-cameras/alexa-35" },
    "arri-a35-poster": { t: "ARRI — ALEXA 35 Recording Formats (PDF, SUP 1.1)", u: "https://www.arri.com/resource/blob/296424/812bdde50a7339a6748441a2983a90c9/alexa-35-recording-format-poster-data.pdf" },
    "arri-a35x": { t: "ARRI — ALEXA 35 Xtreme, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/alexa-35-xtreme" },
    "arri-mini": { t: "ARRI — ALEXA Mini, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/legacy-cine-cameras/alexa-mini" },
    "arri-minilf": { t: "ARRI — ALEXA Mini LF, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/alexa-mini-lf" },
    "arri-minilf-sheet": { t: "ARRI — ALEXA Mini LF Recording Formats (PDF, SUP 7.1)", u: "https://www.arri.com/resource/blob/261408/46205a6cdd14c7667b1bc9fc6e3a91a9/alexa-mini-lf-recording-format-sheet-din-a4-data.pdf" },
    "arri-lf": { t: "ARRI — ALEXA LF, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/alexa-lf" },
    "arri-sxtw": { t: "ARRI — ALEXA SXT W, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/legacy-cine-cameras/alexa-sxt-w" },
    "arri-265": { t: "ARRI — ALEXA 265, Technical Data", u: "https://www.arri.com/en/cine-systems/cine-cameras/alexa-265" },
    "arri-alexa-pg": { t: "ARRI — ALEXA Classic / XT Pocket Guide (PDF, SUP 11)", u: "https://www.arri.com/resource/blob/76284/703c25ee4e321db2cf47bd6f35a98dd6/alexa-xt-sup-11-0-pocket-guide-data.pdf" },
    "arri-alexa-areas": { t: "ARRI — ALEXA Classic/XT Recording Areas (PDF, SUP 11)", u: "https://www.arri.com/resource/blob/178012/d6a32bdbaee788486bce45ec1de9e4f1/alexa-classic-and-xt-recording-areas-surround-views-framelines-sup-11-data.pdf" },
    "arri-xt-rn": { t: "ARRI — ALEXA XT SUP 11.0.1 Release Notes (PDF)", u: "https://www.arri.com/resource/blob/76404/a4bae68236d1be0e6cc39dc12f5d126e/alexa-xt-sup-11-0-1-release-notes-data.pdf" },
    "red-vr-fps": { t: "RED — V-RAPTOR 8K VV Operation Guide: Recording Frame Rate", u: "https://docs.red.com/955-0199/955-0199_V1.3_Rev-B_RED_PS_V-RAPTOR_8K_VV_Operation_Guide/Content/4_Menus/b_ProjSet/RecFrameRate.htm" },
    "red-vr-fmt": { t: "RED — V-RAPTOR 8K VV Operation Guide: All Formats", u: "https://docs.red.com/955-0199/955-0199_V1.3_Rev-B_RED_PS_V-RAPTOR_8K_VV_Operation_Guide/Content/4_Menus/b_ProjSet/Format/All_Formats.htm" },
    "red-vr-spec": { t: "RED — V-RAPTOR Technical Specifications", u: "https://docs.red.com/955-0199/955-0199_V1.2_Rev_A_RED_PS_V-RAPTOR_Operation_Guide/Content/C_TechSpecs/Specs_V-RAPTOR.htm" },
    "red-prores": { t: "RED — V-RAPTOR [X] Operation Guide: File Format (ProRes)", u: "https://docs.red.com/955-0225/955-0225_V1.7%20Rev-B%20RED%20PS,%20V-RAPTOR%20%5BX%5D%208K%20VV%20Operation%20Guide%20HTML/Content/4_Menus/b_ProjSet/FileFormat.htm" },
    "red-xl-spec": { t: "RED — V-RAPTOR XL 8K VV Technical Specifications", u: "https://docs.red.com/955-0203/955-0203_V1.7%20Rev-B%20RED%20PS,%20V-RAPTOR%20XL%208K%20VV%20Operation%20Guide%20HTML/Content/B_TechSpecs/Specs_V-RAPTOR_XL.htm" },
    "red-xl-fps": { t: "RED — V-RAPTOR XL Operation Guide: Recording Frame Rate", u: "https://docs.red.com/955-0203/955-0203_V1.3+Rev-B+RED+PS,+V-RAPTOR+XL+8K+VV+Operation+Guide+HTML/Content/4_Menus/b_ProjSet/RecFrameRate.htm" },
    "red-komodo": { t: "RED — KOMODO 6K Technical Specifications", u: "https://docs.red.com/955-0196/955-0196_V1.7%20Rev-B%20RED%20PS,%20KOMODO%20Operation%20Guide%20HTML/Content/A_TechSpecs/Specs_KOMODO_6K.htm" },
    "red-komodox": { t: "RED — KOMODO-X Technical Specifications", u: "https://docs.red.com/955-0219/955-0219_V2.0%20Rev-B%20RED%20PS,%20KOMODO-X%20Operation%20Guide%20HTML/Content/C_TechSpecs/Specs_KOMODO-X.htm" },
    "red-komodox-fps": { t: "RED — KOMODO-X Operation Guide: Recording Frame Rate", u: "https://docs.red.com/955-0219/955-0219_V2.0%20Rev-B%20RED%20PS,%20KOMODO-X%20Operation%20Guide%20HTML/Content/4_Menus/02_ProjSet/RecFrameRate.htm" },
    "red-gemini": { t: "RED — DSMC2 GEMINI 5K S35 Technical Specifications", u: "https://docs.red.com/955-0159_v7.4/EPIC-W_GEMINI_7_4/en-us/Content/A_TechSpecs/Specs_GEMINI.htm" },
    "red-epicw": { t: "RED — EPIC-W 8K S35 (HELIUM) Technical Specifications", u: "https://docs.red.com/955-0138_v7.4/EPIC-W_HELIUM_7_4/en-us/Content/A_TechSpecs/Specs_EPIC-W_8KS35.htm" },
    "red-dragon": { t: "RED — EPIC DRAGON Technical Specifications", u: "https://docs.red.com/955-0156/EPICSCARLETOperationGuide/en-us/Content/A_TechSpecs/Specs_EPIC_DRAGON.htm" },
    "sony-venice2": { t: "Sony — VENICE 2 (8K/6K sensor modes)", u: "https://pro.sony/en_NA/products/digital-cinema-cameras/venice2" },
    "sony-venice2-poster": { t: "Sony — VENICE 2 8K Format Poster (PDF)", u: "https://pro.sony/s3/2023/03/23104553/VENICE2-8K-Format-Poster_final.pdf" },
    "sony-venice": { t: "Sony — VENICE MPC-3610 Operating Instructions, FW 6.3 (PDF)", u: "https://www.sony.com/electronics/support/res/manuals/4735/d4d06ba1e126398ae780667a4317c8c9/47351091M.pdf" },
    "sony-burano": { t: "Sony — BURANO sensor modes (X-OCN LT / XAVC)", u: "https://pro.sony/en_NA/products/digital-cinema-cameras/burano" },
    "sony-fx3": { t: "Sony — ILME-FX3 Specifications", u: "https://www.sony.com/electronics/support/e-mount-body-ilme-fx-series/ilme-fx3/specifications" },
    "sony-fx6": { t: "Sony — ILME-FX6V Specifications", u: "https://www.sony.com/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx6v/specifications" },
    "sony-fx9": { t: "Sony Cine — FX9 Firmware V2: Scan Modes", u: "https://sony-cinematography.com/articles/fx9-firmware-version-2-scan-modes-deep-dive/" },
    "sony-fx9-fw": { t: "Sony — PXW-FX9 Firmware Roadmap", u: "https://pro.sony/ue_US/products/professional-cameras/fx9-firmware-roadmap" },
    "bmd-ursacine": { t: "Blackmagic Design — URSA Cine 12K LF Tech Specs", u: "https://www.blackmagicdesign.com/products/blackmagicursacine/techspecs" }
  };

  // ProRes-варианты, которые указывает производитель
  const PR_ARRI_35 = "ProRes 4444 XQ / 4444 / 422 HQ";
  const PR_ARRI_MINI = "ProRes 4444 XQ / 4444 / 422 HQ / 422 / 422 LT";
  const PR_ARRI_LF = "ProRes 4444 XQ / 4444 / 422 HQ / 422";
  const PR_ARRI_MLF = "ProRes 4444 XQ / 4444 / 422 HQ";
  const R3D_DSMC3 = "REDCODE RAW (R3D) HQ / MQ / LQ / ELQ";

  // RED: мм из пикселей и шага пикселя производителя
  function redMode(name, w, h, fps, pitchUm, extra) {
    const m = {
      name,
      px: [w, h],
      mm: [round2(w * pitchUm / 1000), round2(h * pitchUm / 1000)],
      calc: true,
      rec: [{ f: "R3D", c: "REDCODE RAW (R3D)", r: w + " × " + h, fps }]
    };
    return Object.assign(m, extra || {});
  }
  function round2(x) { return Math.round(x * 100) / 100; }

  // V-RAPTOR 8K VV / XL: таблица форматов RED (пиксели + мм) и максимум fps при Project Time Base 24
  function vraptorModes(R3Dlabel) {
    const T = [
      // name, w, h, mmW, mmH, fps, dsq
      ["8K 17:9", 8192, 4320, 40.96, 21.6, 120, [1.3, 1.25]],
      ["8K 2:1", 8192, 4096, 40.96, 20.48, 126],
      ["8K 2.4:1", 8192, 3456, 40.96, 17.28, 150],
      ["8K 16:9", 7680, 4320, 38.4, 21.6, 120, [1.5, 1.3]],
      ["8K 1:1", 4320, 4320, 21.6, 21.6, 120, [2]],
      ["7K 17:9", 7168, 3780, 35.84, 18.9, 140],
      ["7K 2:1", 7168, 3584, 35.84, 17.92, 144],
      ["7K 2.4:1", 7168, 3002, 35.84, 15.01, 175],
      ["7K 16:9", 6720, 3780, 33.6, 18.9, 137],
      ["7K 1:1", 3780, 3780, 18.9, 18.9, 137, [2]],
      ["6K 17:9", 6144, 3240, 30.72, 16.2, 160, [1.3, 1.25]],
      ["6K 2:1", 6144, 3072, 30.72, 15.36, 168],
      ["6K 2.4:1", 6144, 2592, 30.72, 12.87, 200],
      ["6K 16:9", 5760, 3240, 28.8, 16.2, 160, [1.5, 1.3]],
      ["6K 1:1", 3240, 3240, 16.2, 16.2, 160],
      ["5K 17:9", 5120, 2700, 25.6, 13.5, 192],
      ["5K 2:1", 5120, 2560, 25.6, 12.8, 202],
      ["5K 2.4:1", 5120, 2160, 25.6, 10.8, 240],
      ["5K 16:9", 4800, 2700, 24.0, 13.5, 192],
      ["4K 17:9", 4096, 2160, 20.48, 10.8, 240],
      ["4K 2:1", 4096, 2048, 20.48, 10.24, 253],
      ["4K 2.4:1", 4096, 1728, 20.48, 8.64, 300],
      ["4K 16:9", 3840, 2160, 19.2, 10.8, 240],
      ["3K 17:9", 3072, 1620, 15.36, 8.1, 320],
      ["3K 2.4:1", 3072, 1296, 15.36, 6.48, 400],
      ["2K 17:9", 2048, 1080, 10.24, 5.4, 480],
      ["2K 2.4:1", 2048, 864, 10.24, 4.32, 600]
    ];
    const modes = T.map(([name, w, h, mw, mh, fps, dsq]) => {
      const m = { name, px: [w, h], mm: [mw, mh], rec: [{ f: "R3D", c: R3Dlabel, r: w + " × " + h, fps }] };
      if (dsq) m.dsq = dsq;
      return m;
    });
    // Анаморфотные форматы RED (кадр из таблицы All Formats). Отдельный максимум fps RED не публикует.
    const A = [
      ["8K 4:3 · 2× / 1,8×", 5760, 4320, 28.8, 21.6, [2, 1.8]],
      ["8K 6:5 · 2×", 5184, 4320, 25.92, 21.6, [2]],
      ["8K 3:2 · 1,8× / 1,6×", 6480, 4320, 32.4, 21.6, [1.8, 1.6]],
      ["7K 4:3 · 2× / 1,8×", 5040, 3780, 25.2, 18.9, [2, 1.8]],
      ["7K 6:5 · 2×", 4536, 3780, 22.68, 18.9, [2]],
      ["7K 3:2 · 1,8× / 1,6×", 5670, 3780, 28.35, 18.9, [1.8, 1.6]]
    ];
    A.forEach(([name, w, h, mw, mh, dsq]) => {
      modes.push({
        name, px: [w, h], mm: [mw, mh], sph: false, ana: true, dsq,
        rec: [{ f: "R3D", c: R3Dlabel, r: w + " × " + h, fps: null, note: "RED не публикует отдельный максимум fps для анаморфотных форматов" }]
      });
    });
    return modes;
  }

  const CAMERAS = [
    // ───────────── ARRI ─────────────
    {
      id: "alexa-classic", brand: "ARRI", name: "ALEXA Classic",
      sensor: "Super 35 ALEV III", size: "16:9 — 23,76 × 13,37 мм", pitch: 8.25,
      src: ["arri-alexa-pg", "arri-alexa-areas"],
      notes: [
        "Запись ProRes / DNxHD на SxS PRO. ARRIRAW — только на внешний рекордер (T-Link).",
        "HD выше 60 fps — режим High Speed (лицензия), до 120 fps.",
        "ProRes 4444 XQ и 3.2K — только с апгрейдом XR Module.",
        "Сенсор 4:3 — только ALEXA Plus 4:3, ALEXA M и ALEXA Studio."
      ],
      modes: [
        { name: "16:9", px: [2880, 1620], mm: [23.76, 13.37], rec: [
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444, DNxHD", r: "HD 1920 × 1080", fps: 120, note: "60–120 fps — High Speed" },
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444", r: "2K 2048 × 1152", fps: 60, note: "на SxS PRO 32 ГБ — до 30" },
          { f: "ARRIRAW", c: "ARRIRAW (внешний рекордер)", r: "2880 × 1620", fps: 60 }
        ] },
        { name: "16:9 ProRes 3.2K (XR Module)", px: [3164, 1778], mm: [26.1, 14.67], calc: true, lic: "XR Module", rec: [
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444", r: "3164 × 1778", fps: 30 }
        ] },
        { name: "4:3 (Plus 4:3 / M / Studio)", px: [2880, 2160], mm: [23.76, 17.82], rec: [
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444", r: "2K 4:3 2048 × 1536", fps: 48 },
          { f: "ARRIRAW", c: "ARRIRAW (внешний рекордер)", r: "2880 × 2160", fps: 48 }
        ] }
      ]
    },
    {
      id: "alexa-xt", brand: "ARRI", name: "ALEXA XT",
      sensor: "Super 35 ALEV III", size: "Open Gate — 28,17 × 18,13 мм", pitch: 8.25,
      src: ["arri-alexa-pg", "arri-xt-rn", "arri-alexa-areas"],
      notes: [
        "Значения — для записи на XR Capture Drive (SUP 11). На SxS / CFast максимумы ниже.",
        "HD выше 60 fps — режим High Speed. ProRes 4444 XQ в HD — до 75 fps.",
        "4:3 Cropped и Open Gate — только ARRIRAW."
      ],
      modes: [
        { name: "16:9", px: [2880, 1620], mm: [23.76, 13.37], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2880 × 1620", fps: 120 },
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444, DNxHD", r: "HD 1920 × 1080", fps: 120, note: "60–120 fps — High Speed; 4444 XQ — до 75" },
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444 / 4444 XQ", r: "2K 2048 × 1152", fps: 60 }
        ] },
        { name: "16:9 ProRes 3.2K", px: [3164, 1778], mm: [26.1, 14.67], calc: true, rec: [
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444 / 4444 XQ", r: "3164 × 1778", fps: 30 }
        ] },
        { name: "4:3 Full", px: [2880, 2160], mm: [23.76, 17.82], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2880 × 2160", fps: 90 },
          { f: "ProRes", c: "ProRes 422 / 422 HQ / 4444 / 4444 XQ", r: "2K 4:3 2048 × 1536", fps: 48 }
        ] },
        { name: "4:3 Cropped", px: [2578, 2160], mm: [21.27, 17.82], calc: true, ana: true, note: "ARRI: режим для анаморфотной оптики 2×", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2578 × 2160", fps: 96 }
        ] },
        { name: "Open Gate 3.4K", px: [3414, 2198], mm: [28.17, 18.13], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3414 × 2198", fps: 75 }
        ] }
      ]
    },
    {
      id: "alexa-sxt", brand: "ARRI", name: "ALEXA SXT W",
      sensor: "Super 35 ALEV III", size: "28,25 × 18,17 мм", pitch: 8.25,
      src: ["arri-sxtw"],
      notes: [
        "Данные со страницы ARRI ALEXA SXT W. Для SXT Plus / SXT Studio сверяйтесь с ARRI Formats & Data Rate Calculator.",
        "Носители: SXR / XR Capture Drive, SxS PRO+, CFast 2.0 — максимум зависит от носителя."
      ],
      modes: [
        { name: "16:9 HD / 2K / ARRIRAW 2.8K", px: [2880, 1620], mm: [23.76, 13.37], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2880 × 1620", fps: 120 },
          { f: "ProRes", c: PR_ARRI_LF, r: "HD 1920 × 1080", fps: 120 },
          { f: "ProRes", c: PR_ARRI_LF, r: "2K 2048 × 1152", fps: 120 }
        ] },
        { name: "16:9 3.2K / 4K UHD", px: [3200, 1800], mm: [26.4, 14.85], rec: [
          { f: "ProRes", c: PR_ARRI_LF, r: "3.2K 3200 × 1800", fps: 72 },
          { f: "ProRes", c: PR_ARRI_LF, r: "4K UHD 3840 × 2160", fps: 50 }
        ] },
        { name: "16:9 ARRIRAW 3.2K", px: [3168, 1782], mm: [26.14, 14.7], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3168 × 1782", fps: 120 }
        ] },
        { name: "6:5 ProRes Anamorphic", px: [2560, 2146], mm: [21.12, 17.7], ana: true, sph: false, dsq: [2], rec: [
          { f: "ProRes", c: PR_ARRI_LF, r: "2K Ana 2048 × 858 (де-сквиз 2×)", fps: 96 },
          { f: "ProRes", c: PR_ARRI_LF, r: "4K Cine Ana 4096 × 1716 (де-сквиз 2×)", fps: 60 }
        ] },
        { name: "6:5 ARRIRAW 2.6K", px: [2578, 2160], mm: [21.38, 17.82], ana: true, rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2578 × 2160", fps: 96 }
        ] },
        { name: "4:3 2.8K", px: [2880, 2160], mm: [23.76, 17.82], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2880 × 2160", fps: 96 },
          { f: "ProRes", c: PR_ARRI_LF, r: "2.8K 2880 × 2160", fps: 60 }
        ] },
        { name: "Open Gate 3.4K", px: [3424, 2202], mm: [28.25, 18.17], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3424 × 2202", fps: 90 },
          { f: "ProRes", c: PR_ARRI_LF, r: "3.4K 3424 × 2202", fps: 60 }
        ] },
        { name: "Open Gate 4K Cine", px: [3414, 2198], mm: [28.17, 18.13], rec: [
          { f: "ProRes", c: PR_ARRI_LF, r: "4K Cine 4096 × 2636", fps: 48 }
        ] }
      ]
    },
    {
      id: "alexa-mini", brand: "ARRI", name: "ALEXA Mini",
      sensor: "Super 35 ALEV III", size: "28,25 × 18,17 мм", pitch: 8.25,
      src: ["arri-mini"],
      notes: [
        "Запись на CFast 2.0. ProRes: " + PR_ARRI_MINI + ".",
        "ARRIRAW 4:3 и анаморфотные режимы записываются файлом Open Gate 3.4K (3424 × 2202) — ARRI не указывает для них отдельный максимум fps."
      ],
      modes: [
        { name: "Open Gate 3.4K", px: [3424, 2202], mm: [28.25, 18.17], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3424 × 2202", fps: 30 }
        ] },
        { name: "16:9 2.8K / HD", px: [2880, 1620], mm: [23.76, 13.37], rec: [
          { f: "ARRIRAW", c: "ARRIRAW 16:9 2.8K", r: "2880 × 1620", fps: 48 },
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080", fps: 200 }
        ] },
        { name: "2K", px: [2868, 1612], mm: [23.66, 13.3], rec: [
          { f: "ProRes", c: "ProRes", r: "2K 2048 × 1152", fps: 200 }
        ] },
        { name: "3.2K / 4K UHD", px: [3200, 1800], mm: [26.4, 14.85], rec: [
          { f: "ProRes", c: "ProRes", r: "3.2K 3200 × 1800", fps: 60 },
          { f: "ProRes", c: "ProRes", r: "4K UHD 3840 × 2160", fps: 60 }
        ] },
        { name: "4:3 2.8K", px: [2880, 2160], mm: [23.76, 17.82], rec: [
          { f: "ProRes", c: "ProRes", r: "2880 × 2160 (контейнер 2944 × 2160)", fps: 50 },
          { f: "ARRIRAW", c: "ARRIRAW (файл OG 3.4K)", r: "3424 × 2202", fps: null }
        ] },
        { name: "2.39:1 2K Ana.", px: [2560, 2145], mm: [21.12, 17.7], ana: true, sph: false, dsq: [2], rec: [
          { f: "ProRes", c: "ProRes", r: "2048 × 858 (де-сквиз 2×)", fps: 120 },
          { f: "ARRIRAW", c: "ARRIRAW (файл OG 3.4K)", r: "3424 × 2202", fps: null }
        ] },
        { name: "HD Ana.", px: [1920, 2160], mm: [15.84, 17.82], ana: true, sph: false, dsq: [2], rec: [
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080 (де-сквиз 2×)", fps: 120 },
          { f: "ARRIRAW", c: "ARRIRAW (файл OG 3.4K)", r: "3424 × 2202", fps: null }
        ] },
        { name: "S16 HD", px: [1600, 900], mm: [13.2, 7.43], rec: [
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080", fps: 200 }
        ] }
      ]
    },
    {
      id: "alexa-35", brand: "ARRI", name: "ALEXA 35",
      sensor: "Super 35 ALEV 4", size: "27,99 × 19,22 мм", pitch: 6.075,
      src: ["arri-a35", "arri-a35-poster"],
      notes: [
        "Значения fps — для Codex Compact Drive 2TB; в скобках — 1TB.",
        "ProRes: " + PR_ARRI_35 + " — одинаковый максимум; в отдельных форматах 4444 XQ на 1TB чуть ниже (см. ARRI Formats & Data Rate Calculator).",
        "Open Gate / 4.6K 16:9 / 3.3K 6:5 / 3K 1:1 / 2.7K 8:9 — лицензия Open Gate/Anamorphic; выше 60 fps — лицензия High Speed; ARRIRAW — лицензия ARRIRAW (на Base-версии)."
      ],
      modes: [
        { name: "4.6K 3:2 Open Gate", px: [4608, 3164], mm: [28.0, 19.2], lic: "Open Gate/Anamorphic", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4.6K 4608 × 3164", fps: 75, lo: 35 },
          { f: "ProRes", c: PR_ARRI_35, r: "4.6K 4608 × 3164", fps: 60 }
        ] },
        { name: "4.6K 16:9", px: [4608, 2592], mm: [28.0, 15.7], lic: "Open Gate/Anamorphic", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4.6K 4608 × 2592", fps: 75, lo: 45 },
          { f: "ProRes", c: PR_ARRI_35, r: "4K 4096 × 2304", fps: 75 }
        ] },
        { name: "4K 16:9", px: [4096, 2304], mm: [24.9, 14.0], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4K 4096 × 2304", fps: 120, lo: 55 },
          { f: "ProRes", c: PR_ARRI_35, r: "4K 4096 × 2304", fps: 100 },
          { f: "ProRes", c: PR_ARRI_35, r: "UHD 3840 × 2160", fps: 120 },
          { f: "ProRes", c: PR_ARRI_35, r: "2K 2048 × 1152", fps: 120 },
          { f: "ProRes", c: PR_ARRI_35, r: "HD 1920 × 1080", fps: 120 }
        ] },
        { name: "4K 2:1", px: [4096, 2048], mm: [24.9, 12.4], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4K 4096 × 2048", fps: 120, lo: 65 },
          { f: "ProRes", c: PR_ARRI_35, r: "4K 4096 × 2048", fps: 120 }
        ] },
        { name: "3.8K 16:9", px: [3840, 2160], mm: [23.3, 13.1], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "UHD 3840 × 2160", fps: 120, lo: 65 },
          { f: "ProRes", c: PR_ARRI_35, r: "UHD 3840 × 2160", fps: 120 }
        ] },
        { name: "3.3K 6:5", px: [3328, 2790], mm: [20.22, 16.95], ana: true, lic: "Open Gate/Anamorphic", note: "ARRI: для анаморфота 2× под 2,39:1", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3.3K 3328 × 2790", fps: 100, lo: 55 },
          { f: "ProRes", c: PR_ARRI_35, r: "3.3K 3328 × 2790", fps: 75 },
          { f: "ProRes", c: PR_ARRI_35, r: "3.8K 2.39:1 Ana 2× 3840 × 1608 (де-сквиз)", fps: 90 }
        ] },
        { name: "3K 1:1", px: [3072, 3072], mm: [18.7, 18.7], ana: true, lic: "Open Gate/Anamorphic", note: "ARRI: для анаморфота 2× под 2:1", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3K 3072 × 3072", fps: 100, lo: 55 },
          { f: "ProRes", c: PR_ARRI_35, r: "3K 3072 × 3072", fps: 90 },
          { f: "ProRes", c: PR_ARRI_35, r: "3.8K 2:1 Ana 2× 3840 × 1920 (де-сквиз)", fps: 100 }
        ] },
        { name: "2.7K 8:9", px: [2743, 3086], mm: [16.7, 18.7], ana: true, sph: false, lic: "Open Gate/Anamorphic", note: "ARRI: для анаморфота 2× под 16:9", rec: [
          { f: "ProRes", c: PR_ARRI_35, r: "UHD 16:9 Ana 2× 3840 × 2160 (де-сквиз)", fps: 100 }
        ] },
        { name: "2K 16:9 S16", px: [2048, 1152], mm: [12.4, 7.0], rec: [
          { f: "ProRes", c: PR_ARRI_35, r: "2K 2048 × 1152", fps: 120 }
        ] }
      ]
    },
    {
      id: "alexa-35-xtreme", brand: "ARRI", name: "ALEXA 35 Xtreme",
      sensor: "Super 35 ALEV 4", size: "27,99 × 19,22 мм", pitch: 6.075,
      src: ["arri-a35x"],
      notes: [
        "Значения fps — для Codex Compact Drive 2TB; в скобках — 1TB.",
        "ARRICORE: максимум указан с Sensor Overdrive (без него ниже — см. строку).",
        "ProRes: ARRI указывает максимумы для ProRes 4444; кодеки: " + PR_ARRI_35 + "."
      ],
      modes: [
        { name: "4.6K 3:2 Open Gate", px: [4608, 3164], mm: [28.0, 19.2], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4608 × 3164", fps: 80, lo: 35 },
          { f: "ARRICORE", c: "ARRICORE", r: "4608 × 3164", fps: 165, note: "165 — Sensor Overdrive; без него 120 (1TB: 80)" },
          { f: "ProRes", c: "ProRes 4444", r: "4608 × 3164", fps: 120, lo: 90 }
        ] },
        { name: "4.6K 16:9", px: [4608, 2592], mm: [28.0, 15.7], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4608 × 2592", fps: 95, lo: 45 },
          { f: "ARRICORE", c: "ARRICORE", r: "4608 × 2592", fps: 200, note: "200 — Sensor Overdrive; без него 150 (1TB: 100)" },
          { f: "ProRes", c: "ProRes 4444", r: "4608 × 2592", fps: 150, lo: 110 }
        ] },
        { name: "4K 16:9", px: [4096, 2304], mm: [24.9, 14.0], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4096 × 2304", fps: 125, lo: 55 },
          { f: "ARRICORE", c: "ARRICORE", r: "4096 × 2304", fps: 210, note: "210 — Sensor Overdrive; без него 150 (1TB: 125)" },
          { f: "ProRes", c: "ProRes 4444", r: "4K 4096 × 2304", fps: 150, lo: 135 },
          { f: "ProRes", c: "ProRes 4444", r: "UHD 3840 × 2160", fps: 150 },
          { f: "ProRes", c: "ProRes 4444", r: "2K 2048 × 1152", fps: 150 },
          { f: "ProRes", c: "ProRes 4444", r: "HD 1920 × 1080", fps: 150 }
        ] },
        { name: "3.8K 16:9", px: [3840, 2160], mm: [23.3, 13.1], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3840 × 2160", fps: 140, lo: 65 },
          { f: "ARRICORE", c: "ARRICORE", r: "3840 × 2160", fps: 240, note: "240 — Sensor Overdrive; без него 150 (1TB: 145)" },
          { f: "ProRes", c: "ProRes 4444", r: "3840 × 2160", fps: 150 }
        ] },
        { name: "3.8K 2.39:1", px: [3840, 1608], mm: [23.3, 9.8], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3840 × 1608", fps: 190, lo: 85 },
          { f: "ARRICORE", c: "ARRICORE", r: "3840 × 1608", fps: 240, lo: 195 },
          { f: "ProRes", c: "ProRes 4444", r: "3840 × 1608", fps: 240, lo: 210 }
        ] },
        { name: "3.3K 6:5", px: [3328, 2790], mm: [20.22, 16.95], ana: true, note: "Для анаморфота 2× под 2,39:1", rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3328 × 2790", fps: 120, lo: 55 },
          { f: "ARRICORE", c: "ARRICORE", r: "3328 × 2790", fps: 210, note: "210 — Sensor Overdrive; без него 120" },
          { f: "ProRes", c: "ProRes 4444", r: "3.3K 3328 × 2790", fps: 120 },
          { f: "ProRes", c: "ProRes 4444", r: "3.8K 2.39:1 Ana 2× 3840 × 1608 (де-сквиз)", fps: 120 }
        ] },
        { name: "2K 16:9 S16", px: [2048, 1152], mm: [12.4, 7.0], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2048 × 1152", fps: 330, lo: 230 },
          { f: "ARRICORE", c: "ARRICORE", r: "2048 × 1152", fps: 660, note: "660 — Sensor Overdrive; без него 330" },
          { f: "ProRes", c: "ProRes 4444", r: "2048 × 1152", fps: 330 }
        ] },
        { name: "HD 16:9 S16", px: [1920, 1080], mm: [11.7, 6.6], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "1920 × 1080", fps: 330, lo: 260 },
          { f: "ARRICORE", c: "ARRICORE", r: "1920 × 1080", fps: 660, note: "660 — Sensor Overdrive; без него 330" },
          { f: "ProRes", c: "ProRes 4444", r: "1920 × 1080", fps: 330 }
        ] }
      ]
    },
    {
      id: "alexa-lf", brand: "ARRI", name: "ALEXA LF",
      sensor: "Large Format ALEV III (A2X)", size: "36,70 × 25,54 мм", pitch: 8.25,
      src: ["arri-lf"],
      notes: ["Запись на SXR Capture Drive / SxS PRO+. ProRes: " + PR_ARRI_LF + "."],
      modes: [
        { name: "LF Open Gate", px: [4448, 3096], mm: [36.7, 25.54], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4.5K 4448 × 3096", fps: 90 },
          { f: "ProRes", c: PR_ARRI_LF, r: "4.5K 4448 × 3096 (контейнер 4480 × 3096)", fps: 60 }
        ] },
        { name: "LF 16:9", px: [3840, 2160], mm: [31.68, 17.82], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "UHD 3840 × 2160", fps: 90 },
          { f: "ProRes", c: PR_ARRI_LF, r: "UHD 3840 × 2160", fps: 60 },
          { f: "ProRes", c: PR_ARRI_LF, r: "2K 2048 × 1152", fps: 60 },
          { f: "ProRes", c: PR_ARRI_LF, r: "HD 1920 × 1080", fps: 60 }
        ] },
        { name: "LF 2.39:1", px: [4448, 1856], mm: [36.7, 15.31], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4.5K 4448 × 1856", fps: 150 },
          { f: "ProRes", c: PR_ARRI_LF, r: "4.5K 4448 × 1856 (контейнер 4480 × 1856)", fps: 100 }
        ] }
      ]
    },
    {
      id: "alexa-mini-lf", brand: "ARRI", name: "ALEXA Mini LF",
      sensor: "Large Format ALEV III (A2X)", size: "36,70 × 25,54 мм", pitch: 8.25,
      src: ["arri-minilf", "arri-minilf-sheet"],
      notes: [
        "Запись на Codex Compact Drive. ProRes: " + PR_ARRI_MLF + ".",
        "Максимумы — по листу форматов ARRI (SUP 7.1); для 4444 XQ в отдельных режимах может быть ниже — см. ARRI Formats & Data Rate Calculator."
      ],
      modes: [
        { name: "4.5K LF 3:2 Open Gate", px: [4448, 3096], mm: [36.7, 25.54], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4448 × 3096", fps: 40 },
          { f: "ProRes", c: "ProRes", r: "4448 × 3096 (контейнер 4480 × 3096)", fps: 40 }
        ] },
        { name: "4.5K LF 2.39:1", px: [4448, 1856], mm: [36.7, 15.31], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4448 × 1856", fps: 60 },
          { f: "ProRes", c: "ProRes", r: "4448 × 1856 (контейнер 4480 × 1856)", fps: 60 }
        ] },
        { name: "4.3K LF 16:9", px: [4320, 2430], mm: [35.64, 20.05], rec: [
          { f: "ProRes", c: "ProRes", r: "UHD 3840 × 2160", fps: 48 },
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080", fps: 75 }
        ] },
        { name: "3.8K LF 16:9", px: [3840, 2160], mm: [31.68, 17.82], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "UHD 3840 × 2160", fps: 60 },
          { f: "ProRes", c: "ProRes", r: "UHD 3840 × 2160", fps: 60 },
          { f: "ProRes", c: "ProRes", r: "2K 2048 × 1152", fps: 90 },
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080", fps: 90 }
        ] },
        { name: "2.8K LF 1:1", px: [2880, 2880], mm: [23.76, 23.76], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "2880 × 2880", fps: 60 },
          { f: "ProRes", c: "ProRes", r: "2880 × 2880 (контейнер 3072 × 3024)", fps: 60 }
        ] },
        { name: "3.4K S35 3:2", px: [3424, 2202], mm: [28.25, 18.16], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "3424 × 2202", fps: 60 }
        ] },
        { name: "3.2K S35 16:9", px: [3200, 1800], mm: [26.4, 14.85], rec: [
          { f: "ProRes", c: "ProRes", r: "3200 × 1800", fps: 75 }
        ] },
        { name: "2.8K S35 4:3", px: [2880, 2160], mm: [23.76, 17.81], rec: [
          { f: "ProRes", c: "ProRes", r: "2880 × 2160", fps: 75 }
        ] },
        { name: "2.8K S35 16:9", px: [2880, 1620], mm: [23.76, 13.36], rec: [
          { f: "ProRes", c: "ProRes", r: "HD 1920 × 1080", fps: 100 }
        ] }
      ]
    },
    {
      id: "alexa-265", brand: "ARRI", name: "ALEXA 265",
      sensor: "65 mm ARRI A3X Rev.B", size: "54,12 × 25,58 мм", pitch: null,
      src: ["arri-265"],
      notes: ["Только ARRIRAW. Значения fps — для Codex Compact Drive 2TB; в скобках — 1TB."],
      modes: [
        { name: "6.5K 2.12:1 Open Gate", px: [6560, 3100], mm: [54.12, 25.58], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "6560 × 3100", fps: 60, lo: 29 }
        ] },
        { name: "5.1K 1.65:1", px: [5120, 3100], mm: [42.24, 25.58], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "5120 × 3100", fps: 60, lo: 37 }
        ] },
        { name: "4.5K LF 3:2", px: [4448, 3096], mm: [36.7, 25.54], rec: [
          { f: "ARRIRAW", c: "ARRIRAW", r: "4448 × 3096", fps: 60, lo: 43 }
        ] }
      ]
    },

    // ───────────── RED ─────────────
    {
      id: "red-epic-dragon", brand: "RED", name: "EPIC DRAGON 6K",
      sensor: "RED DRAGON 19,4 MP", size: "30,7 × 15,8 мм", pitch: 5.0,
      src: ["red-dragon"],
      notes: [
        "В спецификации RED для EPIC DRAGON указана только запись REDCODE RAW (R3D).",
        "мм для кадров меньше 6K FF посчитаны из пикселей (шаг ≈ 5 мкм = 30,7 мм / 6144)."
      ],
      modes: [
        { name: "6K Full Format", px: [6144, 3160], mm: [30.7, 15.8], rec: [{ f: "R3D", c: "REDCODE RAW (R3D)", r: "6144 × 3160", fps: 75 }] },
        redMode("6K 2.4:1", 6144, 2592, 100, 5.0),
        redMode("5K Full Format", 5120, 2700, 96, 5.0),
        redMode("5K 2.4:1", 5120, 2160, 120, 5.0),
        redMode("4K Full Format", 4096, 2160, 120, 5.0),
        redMode("4K 2.4:1", 4096, 1728, 150, 5.0),
        redMode("3K Full Format", 3072, 1620, 150, 5.0),
        redMode("3K 2.4:1", 3072, 1296, 200, 5.0),
        redMode("2K Full Format", 2048, 1080, 240, 5.0),
        redMode("2K 2.4:1", 2048, 864, 300, 5.0)
      ]
    },
    {
      id: "red-epic-w", brand: "RED", name: "EPIC-W 8K S35 (HELIUM)",
      sensor: "HELIUM 35,4 MP", size: "29,90 × 15,77 мм", pitch: 3.65,
      src: ["red-epicw"],
      notes: ["мм посчитаны из пикселей (шаг ≈ 3,65 мкм = 29,90 мм / 8192).", "Де-сквиз в камере — по списку форматов RED (Ana 2×, 1,3×, 1,25×)."],
      modes: [
        { name: "8K Full Format", px: [8192, 4320], mm: [29.9, 15.77], dsq: [2, 1.3, 1.25], rec: [{ f: "R3D", c: "REDCODE RAW (R3D)", r: "8192 × 4320", fps: 30 }] },
        redMode("8K 2.4:1", 8192, 3456, 30, 3.65),
        redMode("7K Full Format", 7168, 3780, 30, 3.65, { dsq: [2, 1.3] }),
        redMode("7K 2.4:1", 7168, 3024, 40, 3.65),
        redMode("6K Full Format", 6144, 3240, 75, 3.65, { dsq: [2, 1.3, 1.25] }),
        redMode("6K 2.4:1", 6144, 2592, 100, 3.65),
        redMode("5K Full Format", 5120, 2700, 96, 3.65, { dsq: [2, 1.3] }),
        redMode("5K 2.4:1", 5120, 2160, 120, 3.65),
        redMode("4K Full Format", 4096, 2160, 120, 3.65, { dsq: [2, 1.3] }),
        redMode("4K 2.4:1", 4096, 1728, 150, 3.65),
        redMode("3K Full Format", 3072, 1620, 150, 3.65, { dsq: [2, 1.3] }),
        redMode("3K 2.4:1", 3072, 1296, 200, 3.65),
        redMode("2K Full Format", 2048, 1080, 240, 3.65, { dsq: [2, 1.3] }),
        redMode("2K 2.4:1", 2048, 864, 300, 3.65),
        { name: "Apple ProRes / Avid (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 422 HQ / 422 / 422 LT", r: "4K 4096 × 2160", fps: 30 },
          { f: "ProRes", c: "ProRes 4444 XQ / 4444", r: "2K 2048 × 1080", fps: 120 },
          { f: "ProRes", c: "ProRes 422 HQ / 422 / 422 LT", r: "2K 2048 × 1080", fps: 120 },
          { f: "DNx", c: "DNxHR HQX / HQ / SQ", r: "4K 4096 × 2160", fps: 30 },
          { f: "DNx", c: "DNxHR 444 / HQ / SQ", r: "2K 2048 × 1080", fps: 120 },
          { f: "DNx", c: "DNxHD 444 / HQX / HQ / SQ", r: "HD 1920 × 1080", fps: 120 }
        ] }
      ]
    },
    {
      id: "red-gemini", brand: "RED", name: "GEMINI 5K S35",
      sensor: "GEMINI 15,4 MP Dual Sensitivity", size: "30,72 × 18,00 мм", pitch: 6.0,
      src: ["red-gemini"],
      notes: ["мм посчитаны из пикселей (шаг 6 мкм = 30,72 мм / 5120).", "Де-сквиз в камере — по списку форматов RED (Ana 2×, 1,3×)."],
      modes: [
        { name: "5K Full Height 1.7:1", px: [5120, 3000], mm: [30.72, 18.0], dsq: [2, 1.3], rec: [{ f: "R3D", c: "REDCODE RAW (R3D)", r: "5120 × 3000", fps: 75 }] },
        redMode("5K Full Format", 5120, 2700, 96, 6.0, { dsq: [2, 1.3] }),
        redMode("5K 2.4:1", 5120, 2160, 120, 6.0),
        redMode("4K Full Format", 4096, 2160, 120, 6.0, { dsq: [2, 1.3] }),
        redMode("4K 2.4:1", 4096, 1728, 150, 6.0),
        redMode("3K Full Format", 3072, 1620, 150, 6.0, { dsq: [2, 1.3] }),
        redMode("3K 2.4:1", 3072, 1296, 200, 6.0),
        redMode("2K Full Format", 2048, 1080, 240, 6.0, { dsq: [2, 1.3] }),
        redMode("2K 2.4:1", 2048, 864, 300, 6.0),
        { name: "Apple ProRes / Avid (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 422 HQ / 422 / 422 LT", r: "4K 4096 × 2160", fps: 30 },
          { f: "ProRes", c: "ProRes 4444 XQ / 4444", r: "2K 2048 × 1080", fps: 120 },
          { f: "ProRes", c: "ProRes 422 HQ / 422 / 422 LT", r: "2K 2048 × 1080", fps: 120 },
          { f: "DNx", c: "DNxHR HQX / HQ / SQ", r: "4K 4096 × 2160", fps: 30 },
          { f: "DNx", c: "DNxHR 444 / HQ / SQ", r: "2K 2048 × 1080", fps: 120 },
          { f: "DNx", c: "DNxHD 444 / HQX / HQ / SQ", r: "HD 1920 × 1080", fps: 120 }
        ] }
      ]
    },
    {
      id: "red-vraptor", brand: "RED", name: "V-RAPTOR 8K VV",
      sensor: "V-RAPTOR 8K VV 35,4 MP", size: "40,96 × 21,60 мм", pitch: 5.0,
      src: ["red-vr-fps", "red-vr-fmt", "red-vr-spec", "red-prores"],
      notes: [
        "fps — при Project Time Base 24 (таблица RED). Формат 8K/6K переключает VV ↔ S35 по площади кадра.",
        "Лучшее качество R3D: 8K 17:9 HQ/MQ/LQ до 60 fps, LQ до 120; 6K 17:9 HQ до 96, MQ/LQ до 160.",
        "Де-сквиз в камере: 8K — 2×…1,25×; 7K — 2×, 1,8×, 1,6×; 6K — 1,5×, 1,3×, 1,25×."
      ],
      modes: vraptorModes(R3D_DSMC3).concat([
        { name: "Apple ProRes (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 4444 XQ / 4444 / 422 HQ / 422 / 422 LT", r: "4K 4096 × 2160 (из форматов 17:9 от 4K)", fps: 120, note: "RED: общий максимум ProRes — 120 fps" },
          { f: "ProRes", c: "ProRes 4444 XQ / 4444 / 422 HQ / 422 / 422 LT", r: "2K / HD (форматы меньше 4K)", fps: 120 }
        ] }
      ])
    },
    {
      id: "red-vraptor-xl", brand: "RED", name: "V-RAPTOR XL 8K VV",
      sensor: "V-RAPTOR XL 8K VV 35,4 MP", size: "40,96 × 21,60 мм", pitch: 5.0,
      src: ["red-xl-spec", "red-xl-fps", "red-vr-fmt"],
      notes: [
        "Тот же сенсор и форматы, что у V-RAPTOR 8K VV; встроенный электронный ND 2–7 стопов, PL-байонет.",
        "fps — при Project Time Base 24 (таблица RED).",
        "Де-сквиз в камере: 8K — 2×…1,25×; 7K — 2×, 1,8×, 1,6×; 6K — 1,5×, 1,3×, 1,25×."
      ],
      modes: vraptorModes(R3D_DSMC3).concat([
        { name: "Apple ProRes (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 4444 XQ / 4444 / 422 HQ / 422 / 422 LT", r: "до 4K 4096 × 2160", fps: 120 },
          { f: "ProRes", c: "Proxy до ProRes 422 HQ", r: "2K 2048 × 1080", fps: 60 }
        ] }
      ])
    },
    {
      id: "red-komodo", brand: "RED", name: "KOMODO 6K",
      sensor: "KOMODO 19,9 MP S35 Global Shutter", size: "27,03 × 14,26 мм", pitch: 4.4,
      src: ["red-komodo"],
      notes: ["мм для кадров меньше 6K посчитаны из пикселей (шаг ≈ 4,4 мкм).", "Де-сквиз в камере для 6K 17:9: 2×, 1,8×, 1,6×, 1,5×, 1,3×, 1,25×."],
      modes: [
        { name: "6K 17:9", px: [6144, 3240], mm: [27.03, 14.26], dsq: [2, 1.8, 1.6, 1.5, 1.3, 1.25], rec: [{ f: "R3D", c: "REDCODE RAW (R3D) HQ / MQ / LQ", r: "6144 × 3240", fps: 40 }] },
        redMode("6K 2.4:1", 6144, 2592, 50, 4.4),
        redMode("5K 17:9", 5120, 2700, 48, 4.4),
        redMode("4K 17:9", 4096, 2160, 60, 4.4),
        redMode("2K 17:9", 2048, 1080, 120, 4.4),
        { name: "Apple ProRes (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 422 HQ / 422", r: "4K 4096 × 2160", fps: 60 },
          { f: "ProRes", c: "ProRes 422 HQ / 422", r: "2K 2048 × 1080", fps: 120 }
        ] }
      ]
    },
    {
      id: "red-komodo-x", brand: "RED", name: "KOMODO-X",
      sensor: "KOMODO-X 19,9 MP S35 Global Shutter", size: "27,03 × 14,26 мм", pitch: 4.4,
      src: ["red-komodox", "red-komodox-fps"],
      notes: ["fps — при Project Time Base 24 (таблица RED).", "мм для кадров меньше 6K 17:9 посчитаны из пикселей (шаг ≈ 4,4 мкм).", "Де-сквиз в камере для 6K 17:9: 2×, 1,8×, 1,6×, 1,5×, 1,3×, 1,25×."],
      modes: [
        { name: "6K 17:9", px: [6144, 3240], mm: [27.03, 14.26], dsq: [2, 1.8, 1.6, 1.5, 1.3, 1.25], rec: [{ f: "R3D", c: R3D_DSMC3, r: "6144 × 3240", fps: 80 }] },
        redMode("6K 2:1", 6144, 3072, 84, 4.4),
        redMode("6K 2.4:1", 6144, 2592, 100, 4.4),
        redMode("6K 16:9", 5760, 3240, 80, 4.4),
        redMode("6K 1:1", 3240, 3240, 80, 4.4),
        redMode("5K 17:9", 5120, 2700, 96, 4.4),
        redMode("5K 16:9", 4800, 2700, 96, 4.4),
        redMode("4K 17:9", 4096, 2160, 120, 4.4),
        redMode("4K 16:9", 3840, 2160, 120, 4.4),
        redMode("2K 17:9", 2048, 1080, 240, 4.4),
        { name: "Apple ProRes (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 4444 XQ", r: "4K 4096 × 2160", fps: 60 },
          { f: "ProRes", c: "ProRes 4444", r: "4K 4096 × 2160", fps: 80 },
          { f: "ProRes", c: "ProRes 422 HQ / 422 / 422 LT", r: "4K 4096 × 2160", fps: 120 }
        ] }
      ]
    },

    // ───────────── SONY ─────────────
    {
      id: "sony-venice", brand: "Sony", name: "VENICE (6K)",
      sensor: "Full Frame 36 × 24 мм, 6K", size: "35,9 × 24,0 мм (6K 3:2)", pitch: null,
      src: ["sony-venice"],
      notes: [
        "X-OCN XT / ST / LT и RAW — с рекордером AXS-R7. Максимум fps указан с лицензией High Frame Rate (в строке — без неё).",
        "Внутри на SxS: XAVC 4K Class 480 — до 30 fps, Class 300 — до 60; ProRes 422 HD — до 60; MPEG HD 422 — до 30.",
        "6K-режимы — лицензия Full Frame; 4K 4:3 и 4K 6:5 — лицензия Anamorphic (она же нужна для де-сквиза ≠ 1,0×)."
      ],
      modes: [
        { name: "6K 3:2", px: [6048, 4032], mm: [35.9, 24.0], lic: "Full Frame", dsq: [1.25, 1.3, 1.5, 1.65, 1.8, 2], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "6048 × 4032", fps: 60, note: "без HFR — до 25" }
        ] },
        { name: "6K 1.85:1", px: [6054, 3272], mm: [36.0, 19.4], lic: "Full Frame", rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "6054 × 3272", fps: 72, note: "без HFR — до 30" }
        ] },
        { name: "6K 17:9", px: [6054, 3192], mm: [36.0, 19.0], lic: "Full Frame", dsq: [1.25, 1.3, 1.65, 1.8, 2], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "6054 × 3192", fps: 72, note: "без HFR — до 30" }
        ] },
        { name: "6K 2.39:1", px: [6048, 2534], mm: [35.9, 15.0], lic: "Full Frame", rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "6048 × 2534", fps: 90, note: "без HFR — до 30" }
        ] },
        { name: "5.7K 16:9", px: [5674, 3192], mm: [33.7, 18.9], lic: "Full Frame", rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "5674 × 3192", fps: 72, note: "без HFR — до 30" }
        ] },
        { name: "4K 6:5", px: [4096, 3432], mm: [24.3, 20.4], lic: "Anamorphic", ana: true, dsq: [2], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "4096 × 3432", fps: 72, note: "без HFR — до 30" }
        ] },
        { name: "4K 4:3", px: [4096, 3024], mm: [24.3, 18.0], lic: "Anamorphic", ana: true, dsq: [1.3, 1.65, 1.8, 2], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "4096 × 3024", fps: 75, note: "без HFR — до 48" }
        ] },
        { name: "4K 17:9", px: [4096, 2160], mm: [24.3, 12.8], dsq: [1.25, 1.3, 1.65, 1.8, 2], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "4096 × 2160", fps: 110, note: "без HFR — до 60" },
          { f: "XAVC", c: "XAVC 4K Class 300 (SxS)", r: "4096 × 2160", fps: 60 },
          { f: "XAVC", c: "XAVC 4K Class 480 (SxS)", r: "4096 × 2160", fps: 30 }
        ] },
        { name: "4K 2.39:1", px: [4096, 1716], mm: [24.3, 10.3], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "4096 × 1716", fps: 120, note: "без HFR — до 60" }
        ] },
        { name: "3.8K 16:9", px: [3840, 2160], mm: [22.8, 12.8], rec: [
          { f: "X-OCN", c: "X-OCN XT / ST / LT, RAW (AXS-R7)", r: "3840 × 2160", fps: 110, note: "без HFR — до 60" },
          { f: "XAVC", c: "XAVC QFHD Class 300 (SxS)", r: "3840 × 2160", fps: 60 },
          { f: "XAVC", c: "XAVC QFHD Class 480 (SxS)", r: "3840 × 2160", fps: 30 }
        ] },
        { name: "HD (запись на SxS)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 422 HD", r: "1920 × 1080", fps: 60 },
          { f: "ProRes", c: "ProRes 4444 HD", r: "1920 × 1080", fps: null },
          { f: "XAVC", c: "MPEG HD 422", r: "1920 × 1080", fps: 30 }
        ] }
      ]
    },
    {
      id: "sony-venice2-8k", brand: "Sony", name: "VENICE 2 8K",
      sensor: "Full Frame 8.6K", size: "35,9 × 24,0 мм (8.6K 3:2)", pitch: null,
      src: ["sony-venice2", "sony-venice2-poster"],
      notes: [
        "Внутренняя запись X-OCN XT / ST / LT и Apple ProRes 4K (4444 XQ / 4444 / 422 HQ) на AXS.",
        "fps — диапазон Select FPS из таблицы Sony; Sony: «не все fps доступны во всех форматах записи» и зависят от карты AXS.",
        "Лицензия Anamorphic нужна для де-сквиза ≠ 1,0×. В base ISO 3200 недоступны 1–7 fps."
      ],
      modes: [
        { name: "8.6K 3:2", px: [8640, 5760], mm: [35.9, 24.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "8640 × 5760", fps: 30 }] },
        { name: "8.6K 17:9", px: [8640, 4556], mm: [35.9, 19.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "8640 × 4556", fps: 48 }] },
        { name: "8.2K 17:9", px: [8192, 4320], mm: [34.1, 18.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "8192 × 4320", fps: 60 }] },
        { name: "8.2K 2.39:1", px: [8192, 3432], mm: [34.1, 14.3], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "8192 × 3432", fps: 72 }] },
        { name: "8.1K 16:9", px: [8100, 4556], mm: [33.8, 19.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "8100 × 4556", fps: 48 }] },
        { name: "7.6K 16:9", px: [7680, 4320], mm: [32.0, 18.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "7680 × 4320", fps: 60 }] },
        { name: "5.8K 6:5", px: [5792, 4854], mm: [24.1, 20.2], lic: "Anamorphic", ana: true, rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5792 × 4854", fps: 48 }] },
        { name: "5.8K 4:3", px: [5792, 4276], mm: [24.1, 17.8], lic: "Anamorphic", ana: true, rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5792 × 4276", fps: 60 }] },
        { name: "5.8K 17:9", px: [5792, 3056], mm: [24.1, 12.7], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5792 × 3056", fps: 90 }] },
        { name: "5.5K 2.39:1", px: [5480, 2296], mm: [22.8, 9.55], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5480 × 2296", fps: 120 }] },
        { name: "5.4K 16:9", px: [5434, 3056], mm: [22.6, 12.7], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5434 × 3056", fps: 90 }] },
        { name: "Apple ProRes 4K (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 4444 XQ / 4444 / 422 HQ", r: "4K", fps: null, note: "Sony не публикует максимум fps ProRes по режимам на странице продукта — проверяйте в VENICE 2 Menu Simulator" }
        ] }
      ]
    },
    {
      id: "sony-venice2-6k", brand: "Sony", name: "VENICE 2 6K",
      sensor: "Full Frame 6K", size: "35,9 × 24,0 мм (6K 3:2)", pitch: null,
      src: ["sony-venice2"],
      notes: [
        "Внутренняя запись X-OCN XT / ST / LT и Apple ProRes 4K (4444 XQ / 4444 / 422 HQ) на AXS.",
        "fps — диапазон Select FPS из таблицы Sony; выбор зависит от формата записи и карты AXS.",
        "Лицензия Anamorphic нужна для де-сквиза ≠ 1,0×."
      ],
      modes: [
        { name: "6K 3:2", px: [6048, 4032], mm: [35.9, 24.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "6048 × 4032", fps: 60 }] },
        { name: "6K 1.85:1", px: [6054, 3272], mm: [36.0, 19.4], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "6054 × 3272", fps: 72 }] },
        { name: "6K 17:9", px: [6054, 3192], mm: [36.0, 19.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "6054 × 3192", fps: 72 }] },
        { name: "6K 2.39:1", px: [6048, 2534], mm: [35.9, 15.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "6048 × 2534", fps: 90 }] },
        { name: "5.7K 16:9", px: [5674, 3192], mm: [33.7, 19.0], lic: "Full Frame", rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "5674 × 3192", fps: 72 }] },
        { name: "4K 6:5", px: [4096, 3432], mm: [24.3, 20.4], lic: "Anamorphic", ana: true, rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "4096 × 3432", fps: 72 }] },
        { name: "4K 4:3", px: [4096, 3024], mm: [24.3, 18.0], lic: "Anamorphic", ana: true, rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "4096 × 3024", fps: 75 }] },
        { name: "4K 17:9", px: [4096, 2160], mm: [24.3, 12.8], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "4096 × 2160", fps: 110 }] },
        { name: "4K 2.39:1", px: [4096, 1716], mm: [24.3, 10.3], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "4096 × 1716", fps: 120 }] },
        { name: "3.8K 16:9", px: [3840, 2160], mm: [22.8, 12.8], rec: [{ f: "X-OCN", c: "X-OCN XT / ST / LT", r: "3840 × 2160", fps: 60 }] },
        { name: "Apple ProRes 4K (в камере)", generic: true, rec: [
          { f: "ProRes", c: "ProRes 4444 XQ / 4444 / 422 HQ", r: "4K", fps: null, note: "Sony не публикует максимум fps ProRes по режимам на странице продукта" }
        ] }
      ]
    },
    {
      id: "sony-burano", brand: "Sony", name: "BURANO",
      sensor: "Full Frame 8.6K", size: "35,9 × 20,2 мм (FF 8.6K 16:9)", pitch: null,
      src: ["sony-burano"],
      notes: [
        "Внутренняя запись X-OCN LT (XT/ST не поддерживаются), XAVC H-I / H-L, XAVC-I / XAVC-L на CFexpress Type B.",
        "Sony: для некоторых объективов возможен верхний предел fps в зависимости от формата записи."
      ],
      modes: [
        { name: "FF 8.6K 16:9", px: [8632, 4856], mm: [35.9, 20.2], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "8632 × 4856", fps: 30 },
          { f: "XAVC", c: "XAVC H-I / H-L", r: "7680 × 4320", fps: 30 }
        ] },
        { name: "FF 8.6K 17:9", px: [8632, 4552], mm: [35.9, 18.9], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "8632 × 4552", fps: 30 },
          { f: "XAVC", c: "XAVC H-I", r: "8192 × 4320", fps: 30 }
        ] },
        { name: "FFc 6K 16:9", px: [6052, 3404], mm: [33.6, 18.9], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "6052 × 3404", fps: 60 },
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "3840 × 2160", fps: 60 },
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "1920 × 1080", fps: 60 }
        ] },
        { name: "FFc 6K 17:9", px: [6052, 3192], mm: [33.6, 17.7], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "6052 × 3192", fps: 60 },
          { f: "XAVC", c: "XAVC-I", r: "4096 × 2160", fps: 60 }
        ] },
        { name: "FFc 3.8K 16:9", px: [3840, 2160], mm: [32.0, 18.0], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "3840 × 2160", fps: 120 },
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "3840 × 2160", fps: 120 }
        ] },
        { name: "S35 5.8K 16:9", px: [5760, 3240], mm: [24.0, 13.5], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "5760 × 3240", fps: 60 },
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "3840 × 2160", fps: 60 },
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "1920 × 1080", fps: 60 }
        ] },
        { name: "S35 5.8K 17:9", px: [5760, 3036], mm: [24.0, 12.6], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "5760 × 3036", fps: 60 },
          { f: "XAVC", c: "XAVC-I", r: "4096 × 2160", fps: 60 }
        ] },
        { name: "S35 4.3K 4:3", px: [4256, 3192], mm: [23.6, 17.7], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "4256 × 3192", fps: 60 }
        ] },
        { name: "S35c 4K 17:9", px: [4096, 2160], mm: [17.0, 9.0], rec: [
          { f: "X-OCN", c: "X-OCN LT", r: "4096 × 2160", fps: 120 },
          { f: "XAVC", c: "XAVC-I", r: "4096 × 2160", fps: 120 }
        ] },
        { name: "S35 1.9K 16:9", px: [1920, 1080], mm: [24.0, 13.5], rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "1920 × 1080", fps: 240, note: "150–240 fps: без выхода SDI/HDMI" }
        ] }
      ]
    },
    {
      id: "sony-fx3", brand: "Sony", name: "FX3",
      sensor: "Full Frame Exmor R, 10,3 MP (видео)", size: "35,6 × 23,8 мм (весь сенсор)", pitch: null,
      src: ["sony-fx3"],
      notes: [
        "Sony не публикует площадь кадра по режимам — мм указаны для всего сенсора.",
        "Выше 60 fps — через S&Q Motion или 119,88p/100p. У некоторых значений в спецификации Sony есть сноски (ограничения) — сверяйтесь с Help Guide.",
        "RAW-выход по HDMI: 4264 × 2408, 16 бит, до 59,94p (на внешний рекордер)."
      ],
      modes: [
        { name: "4K DCI", px: [4096, 2160], mm: null, rec: [
          { f: "XAVC", c: "XAVC S-I DCI 4K (4:2:2 10 бит)", r: "4096 × 2160", fps: 60 }
        ] },
        { name: "4K UHD", px: [3840, 2160], mm: null, rec: [
          { f: "XAVC", c: "XAVC HS 4K (H.265)", r: "3840 × 2160", fps: 120 },
          { f: "XAVC", c: "XAVC S 4K (H.264)", r: "3840 × 2160", fps: 120 },
          { f: "XAVC", c: "XAVC S-I 4K", r: "3840 × 2160", fps: 120, note: "120 — только S&Q; запись 59,94p" }
        ] },
        { name: "HD", px: [1920, 1080], mm: null, rec: [
          { f: "XAVC", c: "XAVC S HD / XAVC S-I HD", r: "1920 × 1080", fps: 240, note: "выше 120 — S&Q, со сноской Sony" }
        ] },
        { name: "RAW-выход (HDMI)", px: [4264, 2408], mm: null, rec: [
          { f: "RAW out", c: "16-bit RAW по HDMI (внешний рекордер)", r: "4264 × 2408", fps: 60 }
        ] }
      ]
    },
    {
      id: "sony-fx6", brand: "Sony", name: "FX6",
      sensor: "35 mm Full Frame CMOS, 10,2 MP (эфф.)", size: "мм в спецификации Sony не указаны", pitch: null,
      src: ["sony-fx6"],
      notes: [
        "Выше 60 fps — режим S&Q Motion. 150–240 fps в HD — со сноской Sony (ограничения).",
        "DCI 4K в S&Q — только до 60 fps."
      ],
      modes: [
        { name: "4K DCI", px: [4096, 2160], mm: null, rec: [
          { f: "XAVC", c: "XAVC-I DCI 4K", r: "4096 × 2160", fps: 60 }
        ] },
        { name: "4K UHD (QFHD)", px: [3840, 2160], mm: null, rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L QFHD", r: "3840 × 2160", fps: 120, note: "100/120 — S&Q" }
        ] },
        { name: "HD", px: [1920, 1080], mm: null, rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L HD", r: "1920 × 1080", fps: 240, note: "100–240 — S&Q; 150–240 со сноской Sony" }
        ] }
      ]
    },
    {
      id: "sony-fx9", brand: "Sony", name: "FX9",
      sensor: "Full Frame 6K, 19 MP", size: "35,7 × 18,8 мм (FF 6K)", pitch: null,
      src: ["sony-fx9", "sony-fx9-fw"],
      notes: [
        "Данные — статья Sony Cine о режимах сканирования (прошивка V2) и дорожная карта прошивок Sony.",
        "Запись XAVC-I / XAVC-L; максимальный файл — 4K DCI / UHD (не 6K). Кроп-фактор: FF crop 5K — 1,25; S35 — 1,5 к FF 6K.",
        "S16-режим (V3) для B4 — до 180 fps в FHD. RAW-выход 16 бит — с XDCA-FX9 (QFHD до 120p)."
      ],
      modes: [
        { name: "FF 6K", px: null, mm: [35.7, 18.8], rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "4K DCI / UHD", fps: 30 }
        ] },
        { name: "FF crop 5K", px: null, mm: null, note: "≈ 83% ширины FF 6K", rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "4K DCI / UHD", fps: 60 }
        ] },
        { name: "S35 4K", px: null, mm: null, rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "4K DCI / UHD", fps: 60 }
        ] },
        { name: "FF 2K", px: null, mm: null, note: "Sony: качество ниже, режим для рапида", rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "HD 1920 × 1080", fps: 180 }
        ] },
        { name: "S35 2K", px: null, mm: null, note: "Sony: качество ниже, режим для рапида", rec: [
          { f: "XAVC", c: "XAVC-I / XAVC-L", r: "HD 1920 × 1080", fps: 120 }
        ] }
      ]
    },

    // ───────────── Blackmagic ─────────────
    {
      id: "bmd-ursa-cine-12k", brand: "Blackmagic", name: "URSA Cine 12K LF",
      sensor: "Large Format RGBW 36 × 24", size: "35,64 × 23,32 мм", pitch: 2.9,
      src: ["bmd-ursacine"],
      notes: [
        "Только Blackmagic RAW (CBR 3:1…18:1, Q0…Q5) + H.264 прокси.",
        "Blackmagic указывает максимум fps не для всех форматов — где не указан, стоит «н/д».",
        "мм для 12K/9K посчитаны из пикселей (шаг 2,9 мкм); для 8K/4K площадь не указана."
      ],
      modes: [
        { name: "12K 3:2 Open Gate", px: [12288, 8040], mm: [35.64, 23.32], rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "12288 × 8040", fps: 80 }] },
        { name: "12K 17:9", px: [12288, 6480], mm: [35.64, 18.79], calc: true, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "12288 × 6480", fps: 100 }] },
        { name: "12K 16:9", px: [12288, 6912], mm: [35.64, 20.04], calc: true, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "12288 × 6912", fps: null }] },
        { name: "12K 2.4:1", px: [12288, 5112], mm: [35.64, 14.82], calc: true, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "12288 × 5112", fps: 120 }] },
        { name: "12K 6:5", px: [9648, 8040], mm: [27.98, 23.32], calc: true, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "9648 × 8040", fps: null }] },
        { name: "9K 3:2 Super 35", px: [9408, 6264], mm: [27.28, 18.17], calc: true, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "9408 × 6264", fps: 100 }] },
        { name: "8K 3:2 Open Gate", px: [8192, 5360], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "8192 × 5360", fps: 144 }] },
        { name: "8K 17:9", px: [8192, 4320], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "8192 × 4320", fps: null }] },
        { name: "8K 2.4:1", px: [8192, 3408], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "8192 × 3408", fps: 224 }] },
        { name: "8K 6:5", px: [6432, 5360], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "6432 × 5360", fps: null }] },
        { name: "4K 3:2 Open Gate", px: [4096, 2680], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "4096 × 2680", fps: 144 }] },
        { name: "4K 17:9", px: [4096, 2160], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "4096 × 2160", fps: null }] },
        { name: "4K 2.4:1", px: [4096, 1704], mm: null, rec: [{ f: "BRAW", c: "Blackmagic RAW", r: "4096 × 1704", fps: 224 }] }
      ]
    }
  ];

  window.LC_DATA = { SOURCES, CAMERAS, UPDATED: "2026-11-22" };
})();
