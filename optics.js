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
    const VER = ["? 1 источник", "✓ частично", "✓✓ 2 источника"];
    if (s.ver) tags.push(VER[s.ver.s]);
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
    if (s.ver) {
      const FN = { focal: "фокусные", T: "T", mod: "МДФ", dia: "Ø", kg: "вес", ic: "пятно" };
      notes.push(s.ver.s === 2 ? "Проверка: все данные подтверждены минимум двумя независимыми источниками."
        : "Проверка: без второго источника — " + s.ver.w.map((f) => FN[f] || f).join(", ") + "." +
          (s.ver.ok.length ? " Двумя источниками подтверждено: " + s.ver.ok.map((f) => FN[f] || f).join(", ") + "." : ""));
    }
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
      SERIES.filter((s) => s.sec === sec.id).map((s) => '<option value="' + s.id + '">' + esc(s.brand.split(/[\s/]+/).some((w) => w.length > 2 && s.name.startsWith(w)) ? s.name : s.brand + " " + s.name) + "</option>").join("") +
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
    const A = window.LC_COVER.assess(s, lens, f, w, h);
    const ev = (x) => (x == null ? "н/д" : x <= -11.5 ? "темно (≤ −11 EV)" : "≈ " + num(x, 1).replace("-", "−") + " EV");

    // вердикт
    let title, text;
    const cls = A.cls;
    if (A.basis === "flt") {
      const sm = A.sample;
      title = cls === "ok" ? "Покрывает" : cls === "edge" ? "Погранично" : "Виньетирует";
      if (A.ev != null) {
        text = "Замер ARRI FLT" + A.fNote + ", T" + num(sm.T) + ", бесконечность: свет в углу кадра " + ev(A.ev) + ".";
        if (A.evMod != null && LCC.classify(A.evMod) !== cls) text += " На МДФ: " + ev(A.evMod) + (LCC.classify(A.evMod) === "ok" ? " — покрывает." : LCC.classify(A.evMod) === "no" ? " — виньетирует." : " — погранично.");
      } else text = "Замер ARRI FLT" + A.fNote + ": уже на границе LF Open Gate темно, а кадр ещё больше.";
    } else {
      const what = s.icType === "circle" ? "заявленного пятна" : s.icType === "format" ? "заявленного формата" : "ориентира по формату";
      if (A.kind === "in") { title = s.icType === "nominal" ? "Вероятно покрывает" : "Покрывает"; text = s.icType === "circle" ? "Запас по диагонали " + num((1 / A.ratio - 1) * 100, 0) + "%." : "Кадр в пределах " + what + "."; }
      else if (A.kind === "border") { title = "Погранично"; text = "Углы кадра на краю заявленного пятна. Реальная зона света обычно шире — проверьте тестом."; }
      else if (A.kind === "beyond") { title = "Вне " + what.replace("заявленного ", "заявленного\u00a0"); text = "Кадр больше " + what + " на " + num((A.ratio - 1) * 100, 0) + "% по диагонали. Замера нет — реальная зона света может быть шире: нужен тест."; }
      else { title = "Скорее всего виньетирует"; text = "Кадр больше " + what + " на " + num((A.ratio - 1) * 100, 0) + "% по диагонали. Замера нет — нужен тест."; }
      if (A.fltBeyond) text += " ARRI FLT: весь LF Open Gate освещён, но кадр больше LF Open Gate — дальше замера нет.";
    }
    el.cVerdict.className = "cov-verdict " + cls;
    el.cVerdict.innerHTML = '<span class="cov-title">' + esc(title) + "</span><span>" + esc(text) + "</span>";

    // метрики
    const rows = [];
    rows.push(["Кадр", num(w, 2) + " × " + num(h, 2) + " мм" + (m.calc ? "*" : "")]);
    rows.push(["Диагональ кадра", num(diag, 2) + " мм"]);
    rows.push([s.icType === "circle" ? "Пятно (производитель)" : s.icType === "format" ? "Заявленный формат" : "Ориентир (не данные производителя)", "Ø " + num(ic, 2) + " мм"]);
    if (A.basis === "flt" || A.fltBeyond) {
      const sm = A.sample;
      const edge = (e) => (e == null ? "н/д" : e ? "Ø ≈ " + num(e, 1) + " мм" : "≥ Ø " + num(LCC.LF_OG_DIAG, 1) + " мм");
      rows.push(["Зона света, замер ARRI (∞ / МДФ)", edge(sm.e[0]) + " / " + edge(sm.e[1])]);
    }
    if (A.basis === "flt" && A.ev != null) rows.push(["Свет в углу кадра (замер ARRI)", ev(A.ev)]);
    else if (A.basis !== "flt") rows.push(["Свет в углу кадра (модель)", A.kind === "in" || A.kind === "border" ? ev(Math.log2(cos4(diag / 2, f))) : "н/д — вне данных"]);
    const sq = s.sq || 1;
    const hfov = 2 * Math.atan((w * sq) / (2 * f)) * 180 / Math.PI;
    const vfov = 2 * Math.atan(h / (2 * f)) * 180 / Math.PI;
    rows.push(["Угол обзора" + (isZoom ? " на " + trim(f) + " мм" : "") + " (расчёт)", "H " + num(hfov, 1) + "° · V " + num(vfov, 1) + "°"]);
    if (s.sq) rows.push(["После де-сквиза " + sqLabel(s.sq), num((w / h) * s.sq, 2) + ":1"]);
    rows.push(["Объектив", "T" + num(lens[1]) + " · МДФ " + trim(lens[2]) + " м"]);
    rows.push(["Ø передней части · вес", (lens[3] == null ? "н/д" : trim(lens[3]) + " мм") + " · " + trim(lens[4]) + " кг"]);
    el.cMetrics.innerHTML = rows.map((r) => '<div class="cov-row"><span>' + esc(r[0]) + "</span><b>" + esc(r[1]) + "</b></div>").join("");
    const notes = [s.icNote];
    if (A.basis === "flt") notes.push("Картинка построена по замеру ARRI Lens Illumination Guide (ALEXA LF, открытая диафрагма, бесконечность): числа освещённости выведены нами из изображений ARRI (≈, гамма 2,2), картинки ARRI не загружаются. Критерий: > −3 EV в углу — покрывает, −3…−5 — погранично, < −5 — виньетирует (сверено с ALEXA LF FAQ ARRI).");
    else notes.push("Картинка — модель, не замер: внутри заявленного пятна — естественный спад cos⁴; за его пределами (штриховка) данных нет — заявленный диаметр означает гарантированное покрытие, реальная зона света обычно шире.");
    if (s.sq) notes.push("Анаморфот сжимает картинку по горизонтали, но пятно на сенсоре — круг: покрытие считаем по физическому кадру.");
    if (isZoom && A.basis !== "flt") notes.push("У зумов производитель публикует одно пятно на весь диапазон; на краях диапазона реальное покрытие может отличаться.");
    if (m.calc) notes.push("* мм кадра посчитаны из пикселей и шага пикселя производителя камеры.");
    el.cNote.innerHTML = notes.map((n) => "<li>" + esc(n) + "</li>").join("");

    const view = { w, h, f, s, A, ic };
    lastView = view;
    drawCanvas(view);
    const icDraw = A.basis === "flt" ? (A.sample.e[0] || LCC.LF_OG_DIAG) : ic;
    drawSvg(w, h, icDraw, A.basis === "flt" ? (A.sample.e[0] ? "circle" : "format") : s.icType, cls);
  }

  // ── картинка освещённости ──
  const LCC = window.LC_COVER;
  let lastView = null;
  function cos4(r, f) { const c = f / Math.hypot(f, r); return c * c * c * c; }
  function drawCanvas(v) {
    const { w, h, f, A, ic, s } = v;
    const cv = el.cCanvas;
    const cssW = Math.round(cv.parentElement.getBoundingClientRect().width) || 320;
    const aspect = Math.min(3, Math.max(0.6, w / h));
    const cssH = Math.round(cssW / aspect);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cssW * dpr), H = Math.round(cssH * dpr);
    cv.width = W; cv.height = H; cv.style.height = cssH + "px";
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const img = ctx.createImageData(W, H);
    const kx = w / W, ky = h / H;
    const R = ic / 2;
    const flt = A.basis === "flt" ? A.sample : null;
    const rMax = Math.hypot(w, h) / 2, step = rMax / 1023;
    const lut = new Float32Array(1024); // модель без замера: освещённость по радиусу
    for (let i = 0; i < 1024; i++) { const r = i * step; lut[i] = cos4(r, f) * (r <= R ? 1 : 0.42); }
    const d = img.data;
    for (let y = 0; y < H; y++) {
      const my = (y + 0.5 - H / 2) * ky;
      for (let x = 0; x < W; x++) {
        const mx = (x + 0.5 - W / 2) * kx;
        const val = flt ? Math.min(1, LCC.codeXY(flt.g, mx, my)) * 212 + ((x * 7 + y * 13) % 5 - 2) * 0.6 : Math.pow(lut[Math.min(1023, Math.round(Math.hypot(mx, my) / step))], 1 / 2.2) * 212;
        const i = (y * W + x) * 4;
        d[i] = val; d[i + 1] = val * 0.97; d[i + 2] = val * 0.92; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const fg = (css.getPropertyValue("--fg") || "#ffb000").trim() || "#ffb000";
    const sc = W / w;
    ctx.save();
    if (!flt && R < rMax) {
      // штриховка: за заявленным пятном данных нет
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, R * sc, 0, Math.PI * 2, true); ctx.clip("evenodd");
      ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      for (let t = -H; t < W + H; t += 9 * dpr) { ctx.moveTo(t, 0); ctx.lineTo(t + H, H); }
      ctx.stroke();
      ctx.restore();
    }
    ctx.lineWidth = 1.4 * dpr;
    ctx.strokeStyle = fg;
    if (!flt) {
      ctx.setLineDash(s.icType === "circle" ? [] : [6 * dpr, 5 * dpr]);
      ctx.beginPath(); ctx.arc(W / 2, H / 2, R * sc, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(dpr, dpr, W - 2 * dpr, H - 2 * dpr);
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath(); ctx.moveTo(W / 2 - 7 * dpr, H / 2); ctx.lineTo(W / 2 + 7 * dpr, H / 2); ctx.moveTo(W / 2, H / 2 - 7 * dpr); ctx.lineTo(W / 2, H / 2 + 7 * dpr); ctx.stroke();
    ctx.font = (10 * dpr) + "px 'IBM Plex Mono', monospace";
    const label = flt ? "РАСЧЁТ ПО ЗАМЕРУ ARRI" : "РАСЧЁТ";
    const tw = ctx.measureText(label).width; ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillRect(4 * dpr, 4 * dpr, tw + 10 * dpr, 15 * dpr);
    ctx.fillStyle = "#ffb000"; ctx.fillText(label, 9 * dpr, 15 * dpr);
    ctx.restore();
    cv.dataset.sig = [s.id, f, w, h].join("|");
    el.cCanvasCap.textContent = "Кадр " + num(w, 1) + " × " + num(h, 1) + " мм · F " + trim(f) + " мм · " +
      (flt ? "зона света по замеру ARRI FLT" + (flt.e[0] ? " Ø ≈ " + num(flt.e[0], 1) + " мм" : " ≥ LF Open Gate") + (flt.f !== f ? " (замер на " + flt.f + " мм)" : "")
           : (s.icType === "circle" ? "пятно" : s.icType === "format" ? "формат" : "ориентир") + " Ø " + num(ic, 1) + " мм · модель, не замер");
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
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (state.view === "cov" && !el.cov.hidden && lastView) drawCanvas(lastView); }, 150); });
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
