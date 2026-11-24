/* Lazy Camera — вкладка «Оптика»: справочник по линейкам объективов и покрытие сенсора (расчётная модель) */
(function () {
  "use strict";
  const L = window.LC_LENSES;
  const C = window.LC_DATA;
  if (!L || !C) return;
  const { SERIES, SECTIONS, SOURCES } = L;
  const CAMS = C.CAMERAS.map((c) => ({ c, modes: c.modes.filter((m) => m.mm && !m.generic) })).filter((x) => x.modes.length);

  const KEY = "lazy-camera-optics-v2";
  const $ = (id) => document.getElementById(id);
  const el = {
    view: $("optView"), sec: $("optSec"), secNote: $("optSecNote"), list: $("optSeries"), search: $("optSearch"),
    ref: $("optRef"), cov: $("optCov"),
    cSeries: $("covSeries"), cFocal: $("covFocal"), cCam: $("covCam"), cMode: $("covMode"),
    cZoomField: $("covZoomField"), cZoom: $("covZoom"), cZoomVal: $("covZoomVal"),
    cCanvas: $("covCanvas"), cCanvasCap: $("covCanvasCap"),
    cSvg: $("covSvg"), cVerdict: $("covVerdict"), cMetrics: $("covMetrics"), cNote: $("covNote"),
    sources: $("optSources"), date: $("optDate")
  };

  const state = { view: "ref", sec: "s35", q: "", open: {}, series: "arri-sig", idx: 6, focal: 35, cam: "alexa-35", mode: 0 };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  if (!SECTIONS.some((s) => s.id === state.sec)) state.sec = "s35";
  if (!SERIES.some((s) => s.id === state.series)) state.series = "arri-sig";
  if (!CAMS.some((x) => x.c.id === state.cam)) state.cam = "alexa-35";
  state.q = "";
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const num = (x, d) => {
    if (x == null) return "н/д";
    if (typeof x === "string") return x.replace(/\./g, ",");
    const r = d == null ? String(x) : Number(x).toFixed(d);
    return r.replace(".", ",");
  };
  const trim = (x) => (x == null ? "н/д" : String(Math.round(x * 1000) / 1000).replace(".", ","));
  const sqLabel = (q) => String(q).replace(".", ",") + "×";
  const tMin = (t) => (t == null ? null : typeof t === "string" ? parseFloat(t) : t);
  const fLabel = (f) => (Array.isArray(f) ? trim(f[0]) + "–" + trim(f[1]) : trim(f));
  const fMin = (f) => (Array.isArray(f) ? f[0] : f);
  const fMax = (f) => (Array.isArray(f) ? f[1] : f);
  const TAGS = { vintage: "винтаж", rental: "только аренда", secondary: "вторичный источник" };
  const secOf = (id) => SECTIONS.find((s) => s.id === id);
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

  // ── справочник ──
  function icLabel(s) {
    const v = trim(Math.round(s.ic * 100) / 100);
    if (s.icType === "format") return "формат Ø " + v + " мм";
    if (s.icType === "nominal") return "ориентир Ø " + v + " мм";
    const ics = s.lenses.map((r) => (r[5] && r[5].ic) || s.ic);
    const lo = Math.min(...ics), hi = Math.max(...ics);
    return lo !== hi ? "пятно Ø " + trim(lo) + "–" + trim(hi) + " мм" : "пятно Ø " + v + " мм";
  }
  function seriesMeta(s) {
    const parts = [icLabel(s)];
    if (s.sq) parts.push("анаморфот " + sqLabel(s.sq));
    parts.push(s.mount);
    const lo = Math.min(...s.lenses.map((r) => fMin(r[0]))), hi = Math.max(...s.lenses.map((r) => fMax(r[0])));
    parts.push(s.lenses.length + " шт · " + trim(lo) + "–" + trim(hi) + " мм");
    return parts.join(" · ");
  }
  function matches(s, q) {
    const hay = (s.brand + " " + s.name + " " + s.mount + " " + (s.tags || []).map((t) => TAGS[t]).join(" ") + " " + secOf(s.sec).label).toLowerCase();
    return q.split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  function card(s, showSec) {
    const open = state.open[s.id] != null ? state.open[s.id] : false;
    let h = '<details class="card lens-card" data-id="' + s.id + '"' + (open ? " open" : "") + ">";
    const tags = (showSec ? [secOf(s.sec).label] : []).concat((s.tags || []).map((t) => TAGS[t]));
    h += '<summary><span class="lens-head"><span class="mode-name">' + esc(s.name) + '</span><span class="lens-brand">' + esc(s.brand) + "</span></span>" +
      (tags.length ? '<span class="lens-tags">' + tags.map((t) => '<span class="lens-tag">' + esc(t) + "</span>").join("") + "</span>" : "") +
      '<span class="lens-meta">' + esc(seriesMeta(s)) + "</span></summary>";
    h += '<div class="lens-body">';
    h += '<div class="lens-table' + (s.zoom ? " zoom" : "") + '" role="table"><div class="lt-row lt-head" role="row">' +
      '<span role="columnheader">' + (s.zoom ? "F, мм" : "F, мм") + '</span><span role="columnheader">T</span><span role="columnheader">МДФ, м</span>' +
      '<span role="columnheader">Ø, мм</span><span role="columnheader">кг</span></div>';
    s.lenses.forEach((r) => {
      const o = r[5] || {};
      const sub = [o.note, o.ic && o.ic !== s.ic ? "пятно Ø" + trim(o.ic) : null].filter(Boolean).join(" · ");
      h += '<div class="lt-row" role="row"><span class="lt-f">' + fLabel(r[0]) + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" +
        "<span>" + num(r[1]) + "</span><span>" + trim(r[2]) + "</span><span>" + (r[3] == null ? "н/д" : trim(r[3])) + "</span><span>" + trim(r[4]) + "</span></div>";
    });
    h += "</div>";
    const notes = [s.icNote];
    if (!s.mod) notes.push("МДФ: производитель не уточняет точку отсчёта.");
    (s.notes || []).forEach((n) => notes.push(n));
    h += '<ul class="lens-notes">' + notes.map((n) => "<li>" + esc(n) + "</li>").join("") + "</ul>";
    h += '<p class="lens-src">Источник: ' + s.src.map((k) => SOURCES[k]).filter(Boolean).map((x) => '<a href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' + esc(x.t) + "</a>").join("; ") + "</p>";
    h += '<div class="lens-actions"><button type="button" class="text-btn wide" data-cover="' + s.id + '">Покрытие на камере →</button></div>';
    h += "</div></details>";
    return h;
  }
  function renderRef() {
    el.sec.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-checked", String(!state.q && b.dataset.sec === state.sec)));
    const q = state.q.trim().toLowerCase();
    let list, note;
    if (q) {
      list = SERIES.filter((s) => matches(s, q));
      note = "Поиск по всем разделам · " + list.length + " " + plural(list.length, "линейка", "линейки", "линеек");
    } else {
      const sec = secOf(state.sec);
      list = SERIES.filter((s) => s.sec === state.sec);
      note = sec.title + " · " + list.length + " " + plural(list.length, "линейка", "линейки", "линеек");
    }
    el.secNote.textContent = note;
    el.list.innerHTML = list.length ? list.map((s) => card(s, !!q)).join("") : '<div class="card empty-note">Ничего не найдено</div>';
  }

  // ── покрытие ──
  function fillCovSelectors() {
    el.cSeries.innerHTML = SECTIONS.map((sec) =>
      '<optgroup label="' + esc(sec.title) + '">' +
      SERIES.filter((s) => s.sec === sec.id).map((s) => '<option value="' + s.id + '">' + esc(s.brand + " " + s.name) + "</option>").join("") +
      "</optgroup>").join("");
    const brands = [];
    CAMS.forEach((x) => { if (!brands.includes(x.c.brand)) brands.push(x.c.brand); });
    el.cCam.innerHTML = brands.map((b) =>
      '<optgroup label="' + esc(b) + '">' +
      CAMS.filter((x) => x.c.brand === b).map((x) => '<option value="' + x.c.id + '">' + esc(b + " " + x.c.name) + "</option>").join("") +
      "</optgroup>").join("");
  }
  function currentSeries() { return SERIES.find((s) => s.id === state.series) || SERIES[0]; }
  function currentCam() { return CAMS.find((x) => x.c.id === state.cam) || CAMS[0]; }
  function nearestIdx(s, f) {
    let best = 0, bd = Infinity;
    s.lenses.forEach((r, i) => { const d = f >= fMin(r[0]) && f <= fMax(r[0]) ? 0 : Math.min(Math.abs(fMin(r[0]) - f), Math.abs(fMax(r[0]) - f)); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  function renderCov() {
    const s = currentSeries();
    el.cSeries.value = s.id;
    if (!(state.idx >= 0 && state.idx < s.lenses.length)) state.idx = nearestIdx(s, state.focal);
    el.cFocal.innerHTML = s.lenses.map((r, i) => '<option value="' + i + '">' + fLabel(r[0]) + " мм · T" + num(r[1]) + ((r[5] && r[5].note) ? " · " + esc(r[5].note) : "") + "</option>").join("");
    el.cFocal.value = String(state.idx);
    const lens = s.lenses[state.idx];
    const o = lens[5] || {};
    const ic = o.ic || s.ic;
    const isZoom = Array.isArray(lens[0]);
    let f;
    if (isZoom) {
      const [a, b] = lens[0];
      f = Math.min(b, Math.max(a, state.focal || a));
      el.cZoomField.hidden = false;
      el.cZoom.min = a; el.cZoom.max = b; el.cZoom.step = b - a > 60 ? 1 : 0.5;
      el.cZoom.value = f;
      el.cZoomVal.textContent = trim(f) + " мм";
    } else {
      f = lens[0];
      el.cZoomField.hidden = true;
    }
    state.focal = f;

    const cx = currentCam();
    el.cCam.value = cx.c.id;
    if (state.mode >= cx.modes.length || state.mode < 0) state.mode = 0;
    el.cMode.innerHTML = cx.modes.map((m, i) => {
      const d = Math.hypot(m.mm[0], m.mm[1]);
      return '<option value="' + i + '">' + esc(m.name) + " · Ø " + num(d, 1) + "</option>";
    }).join("");
    el.cMode.value = String(state.mode);
    const m = cx.modes[state.mode];
    const [w, h] = m.mm;
    const diag = Math.hypot(w, h);
    const ratio = diag / ic;
    const declared = s.icType === "circle";

    // вердикт
    let cls, title, text;
    if (!declared) {
      const what = s.icType === "nominal" ? "ориентира по формату (производитель пятно не публикует)" : "формата, который заявляет производитель";
      if (ratio <= 1.0005) { cls = "ok"; title = s.icType === "nominal" ? "Вероятно покрывает" : "Покрывает"; text = "Кадр в пределах " + what + "."; }
      else { cls = "edge"; title = "Вне заявленного"; text = "Кадр больше " + what + " на " + num((ratio - 1) * 100, 0) + "% по диагонали. Диаметр круга не опубликован — нужен тест."; }
    } else if (ratio <= 0.98) { cls = "ok"; title = "Покрывает"; text = "Запас по диагонали " + num((1 / ratio - 1) * 100, 0) + "%."; }
    else if (ratio <= 1.03) { cls = "edge"; title = "Погранично"; text = "Углы кадра на краю пятна: возможны падение резкости и затемнение в углах. Проверьте тестом."; }
    else { cls = "no"; title = "Виньетирует"; text = "Диагональ кадра больше пятна на " + num((ratio - 1) * 100, 0) + "%: тёмные углы."; }
    el.cVerdict.className = "cov-verdict " + cls;
    el.cVerdict.innerHTML = '<span class="cov-title">' + esc(title) + "</span><span>" + esc(text) + "</span>";

    const corner = illum(diag / 2, ic / 2, f, softFor(s));
    // метрики
    const rows = [];
    rows.push(["Кадр", num(w, 2) + " × " + num(h, 2) + " мм" + (m.calc ? "*" : "")]);
    rows.push(["Диагональ кадра", num(diag, 2) + " мм"]);
    rows.push([s.icType === "circle" ? "Пятно объектива" : s.icType === "format" ? "Заявленный формат" : "Ориентир (не данные производителя)", "Ø " + num(ic, 2) + " мм"]);
    rows.push(["Свет в углу кадра (расчёт)", corner > 0.004 ? num(Math.log2(corner), 1).replace("-", "−") + " EV" : "темно"]);
    const sq = s.sq || 1;
    const hfov = 2 * Math.atan((w * sq) / (2 * f)) * 180 / Math.PI;
    const vfov = 2 * Math.atan(h / (2 * f)) * 180 / Math.PI;
    rows.push(["Угол обзора" + (isZoom ? " на " + trim(f) + " мм" : "") + " (расчёт)", "H " + num(hfov, 1) + "° · V " + num(vfov, 1) + "°"]);
    if (s.sq) rows.push(["После де-сквиза " + sqLabel(s.sq), num((w / h) * s.sq, 2) + ":1"]);
    rows.push(["Объектив", "T" + num(lens[1]) + " · МДФ " + trim(lens[2]) + " м"]);
    rows.push(["Ø передней части · вес", (lens[3] == null ? "н/д" : trim(lens[3]) + " мм") + " · " + trim(lens[4]) + " кг"]);
    el.cMetrics.innerHTML = rows.map((r) => '<div class="cov-row"><span>' + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></div>").join("");
    const notes = [s.icNote];
    notes.push("Картинка — расчётная модель, не замер: равномерное поле с естественным спадом cos⁴ по фокусному и мягкой границей на диаметре пятна. Реальная граница зависит от диафрагмы, дистанции фокусировки и экземпляра объектива.");
    if (s.sq) notes.push("Анаморфот сжимает картинку по горизонтали, но пятно на сенсоре — круг: покрытие считаем по физическому кадру.");
    if (isZoom) notes.push("У зумов производитель публикует одно пятно на весь диапазон; на краях диапазона реальное покрытие может отличаться.");
    if (m.calc) notes.push("* мм кадра посчитаны из пикселей и шага пикселя производителя камеры.");
    el.cNote.innerHTML = notes.map((n) => "<li>" + esc(n) + "</li>").join("");

    drawCanvas(w, h, ic, f, s, cls);
    drawSvg(w, h, ic, s.icType, cls);
  }

  // ── расчётная картинка освещённости ──
  const softFor = (s) => (s.icType === "circle" ? 0.035 : 0.07);
  function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function illum(r, R, f, soft) {
    const c = f / Math.hypot(f, r);
    const nat = c * c * c * c;
    const edge = 1 - smooth(R * (1 - soft), R * (1 + soft), r);
    return nat * edge;
  }
  function drawCanvas(w, h, ic, f, s, cls) {
    const cv = el.cCanvas;
    const cssW = cv.parentElement.clientWidth || 320;
    const aspect = Math.min(3, Math.max(0.6, w / h));
    const cssH = Math.round(cssW / aspect);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
    cv.width = W; cv.height = H; cv.style.height = cssH + "px";
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(W, H);
    const k = w / W; // мм на пиксель
    const R = ic / 2, soft = softFor(s);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const my = (y + 0.5 - H / 2) * (h / H);
      for (let x = 0; x < W; x++) {
        const mx = (x + 0.5 - W / 2) * k;
        const e = illum(Math.hypot(mx, my), R, f, soft);
        const v = Math.pow(e, 1 / 2.2) * 212;
        const i = (y * W + x) * 4;
        d[i] = v; d[i + 1] = v * 0.97; d[i + 2] = v * 0.92; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const fg = (css.getPropertyValue("--fg") || "#ffb000").trim();
    const sc = W / w;
    ctx.save();
    ctx.lineWidth = 1.4 * dpr;
    ctx.strokeStyle = fg;
    ctx.setLineDash(s.icType === "circle" ? [] : [6 * dpr, 5 * dpr]);
    ctx.beginPath(); ctx.arc(W / 2, H / 2, R * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(dpr, dpr, W - 2 * dpr, H - 2 * dpr);
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath(); ctx.moveTo(W / 2 - 7 * dpr, H / 2); ctx.lineTo(W / 2 + 7 * dpr, H / 2); ctx.moveTo(W / 2, H / 2 - 7 * dpr); ctx.lineTo(W / 2, H / 2 + 7 * dpr); ctx.stroke();
    ctx.font = (10 * dpr) + "px 'IBM Plex Mono', monospace";
    const tw = ctx.measureText("РАСЧЁТ").width; ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(4 * dpr, 4 * dpr, tw + 10 * dpr, 15 * dpr);
    ctx.fillStyle = fg; ctx.fillText("РАСЧЁТ", 9 * dpr, 15 * dpr);
    ctx.restore();
    el.cCanvasCap.textContent = "Кадр " + num(w, 1) + " × " + num(h, 1) + " мм · пятно Ø " + num(ic, 1) + " мм · F " + trim(f) + " мм · модель, не замер";
  }

  function drawSvg(w, h, ic, icType, cls) {
    const W = 320, H = 200, pad = 12;
    const spanX = Math.max(w, ic), spanY = Math.max(h, ic);
    const k = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
    const cx = W / 2, cy = H / 2, r = (ic / 2) * k;
    const rw = w * k, rh = h * k, rx = cx - rw / 2, ry = cy - rh / 2;
    const dash = icType !== "circle" ? ' stroke-dasharray="5 4"' : "";
    el.cSvg.setAttribute("viewBox", "0 0 " + W + " " + H);
    el.cSvg.innerHTML =
      '<defs><pattern id="covHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="6" class="cov-hatch-line"/></pattern>' +
      '<clipPath id="covClip"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath></defs>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="cov-circle"' + dash + "/>" +
      '<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" class="cov-rect-out" fill="url(#covHatch)"/>' +
      '<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" class="cov-rect-in" clip-path="url(#covClip)"/>' +
      '<rect x="' + rx + '" y="' + ry + '" width="' + rw + '" height="' + rh + '" class="cov-rect ' + cls + '"/>' +
      '<line x1="' + rx + '" y1="' + (ry + rh) + '" x2="' + (rx + rw) + '" y2="' + ry + '" class="cov-diag"/>' +
      '<text x="' + (cx + r * 0.71 + 3) + '" y="' + Math.max(12, cy - r * 0.71 - 3) + '" class="cov-txt">Ø ' + num(ic, 1) + "</text>" +
      '<text x="' + (rx + 4) + '" y="' + (ry + rh - 5) + '" class="cov-txt dim">' + num(w, 1) + " × " + num(h, 1) + "</text>";
  }

  function render() {
    el.view.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.view === state.view)));
    el.ref.hidden = state.view !== "ref";
    el.cov.hidden = state.view !== "cov";
    if (state.view === "ref") renderRef(); else renderCov();
    save();
  }

  // ── события ──
  el.view.addEventListener("click", (e) => { const b = e.target.closest(".seg-btn"); if (!b) return; state.view = b.dataset.view; render(); });
  el.sec.addEventListener("click", (e) => {
    const b = e.target.closest(".seg-btn"); if (!b) return;
    state.sec = b.dataset.sec; state.q = ""; el.search.value = ""; render();
  });
  el.search.addEventListener("input", () => { state.q = el.search.value; renderRef(); });
  el.list.addEventListener("toggle", (e) => {
    const d = e.target.closest && e.target.closest("details.lens-card"); if (!d) return;
    state.open[d.dataset.id] = d.open; save();
  }, true);
  el.list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cover]"); if (!b) return;
    const s = SERIES.find((x) => x.id === b.dataset.cover);
    state.series = s.id; state.idx = nearestIdx(s, state.focal); state.view = "cov"; render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  el.cSeries.addEventListener("change", () => { const s = SERIES.find((x) => x.id === el.cSeries.value); state.series = s.id; state.idx = nearestIdx(s, state.focal); render(); });
  el.cFocal.addEventListener("change", () => { state.idx = Number(el.cFocal.value); const r = currentSeries().lenses[state.idx]; state.focal = fMin(r[0]); render(); });
  el.cZoom.addEventListener("input", () => { state.focal = Number(el.cZoom.value); renderCov(); save(); });
  el.cCam.addEventListener("change", () => { state.cam = el.cCam.value; state.mode = 0; render(); });
  el.cMode.addEventListener("change", () => { state.mode = Number(el.cMode.value); render(); });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (state.view === "cov" && !el.cov.hidden) renderCov(); }, 150); });
  const tb = $("tabBtnOpt");
  if (tb) tb.addEventListener("click", () => setTimeout(() => { if (state.view === "cov") renderCov(); }, 0));

  // источники
  const keys = [];
  SERIES.forEach((s) => s.src.forEach((k) => { if (!keys.includes(k)) keys.push(k); }));
  el.sources.innerHTML = keys.map((k) => SOURCES[k]).filter(Boolean)
    .map((s) => '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener noreferrer">' + esc(s.t) + "</a></li>").join("");
  const nl = SERIES.reduce((a, s) => a + s.lenses.length, 0);
  el.date.textContent = "Данные собраны " + L.UPDATED.split("-").reverse().join(".") + " · " + SERIES.length + " линеек, " + nl + " объективов. Приоритет — сайты и спецификации производителей; вторичные источники помечены.";

  const q = new URLSearchParams(location.search);
  if (q.get("oview") === "cov" || q.get("oview") === "ref") state.view = q.get("oview");
  if (SECTIONS.some((s) => s.id === q.get("osec"))) state.sec = q.get("osec");
  if (q.get("oq")) { state.q = q.get("oq"); el.search.value = state.q; }
  if (q.get("oopen")) state.open[q.get("oopen")] = true;
  if (SERIES.some((s) => s.id === q.get("oseries"))) {
    state.series = q.get("oseries");
    const s = currentSeries();
    if (q.get("ofocal")) state.focal = Number(q.get("ofocal"));
    state.idx = q.get("oidx") != null ? Number(q.get("oidx")) : nearestIdx(s, state.focal);
  }
  if (CAMS.some((x) => x.c.id === q.get("ocam"))) { state.cam = q.get("ocam"); state.mode = Number(q.get("omode") || 0); }
  fillCovSelectors();
  render();
})();
