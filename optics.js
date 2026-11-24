/* Lazy Camera — вкладка «Оптика»: справочник по линейкам объективов и покрытие сенсора */
(function () {
  "use strict";
  const L = window.LC_LENSES;
  const C = window.LC_DATA;
  if (!L || !C) return;
  const { SERIES, SECTIONS, SOURCES } = L;
  const CAMS = C.CAMERAS.map((c) => ({ c, modes: c.modes.filter((m) => m.mm && !m.generic) })).filter((x) => x.modes.length);

  const KEY = "lazy-camera-optics-v1";
  const $ = (id) => document.getElementById(id);
  const el = {
    view: $("optView"), sec: $("optSec"), secNote: $("optSecNote"), list: $("optSeries"),
    ref: $("optRef"), cov: $("optCov"),
    cSeries: $("covSeries"), cFocal: $("covFocal"), cCam: $("covCam"), cMode: $("covMode"),
    cSvg: $("covSvg"), cVerdict: $("covVerdict"), cMetrics: $("covMetrics"), cNote: $("covNote"),
    sources: $("optSources"), date: $("optDate")
  };

  const state = { view: "ref", sec: "s35", open: {}, series: "arri-sig", focal: 35, cam: "alexa-35", mode: 0 };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  if (!SECTIONS.some((s) => s.id === state.sec)) state.sec = "s35";
  if (!SERIES.some((s) => s.id === state.series)) state.series = "arri-sig";
  if (!CAMS.some((x) => x.c.id === state.cam)) state.cam = "alexa-35";
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const num = (x, d) => {
    if (x == null) return "н/д";
    const r = d == null ? String(x) : Number(x).toFixed(d);
    return r.replace(".", ",");
  };
  const trim = (x) => (x == null ? "н/д" : String(Math.round(x * 1000) / 1000).replace(".", ","));
  const sqLabel = (q) => String(q).replace(".", ",") + "×";

  // ── справочник ──
  function seriesMeta(s) {
    const fl = s.lenses.map((r) => r[0]);
    const parts = [];
    parts.push((s.icType === "format" ? "формат Ø " : "пятно Ø ") + trim(Math.round(s.ic * 100) / 100) + " мм");
    if (s.sq) parts.push("анаморфот " + sqLabel(s.sq));
    parts.push(s.mount);
    parts.push(fl.length + " шт · " + trim(Math.min(...fl)) + "–" + trim(Math.max(...fl)) + " мм");
    return parts.join(" · ");
  }
  function renderRef() {
    el.sec.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.sec === state.sec)));
    const sec = SECTIONS.find((s) => s.id === state.sec);
    const list = SERIES.filter((s) => s.sec === state.sec);
    el.secNote.textContent = sec.title + " · " + list.length + (list.length === 1 ? " линейка" : list.length < 5 ? " линейки" : " линеек");
    el.list.innerHTML = list.map((s) => {
      const open = state.open[s.id] != null ? state.open[s.id] : false;
      let h = '<details class="card lens-card" data-id="' + s.id + '"' + (open ? " open" : "") + ">";
      h += '<summary><span class="lens-head"><span class="mode-name">' + esc(s.name) + '</span><span class="lens-brand">' + esc(s.brand) + "</span></span>" +
        '<span class="lens-meta">' + esc(seriesMeta(s)) + "</span></summary>";
      h += '<div class="lens-body">';
      h += '<div class="lens-table" role="table"><div class="lt-row lt-head" role="row">' +
        '<span role="columnheader">F, мм</span><span role="columnheader">T</span><span role="columnheader">МДФ, м</span>' +
        '<span role="columnheader">Ø, мм</span><span role="columnheader">кг</span></div>';
      s.lenses.forEach((r) => {
        const o = r[5] || {};
        h += '<div class="lt-row" role="row"><span class="lt-f">' + trim(r[0]) + (o.note ? "<small>" + esc(o.note) + "</small>" : "") + "</span>" +
          "<span>" + num(r[1]) + "</span><span>" + trim(r[2]) + "</span><span>" + (r[3] == null ? "н/д" : r[3]) + "</span><span>" + trim(r[4]) + "</span></div>";
      });
      h += "</div>";
      const notes = [s.icNote];
      if (!s.mod) notes.push("МДФ: производитель не уточняет точку отсчёта.");
      (s.notes || []).forEach((n) => notes.push(n));
      h += '<ul class="lens-notes">' + notes.map((n) => "<li>" + esc(n) + "</li>").join("") + "</ul>";
      h += '<div class="lens-actions"><button type="button" class="text-btn wide" data-cover="' + s.id + '">Покрытие на камере →</button></div>';
      h += "</div></details>";
      return h;
    }).join("");
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

  function renderCov() {
    const s = currentSeries();
    el.cSeries.value = s.id;
    if (!s.lenses.some((r) => r[0] === state.focal)) {
      const near = s.lenses.reduce((a, r) => (Math.abs(r[0] - state.focal) < Math.abs(a[0] - state.focal) ? r : a), s.lenses[0]);
      state.focal = near[0];
    }
    el.cFocal.innerHTML = s.lenses.map((r) => '<option value="' + r[0] + '">' + trim(r[0]) + " мм · T" + num(r[1]) + ((r[5] && r[5].note) ? " · " + esc(r[5].note) : "") + "</option>").join("");
    el.cFocal.value = String(state.focal);
    const lens = s.lenses.find((r) => r[0] === state.focal);
    const ic = (lens[5] && lens[5].ic) || s.ic;

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

    // вердикт
    let cls, title, text;
    if (s.icType === "format") {
      if (ratio <= 1.0005) { cls = "ok"; title = "Покрывает"; text = "Кадр в пределах формата, который заявляет производитель."; }
      else { cls = "edge"; title = "Вне заявленного"; text = "Кадр больше формата, на который производитель гарантирует покрытие (на " + num((ratio - 1) * 100, 0) + "% по диагонали). Диаметр круга не опубликован — нужен тест."; }
    } else if (ratio <= 0.98) { cls = "ok"; title = "Покрывает"; text = "Запас по диагонали " + num((1 / ratio - 1) * 100, 0) + "%."; }
    else if (ratio <= 1.03) { cls = "edge"; title = "Погранично"; text = "Углы кадра на краю пятна: возможны падение резкости и затемнение в углах. Проверьте тестом."; }
    else { cls = "no"; title = "Виньетирует"; text = "Диагональ кадра больше пятна на " + num((ratio - 1) * 100, 0) + "%: тёмные углы."; }
    el.cVerdict.className = "cov-verdict " + cls;
    el.cVerdict.innerHTML = '<span class="cov-title">' + esc(title) + "</span><span>" + esc(text) + "</span>";

    // метрики
    const rows = [];
    rows.push(["Кадр", num(w, 2) + " × " + num(h, 2) + " мм" + (m.calc ? "*" : "")]);
    rows.push(["Диагональ кадра", num(diag, 2) + " мм"]);
    rows.push([s.icType === "format" ? "Заявленный формат" : "Пятно объектива", "Ø " + num(ic, 2) + " мм"]);
    const sq = s.sq || 1;
    const hfov = 2 * Math.atan((w * sq) / (2 * state.focal)) * 180 / Math.PI;
    const vfov = 2 * Math.atan(h / (2 * state.focal)) * 180 / Math.PI;
    rows.push(["Угол обзора (расчёт)", "H " + num(hfov, 1) + "° · V " + num(vfov, 1) + "°"]);
    if (s.sq) {
      const A = (w / h) * s.sq;
      rows.push(["После де-сквиза " + sqLabel(s.sq), num(A, 2) + ":1"]);
    }
    rows.push(["Объектив", "T" + num(lens[1]) + " · МДФ " + trim(lens[2]) + " м"]);
    rows.push(["Ø передней части · вес", (lens[3] == null ? "н/д" : lens[3] + " мм") + " · " + trim(lens[4]) + " кг"]);
    el.cMetrics.innerHTML = rows.map((r) => '<div class="cov-row"><span>' + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></div>").join("");
    const notes = [s.icNote];
    if (s.sq) notes.push("Анаморфот сжимает картинку по горизонтали, но пятно на сенсоре — круг того же размера: покрытие считаем по физическому кадру.");
    if (m.calc) notes.push("* мм кадра посчитаны из пикселей и шага пикселя производителя камеры.");
    notes.push("Сравнение по диагонали — упрощение: реальная граница пятна зависит от диафрагмы и дистанции фокусировки.");
    el.cNote.innerHTML = notes.map((n) => "<li>" + esc(n) + "</li>").join("");

    drawSvg(w, h, ic, s.icType, cls);
  }

  function drawSvg(w, h, ic, icType, cls) {
    const W = 320, H = 230, pad = 14;
    const spanX = Math.max(w, ic), spanY = Math.max(h, ic);
    const k = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
    const cx = W / 2, cy = H / 2, r = (ic / 2) * k;
    const rw = w * k, rh = h * k, rx = cx - rw / 2, ry = cy - rh / 2;
    const dash = icType === "format" ? ' stroke-dasharray="5 4"' : "";
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
      '<line x1="' + (cx - 5) + '" y1="' + cy + '" x2="' + (cx + 5) + '" y2="' + cy + '" class="cov-cross"/>' +
      '<line x1="' + cx + '" y1="' + (cy - 5) + '" x2="' + cx + '" y2="' + (cy + 5) + '" class="cov-cross"/>' +
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
  el.sec.addEventListener("click", (e) => { const b = e.target.closest(".seg-btn"); if (!b) return; state.sec = b.dataset.sec; render(); });
  el.list.addEventListener("toggle", (e) => {
    const d = e.target.closest && e.target.closest("details.lens-card"); if (!d) return;
    state.open[d.dataset.id] = d.open; save();
  }, true);
  el.list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cover]"); if (!b) return;
    state.series = b.dataset.cover; state.view = "cov"; render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  el.cSeries.addEventListener("change", () => { state.series = el.cSeries.value; render(); });
  el.cFocal.addEventListener("change", () => { state.focal = Number(el.cFocal.value); render(); });
  el.cCam.addEventListener("change", () => { state.cam = el.cCam.value; state.mode = 0; render(); });
  el.cMode.addEventListener("change", () => { state.mode = Number(el.cMode.value); render(); });

  // источники
  const keys = [];
  SERIES.forEach((s) => s.src.forEach((k) => { if (!keys.includes(k)) keys.push(k); }));
  el.sources.innerHTML = keys.map((k) => SOURCES[k]).filter(Boolean)
    .map((s) => '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener noreferrer">' + esc(s.t) + "</a></li>").join("");
  el.date.textContent = "Данные собраны " + L.UPDATED.split("-").reverse().join(".") + " по сайтам и спецификациям производителей.";

  const q = new URLSearchParams(location.search);
  if (q.get("oview") === "cov" || q.get("oview") === "ref") state.view = q.get("oview");
  if (SECTIONS.some((s) => s.id === q.get("osec"))) state.sec = q.get("osec");
  if (q.get("oopen")) state.open[q.get("oopen")] = true;
  if (SERIES.some((s) => s.id === q.get("oseries"))) state.series = q.get("oseries");
  if (q.get("ofocal")) state.focal = Number(q.get("ofocal"));
  if (CAMS.some((x) => x.c.id === q.get("ocam"))) { state.cam = q.get("ocam"); state.mode = Number(q.get("omode") || 0); }
  fillCovSelectors();
  render();
})();
