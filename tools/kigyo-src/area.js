/* ===== 対応地域の選択（押すたびに ✓対応 → ✕除外 → なし） ===== */
const AREA_REG = [
  ["北海道", ["北海道"]],
  ["東北地区", ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"]],
  ["関東地区", ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"]],
  ["甲信越・北陸地区", ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県"]],
  ["東海地区", ["岐阜県", "静岡県", "愛知県", "三重県"]],
  ["関西地区", ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"]],
  ["中国地区", ["鳥取県", "島根県", "岡山県", "広島県", "山口県"]],
  ["四国地区", ["徳島県", "香川県", "愛媛県", "高知県"]],
  ["九州・沖縄地区", ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]]
];
const AREA_TOP = ["全国", "オンライン（Zoomなど）"];
function areaParse(str) {
  const o = { on: [], ex: [], free: "" };
  String(str || "").split("／").forEach(part => {
    const m = part.match(/^\s*(対応|除外|自由記載)：([\s\S]*)$/);
    if (!m) { if (part.trim()) o.free = (o.free ? o.free + " " : "") + part.trim(); return; }
    if (m[1] === "自由記載") o.free = m[2].trim();
    else o[m[1] === "対応" ? "on" : "ex"] = m[2].split("、").map(x => x.trim()).filter(Boolean);
  });
  return o;
}
function areaString(o) {
  return [o.on.length ? "対応：" + o.on.join("、") : "", o.ex.length ? "除外：" + o.ex.join("、") : "", o.free ? "自由記載：" + o.free.replace(/／/g, "/") : ""].filter(Boolean).join("／");
}
function areaPicker(box, value) {
  const st = {}; const o = areaParse(value);
  o.on.forEach(k => st[k] = 1); o.ex.forEach(k => st[k] = 2);
  const chip = k => `<button type="button" class="ar-chip" data-ar="${k}" aria-pressed="false">${k}</button>`;
  box.innerHTML = `<div class="ar-help">一度押すと <b class="ar-on-s">✓ 対応</b>、二度押すと <b class="ar-ex-s">✕ 除外</b>、三度押すと元に戻ります。</div>
    <div class="ar-row">${AREA_TOP.map(chip).join("")}</div>
    ${AREA_REG.map(([r, ps]) => `<div class="ar-reg"><div class="ar-row">${chip(r)}${ps.length > 1 ? `<button type="button" class="ar-more" aria-expanded="false">都道府県 ▾</button>` : ""}</div>${ps.length > 1 ? `<div class="ar-row ar-pref" hidden>${ps.map(chip).join("")}</div>` : ""}</div>`).join("")}
    <label class="ar-free">自由記載（市区町村・細かい条件など）<input type="text" class="ar-free-in" value="${String(o.free || "").replace(/"/g, "&quot;")}" placeholder="例：大阪市内は訪問可、その他はZoom"></label>
    <div class="ar-sum" aria-live="polite"></div>`;
  const paint = () => {
    box.querySelectorAll("[data-ar]").forEach(b => { const v = st[b.dataset.ar] || 0; b.className = "ar-chip" + (v === 1 ? " on" : v === 2 ? " ex" : ""); b.setAttribute("aria-pressed", v ? "true" : "false"); b.textContent = (v === 1 ? "✓ " : v === 2 ? "✕ " : "") + b.dataset.ar; });
    const v = areaGet(box); box.querySelector(".ar-sum").textContent = v ? "登録内容：" + v : "まだ選ばれていません";
  };
  box._st = st;
  box.querySelectorAll("[data-ar]").forEach(b => b.addEventListener("click", () => { const k = b.dataset.ar; st[k] = ((st[k] || 0) + 1) % 3; if (!st[k]) delete st[k]; paint(); }));
  box.querySelectorAll(".ar-more").forEach(b => b.addEventListener("click", () => { const p = b.closest(".ar-reg").querySelector(".ar-pref"); p.hidden = !p.hidden; b.setAttribute("aria-expanded", !p.hidden); b.textContent = p.hidden ? "都道府県 ▾" : "閉じる ▴"; }));
  // 選んだ都道府県がある地区は開いておく
  AREA_REG.forEach(([r, ps], i) => { if (ps.some(p => st[p])) { const m = box.querySelectorAll(".ar-reg")[i].querySelector(".ar-more"); if (m) m.click(); } });
  box.querySelector(".ar-free-in").addEventListener("input", paint);
  paint();
}
function areaGet(box) {
  const st = box._st || {}, order = AREA_TOP.concat(AREA_REG.flatMap(([r, ps]) => [r].concat(ps.length > 1 ? ps : [])));
  const o = { on: order.filter(k => st[k] === 1), ex: order.filter(k => st[k] === 2), free: (box.querySelector(".ar-free-in") || {}).value || "" };
  o.free = o.free.trim(); return areaString(o);
}
/** 文面に出てくる都道府県について、対応／除外を判定する（null は判断できない） */
function areaMatch(str, text) {
  const o = areaParse(str), t = String(text || "");
  const prefs = AREA_REG.flatMap(([r, ps]) => ps.map(p => [p, r])).filter(([p]) => t.includes(p) || (p.length > 2 && t.includes(p.replace(/[都府県]$/, ""))));
  if (!prefs.length) return null;
  let ok = false, ex = false;
  prefs.forEach(([p, r]) => {
    if (o.ex.includes(p) || (o.ex.includes(r) && !o.on.includes(p))) ex = true;
    else if (o.on.includes(p) || o.on.includes(r) || o.on.includes("全国")) ok = true;
  });
  return { ok, ex, prefs: prefs.map(x => x[0]) };
}
