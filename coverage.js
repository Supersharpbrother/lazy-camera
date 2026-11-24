/* Lazy Camera — логика покрытия (общая для приложения и скрипта сверки).
   Приоритет: замер ARRI FLT (сетка освещённости по LF Open Gate, выведенная из изображений ARRI) → данные производителя. */
(function (root) {
  "use strict";
  const GW = 36.70, GH = 25.54, NX = 37, NY = 26;
  const LF_OG_DIAG = Math.hypot(GW, GH);
  const OK_EV = -3, NO_EV = -5; // калибровка по ARRI ALEXA LF FAQ (MP ≥ 35, UP ≥ 20, UWZ ≥ 10 покрывают LF 16:9)
  const ALPH = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
  const cache = new Map();
  function decode(g) {
    let a = cache.get(g);
    // храним в кодовых значениях (доля от центра): 2^(EV/2.2)
    if (!a) { a = new Float32Array(g.length); for (let i = 0; i < g.length; i++) { const k = ALPH.indexOf(g[i]); a[i] = Math.pow(2, (k <= 40 ? -0.1 * k : -4 - 0.35 * (k - 40)) / 2.2); } cache.set(g, a); }
    return a;
  }
  // кодовое значение (доля от центра) в точке (x, y) мм от центра кадра; вне LF OG — значение на границе
  function codeXY(g, x, y) {
    const a = decode(g);
    const fx = Math.min(NX - 1, Math.max(0, (x + GW / 2) / GW * (NX - 1)));
    const fy = Math.min(NY - 1, Math.max(0, (y + GH / 2) / GH * (NY - 1)));
    const i = Math.min(NX - 2, Math.floor(fx)), j = Math.min(NY - 2, Math.floor(fy));
    const tx = fx - i, ty = fy - j;
    const v = (ii, jj) => a[jj * NX + ii];
    return (v(i, j) * (1 - tx) + v(i + 1, j) * tx) * (1 - ty) + (v(i, j + 1) * (1 - tx) + v(i + 1, j + 1) * tx) * ty;
  }
  function evXY(g, x, y) { return Math.max(-12, 2.2 * Math.log2(Math.max(codeXY(g, x, y), 1e-4))); }
  // свет в углах кадра w×h: среднее четырёх углов (в кодовых значениях, как у ARRI-изображения), → EV
  function cornerEV(g, w, h) {
    let s = 0;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { s += codeXY(g, sx * w / 2, sy * h / 2); });
    return 2.2 * Math.log2(Math.max(s / 4, 1e-4));
  }
  function fltSamples(lens, f) {
    const a = lens[5] && lens[5].flt;
    if (!a || !a.length) return [];
    if (a.length === 1) return a;
    const ex = a.find((x) => Math.abs(x.f - f) < 1e-6);
    if (ex) return [ex];
    let lo = null, hi = null;
    a.forEach((x) => { if (x.f <= f && (!lo || x.f > lo.f)) lo = x; if (x.f >= f && (!hi || x.f < hi.f)) hi = x; });
    return [lo, hi].filter(Boolean);
  }
  function classify(ev) { return ev > OK_EV ? "ok" : ev > NO_EV ? "edge" : "no"; }

  function assess(s, lens, f, w, h, opt) {
    opt = opt || {};
    const d = Math.hypot(w, h);
    const o = lens[5] || {};
    const ic = o.ic || s.ic;
    const samples = opt.ignoreFlt ? [] : fltSamples(lens, f);
    if (samples.length) {
      const fits = w <= GW + 0.02 && h <= GH + 0.02;
      let worst = null;
      samples.forEach((x) => {
        const ev = cornerEV(x.g, Math.min(w, GW), Math.min(h, GH));
        const evm = x.gm ? cornerEV(x.gm, Math.min(w, GW), Math.min(h, GH)) : null;
        if (!worst || ev < worst.ev) worst = { x, ev, evm };
      });
      const fNote = samples.length > 1 || samples[0].f !== f ? " (замер на " + worst.x.f + " мм)" : "";
      if (fits) return { basis: "flt", cls: classify(worst.ev), ev: worst.ev, evMod: worst.evm, sample: worst.x, ic, d, fNote };
      // кадр выходит за LF Open Gate: если уже на границе LF OG темно — виньетирует, иначе данных нет
      if (classify(worst.ev) === "no") return { basis: "flt", cls: "no", ev: null, evMod: null, sample: worst.x, ic, d, fNote, beyond: true };
      const r = declared(s, ic, d);
      r.fltBeyond = true; r.sample = worst.x;
      return r;
    }
    return declared(s, ic, d);
  }
  function declared(s, ic, d) {
    const ratio = d / ic;
    let cls, kind;
    if (s.icType === "circle") {
      if (ratio <= 0.98) { cls = "ok"; kind = "in"; }
      else if (ratio <= 1.03) { cls = "edge"; kind = "border"; }
      else if (ratio <= 1.2) { cls = "edge"; kind = "beyond"; }
      else { cls = "no"; kind = "far"; }
    } else {
      if (ratio <= 1.0005) { cls = "ok"; kind = "in"; }
      else if (ratio <= 1.2) { cls = "edge"; kind = "beyond"; }
      else { cls = "no"; kind = "far"; }
    }
    return { basis: "declared", cls, kind, ratio, ic, d };
  }
  root.LC_COVER = { assess, evXY, codeXY, cornerEV, fltSamples, classify, LF_OG_DIAG, GW, GH, OK_EV, NO_EV };
})(typeof window !== "undefined" ? window : globalThis);
