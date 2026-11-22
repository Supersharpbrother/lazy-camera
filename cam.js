/* Lazy Camera — вкладки и справочник по камерам */
(function () {
  "use strict";
  const DATA = window.LC_DATA;
  if (!DATA) return;
  const { CAMERAS, SOURCES } = DATA;

  const KEY = "lazy-camera-cam-v1";
  const SQUEEZES = [2, 1.8, 1.65, 1.6, 1.5, 1.3, 1.25];
  const FPS_PRESETS = [24, 25, 30, 48, 50, 60, 100, 120, 240];
  const FAM_ORDER = ["ARRIRAW", "ARRICORE", "R3D", "X-OCN", "BRAW", "RAW out", "ProRes", "XAVC", "DNx"];
  const FAM_LABEL = { "R3D": "R3D", "RAW out": "RAW-выход", "DNx": "DNx" };

  const $ = (id) => document.getElementById(id);
  const el = {
    cam: $("camSelect"), meta: $("camMeta"), seg: $("opticsSeg"), sqWrap: $("sqWrap"), sqChips: $("sqChips"),
    fps: $("fpsInput"), fpsChips: $("fpsChips"), famChips: $("famChips"), summary: $("camSummary"),
    showAll: $("showAllBtn"), modes: $("camModes"), notes: $("camNotes"), sources: $("camSources"),
    dataDate: $("dataDate"), tabCam: $("tabCam"), tabDof: $("tabDof")
  };

  const state = { tab: "cam", cam: "alexa-35", optics: "sph", sq: 2, fps: 24, fam: "all", all: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (_) {}
  if (!CAMERAS.some((c) => c.id === state.cam)) state.cam = "alexa-35";
  if (!SQUEEZES.includes(state.sq)) state.sq = 2;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

  // ── formatting ──
  const nf = (x, d) => Number(x).toFixed(d).replace(".", ",");
  const fmtNum = (x) => (Math.round(x * 100) / 100).toString().replace(".", ",");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sqLabel = (q) => fmtNum(q) + "×";
  function aspectOf(m) {
    if (m.px) return m.px[0] / m.px[1];
    if (m.mm) return m.mm[0] / m.mm[1];
    return null;
  }

  // ── tabs ──
  function setTab(tab) {
    state.tab = tab === "dof" ? "dof" : "cam";
    document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === state.tab)));
    el.tabCam.hidden = state.tab !== "cam";
    el.tabDof.hidden = state.tab !== "dof";
    if (state.tab === "dof") {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        if (window.syncApertureScale) window.syncApertureScale();
      });
    }
    save();
  }
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));

  // ── controls ──
  function fillCameras() {
    const brands = [];
    CAMERAS.forEach((c) => { if (!brands.includes(c.brand)) brands.push(c.brand); });
    el.cam.innerHTML = brands.map((b) =>
      '<optgroup label="' + esc(b) + '">' +
      CAMERAS.filter((c) => c.brand === b).map((c) => '<option value="' + c.id + '">' + esc(b + " " + c.name) + "</option>").join("") +
      "</optgroup>").join("");
  }
  function chip(label, value, pressed, attr) {
    return '<button type="button" class="chip" ' + attr + '="' + value + '" aria-pressed="' + pressed + '">' + esc(label) + "</button>";
  }
  function renderChips(cam) {
    el.sqChips.innerHTML = SQUEEZES.map((q) => chip(sqLabel(q), q, q === state.sq, "data-sq")).join("");
    el.fpsChips.innerHTML = FPS_PRESETS.map((f) => chip(String(f), f, f === state.fps, "data-fps")).join("");
    const fams = [];
    cam.modes.forEach((m) => m.rec.forEach((r) => { if (!fams.includes(r.f)) fams.push(r.f); }));
    fams.sort((a, b) => FAM_ORDER.indexOf(a) - FAM_ORDER.indexOf(b));
    if (state.fam !== "all" && !fams.includes(state.fam)) state.fam = "all";
    el.famChips.innerHTML = chip("Все", "all", state.fam === "all", "data-fam") +
      fams.map((f) => chip(FAM_LABEL[f] || f, f, state.fam === f, "data-fam")).join("");
    el.seg.querySelectorAll(".seg-btn").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.optics === state.optics)));
    el.sqWrap.hidden = state.optics !== "ana";
    el.showAll.setAttribute("aria-pressed", String(state.all));
  }

  // ── logic ──
  function rowStatus(r, fps) {
    if (r.fps == null) return "unk";
    return r.fps + 1e-9 >= fps ? "ok" : "no";
  }
  function anaInfo(m, q) {
    const ar = aspectOf(m);
    if (!ar) return null;
    const A = ar * q;
    const dsq = Array.isArray(m.dsq) && m.dsq.includes(q);
    const usable = dsq || (A >= 1.75 && A <= 3.0);
    return { A, dsq, usable };
  }
  function visibleInOptics(m) {
    if (m.generic) return true;
    if (state.optics === "sph") return m.sph !== false;
    const info = anaInfo(m, state.sq);
    return info ? info.usable : true;
  }

  function render() {
    const cam = CAMERAS.find((c) => c.id === state.cam) || CAMERAS[0];
    el.cam.value = cam.id;
    renderChips(cam);
    const fps = state.fps;
    el.meta.textContent = cam.sensor + " · " + cam.size + (cam.pitch ? " · шаг " + String(cam.pitch).replace(".", ",") + " мкм" : "");

    const items = [];
    cam.modes.forEach((m, idx) => {
      if (!visibleInOptics(m)) return;
      const rows = m.rec.filter((r) => state.fam === "all" || r.f === state.fam);
      if (!rows.length) return;
      const st = rows.map((r) => rowStatus(r, fps));
      const fit = st.includes("ok") ? 2 : (st.includes("unk") ? 1 : 0);
      items.push({ m, idx, rows, st, fit });
    });
    const real = items.filter((it) => !it.m.generic);
    const fitting = real.filter((it) => it.fit === 2).length;
    const shown = items.filter((it) => state.all || it.fit > 0);
    shown.sort((a, b) => ((a.m.generic ? 1 : 0) - (b.m.generic ? 1 : 0)) || (b.fit - a.fit) || (a.idx - b.idx));

    const optLabel = state.optics === "ana" ? "анаморфот " + sqLabel(state.sq) : "сферика";
    el.summary.textContent = fitting + " из " + real.length + " режимов · " + fmtNum(fps) + " fps · " + optLabel;

    if (!shown.length) {
      el.modes.innerHTML = '<div class="card empty-note">Ни один режим не даёт ' + esc(fmtNum(fps)) + " fps" +
        (state.fam !== "all" ? " в " + esc(FAM_LABEL[state.fam] || state.fam) : "") + ". Нажмите «Все режимы», чтобы увидеть максимумы.</div>";
    } else {
      el.modes.innerHTML = shown.map(renderMode).join("");
    }

    el.notes.innerHTML = (cam.notes || []).map((n) => "<li>" + esc(n) + "</li>").join("") || "<li>—</li>";
    el.sources.innerHTML = cam.src.map((k) => SOURCES[k]).filter(Boolean)
      .map((s) => '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener noreferrer">' + esc(s.t) + "</a></li>").join("");
    el.dataDate.textContent = "Данные собраны " + DATA.UPDATED.split("-").reverse().join(".") + ". Перед съёмкой сверяйтесь с прошивкой и носителем.";
    save();
  }

  function renderMode(it) {
    const { m, rows, st, fit } = it;
    const badges = [];
    if (m.ana) badges.push("ANA");
    if (state.optics === "ana" && Array.isArray(m.dsq) && m.dsq.includes(state.sq)) badges.push("DSQ " + sqLabel(state.sq));
    if (m.lic) badges.push("LIC");
    let meta = [];
    if (m.mm) {
      const diag = Math.hypot(m.mm[0], m.mm[1]);
      meta.push(nf(m.mm[0], 2) + " × " + nf(m.mm[1], 2) + " мм" + (m.calc ? "*" : "") + " · Ø " + nf(diag, 1));
    }
    if (m.px) meta.push(m.px[0] + " × " + m.px[1] + " px");
    const ar = aspectOf(m);
    if (ar && !m.generic) meta.push(nf(ar, 2) + ":1");
    let html = '<article class="card mode-card' + (fit === 0 ? " miss" : "") + '">';
    html += '<div class="mode-head"><span class="mode-name">' + esc(m.name) + "</span>" +
      (badges.length ? '<span class="badges">' + badges.map((b) => '<span class="badge">' + esc(b) + "</span>").join("") + "</span>" : "") + "</div>";
    if (meta.length) html += '<div class="mode-meta">' + meta.map(esc).join(" · ") + "</div>";
    if (state.optics === "ana" && !m.generic) {
      const info = anaInfo(m, state.sq);
      if (info) {
        let t = "После де-сквиза " + sqLabel(state.sq) + ": " + nf(info.A, 2) + ":1";
        if (info.A > 2.41) t += " · под 2,39:1 — кроп по бокам (" + Math.round(2.39 / info.A * 100) + "% ширины)";
        else if (info.A < 2.37) t += " · под 2,39:1 — кроп сверху/снизу (" + Math.round(info.A / 2.39 * 100) + "% высоты)";
        else t += " · ровно под 2,39:1";
        html += '<div class="mode-ana">' + esc(t) + "</div>";
      }
    }
    const notes = [];
    if (m.lic) notes.push("Лицензия: " + m.lic);
    if (m.note) notes.push(m.note);
    if (notes.length) html += '<div class="mode-note">' + notes.map(esc).join(" · ") + "</div>";
    html += '<div class="rec">';
    rows.forEach((r, i) => {
      const s = st[i];
      let fpsTxt = r.fps == null ? "н/д" : "до " + r.fps;
      let sub = [];
      if (r.lo != null) sub.push("1TB: " + r.lo);
      const subR = [r.c];
      if (r.note) subR.push(r.note);
      html += '<div class="rec-row ' + s + '"><span class="rec-f">' + esc(FAM_LABEL[r.f] || r.f) + "</span>" +
        '<span class="rec-r">' + esc(r.r) + "<small>" + subR.map(esc).join(" · ") + "</small></span>" +
        '<span class="rec-fps">' + esc(fpsTxt) + (sub.length ? "<small>" + esc(sub.join(" · ")) + "</small>" : "") + "</span></div>";
    });
    html += "</div></article>";
    return html;
  }

  // ── events ──
  el.cam.addEventListener("change", () => { state.cam = el.cam.value; render(); });
  el.seg.addEventListener("click", (e) => {
    const b = e.target.closest(".seg-btn"); if (!b) return;
    state.optics = b.dataset.optics; render();
  });
  el.sqChips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.sq = Number(b.dataset.sq); render();
  });
  el.fpsChips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.fps = Number(b.dataset.fps); el.fps.value = String(state.fps); render();
  });
  el.fps.addEventListener("input", () => {
    const v = parseFloat(String(el.fps.value).replace(",", "."));
    if (Number.isFinite(v) && v > 0) { state.fps = v; render(); }
  });
  el.famChips.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.fam = b.dataset.fam; render();
  });
  el.showAll.addEventListener("click", () => { state.all = !state.all; render(); });

  fillCameras();
  el.fps.value = String(state.fps);
  setTab(new URLSearchParams(location.search).get("tab") || state.tab);
  const qOptics = new URLSearchParams(location.search).get("optics");
  if (qOptics === "ana" || qOptics === "sph") state.optics = qOptics;
  render();
})();
