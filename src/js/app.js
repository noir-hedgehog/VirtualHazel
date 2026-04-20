/**
 * app.js — Hazel Research Station
 * All data is fetched from /data/*.json (no external API keys).
 * Live status fetched from B站 public API (no auth required).
 */
"use strict";

// ── Colour palette (matches CSS vars) ────────────────────────────────────────
const C = {
  brand:    "#7C6FAF",
  mint:     "#6EC6A0",
  rose:     "#E87A90",
  amber:    "#F0A868",
  blue:     "#6B9DED",
  muted:    "#6B6E82",
  text:     "#D8D9E3",
  card:     "#1A1D27",
  border:   "#2A2D3A",
  barBg:    "rgba(255,255,255,0.06)",
};

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return n != null ? n.toLocaleString() : "—"  }
function $  (id) { return document.getElementById(id) }
function txt(el, s) { el.textContent = s }

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ← ${url}`);
  return r.json();
}

// ── CHARTJS defaults ─────────────────────────────────────────────────────────
Chart.defaults.color = C.muted;
Chart.defaults.font.family = "'Noto Sans SC', sans-serif";

function makeDoughnut(canvasId, labels, data, colors) {
  return new Chart($(canvasId), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      cutout: "65%",
      plugins: { legend: { position: "bottom", labels: { padding: 12, boxWidth: 10, boxHeight: 10 } } },
    },
  });
}

function pctBar(parentId, label, count, maxVal, color) {
  const p = document.createElement("div");
  p.className = "kuchaku-row";
  const pct = maxVal > 0 ? (count / maxVal * 100).toFixed(1) : 0;
  p.innerHTML = `
    <span class="kuchaku-label">${label}</span>
    <div class="kuchaku-bar-wrap">
      <div class="kuchaku-bar" style="width:${pct}%;background:${color}"></div>
    </div>
    <span class="kuchaku-cnt">${fmt(count)}</span>`;
  $(parentId).appendChild(p);
}

// ── HERO STATS ───────────────────────────────────────────────────────────────
function renderHero(persona, corpus) {
  const items = [
    { label: "弹幕总量",       val: fmt(corpus.total_raw),          color: C.brand  },
    { label: "有效分析样本",   val: fmt(corpus.after_cleaning),      color: C.mint  },
    { label: "高质量子集",     val: fmt(corpus.hq_subset_count),    color: C.rose  },
    { label: "Spam过滤",       val: fmt(corpus.spam_filtered),      color: C.amber },
  ];
  $("hero-stats").innerHTML = items.map(o => `
    <div class="card p-4 text-center">
      <div class="stat-num mb-1" style="color:${o.color}">${o.val}</div>
      <div class="text-xs text-[${C.muted}]">${o.label}</div>
    </div>`).join("");
}

// ── CORPUS STATS ─────────────────────────────────────────────────────────────
function renderCorpusStats(corpus) {
  const d = corpus;
  const cards = [
    { label: "原始弹幕",     val: fmt(d.total_raw),         color: C.brand,  tag: "raw"     },
    { label: "清洗后",       val: fmt(d.after_cleaning),     color: C.mint,  tag: "cleaned" },
    { label: "高质量子集",   val: fmt(d.hq_subset_count),   color: C.rose,  tag: "hq"      },
    { label: "Spam过滤",     val: `${d.spam_rate} (${fmt(d.spam_filtered)})`, color: C.amber, tag: "spam" },
  ];
  $("corpus-stats").innerHTML = cards.map(o => `
    <div class="card p-4 flex items-center gap-3">
      <div style="width:3px;height:40px;border-radius:3px;background:${o.color};flex-shrink:0"></div>
      <div>
        <div class="stat-num text-base mb-1" style="color:${o.color}">${o.val}</div>
        <div class="text-xs text-[${C.muted}]">${o.label}</div>
      </div>
    </div>`).join("");
}

// ── CHARTS ───────────────────────────────────────────────────────────────────
function renderCharts(corpus) {
  const td = corpus.type_distribution;
  makeDoughnut("chart-type",
    Object.keys(td),
    Object.values(td).map(v => v.count),
    [C.brand, C.amber, C.mint, C.rose]
  );

  const sd = corpus.sentiment_distribution;
  makeDoughnut("chart-sentiment",
    Object.keys(sd),
    Object.values(sd).map(v => v.count),
    [C.muted, C.amber, C.rose, C.mint]
  );

  const cd = corpus.category_distribution;
  makeDoughnut("chart-category",
    Object.keys(cd),
    Object.values(cd).map(v => v.count),
    [C.brand, C.muted, C.rose, C.mint, C.amber, C.blue]
  );
}

// ── PERSONA ──────────────────────────────────────────────────────────────────
function renderPersona(persona) {
  txt($("persona-name"), `${persona.name}  ${persona.nicknames ? persona.nicknames.join(" · ") : ""}`);

  const info = $("persona-info");
  info.innerHTML = "";
  const rows = [
    ["VTB 组织",  persona.org    || "—"],
    ["风格定位",  persona.style  || "—"],
    ["研究日期",  persona.research_date || "—"],
    ["数据来源",  persona.source || "—"],
  ];
  rows.forEach(([k, v]) => {
    const div = document.createElement("div");
    div.className = "flex items-start gap-2";
    div.innerHTML = `<span class="text-[${C.muted}] text-xs w-16 flex-shrink:0 mt-0.5">${k}</span><span class="text-sm">${v}</span>`;
    info.appendChild(div);
  });

  renderKuchaku(persona.口癖 || {});
}

function renderKuchaku(kuchaku) {
  const container = $("kuchaku-container");
  container.innerHTML = "";

  const catColors = { "傲娇": C.rose, "正向": C.mint, "调侃": C.amber };
  const catOrder  = ["傲娇", "正向", "调侃"];

  for (const cat of catOrder) {
    const items = kuchaku[cat];
    if (!items || items.length === 0) continue;

    const section = document.createElement("div");
    section.className = "mb-4";

    const title = document.createElement("div");
    title.className = "text-xs font-medium mb-2";
    title.style.color = catColors[cat] || C.brand;
    title.textContent = cat;
    section.appendChild(title);

    const maxVal = Math.max(...items.map(i => i.count));
    for (const item of items.slice(0, 8)) {
      pctBar.__proto__; // noop – use helper below
      const row = document.createElement("div");
      row.className = "kuchaku-row";
      const pct = maxVal > 0 ? (item.count / maxVal * 100).toFixed(1) : 0;
      row.innerHTML = `
        <span class="kuchaku-label">${item.phrase}</span>
        <div class="kuchaku-bar-wrap">
          <div class="kuchaku-bar" style="width:${pct}%;background:${catColors[cat]||C.brand}"></div>
        </div>
        <span class="kuchaku-cnt">${item.count}</span>`;
      section.appendChild(row);
    }
    container.appendChild(section);
  }
}

// ── SENTIMENT BARS ────────────────────────────────────────────────────────────
function renderSentimentBars(corpus) {
  const sd   = corpus.sentiment_distribution;
  const cols = { 中性: C.muted, 疑问: C.blue, 负向: C.rose, 正向: C.mint };
  const maxV = Math.max(...Object.values(sd).map(v => v.count));

  $("sentiment-bars").innerHTML = Object.entries(sd).map(([k, v]) => {
    const pct = (v.count / maxV * 100).toFixed(1);
    return `
    <div>
      <div class="flex justify-between text-xs mb-1">
        <span>${k}</span><span style="color:${cols[k]||C.brand}">${fmt(v.count)} &nbsp;${v.pct}</span>
      </div>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${cols[k]||C.brand}"></div></div>
    </div>`;
  }).join("");
}

// ── HAZEL MENTIONS ───────────────────────────────────────────────────────────
function renderHazelMentions(corpus) {
  $("hazel-mentions").innerHTML = corpus.top_hazel_mentions.slice(0, 8).map(([text, count]) => `
    <div class="flex items-start gap-2 text-sm border-b border-[${C.border}] pb-2 mb-2 last:border-0">
      <span class="tag tag-purple flex-shrink-0 mt-0.5">${fmt(count)}×</span>
      <span class="text-[${C.text}] leading-snug break-all">${escHtml(text)}</span>
    </div>`).join("");
}

function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── CATEGORY BARS ────────────────────────────────────────────────────────────
function renderCategoryBars(corpus) {
  const cd   = corpus.category_distribution;
  const cols = { 通用: C.brand, 提问: C.blue, 调侃: C.amber, 问候: C.mint, 表扬: C.rose, Spam: C.muted };
  const maxV = Math.max(...Object.values(cd).map(v => v.count));

  $("category-bars").innerHTML = Object.entries(cd)
    .sort((a,b) => b[1].count - a[1].count)
    .map(([k, v]) => {
    const pct = (v.count / maxV * 100).toFixed(1);
    return `
    <div>
      <div class="flex justify-between text-xs mb-1">
        <span>${k}</span><span>${fmt(v.count)} &nbsp;${v.pct}</span>
      </div>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${cols[k]||C.brand}"></div></div>
    </div>`;
  }).join("");
}

// ── TOP PHRASES ──────────────────────────────────────────────────────────────
function renderTopPhrases(persona, corpus) {
  const phrases = persona.top_phrases || [];
  $("top-phrases").innerHTML = phrases.map(p => `
    <div class="phrase-chip">
      <span>${escHtml(p.text)}</span>
      <span class="cnt">${fmt(p.count)}×</span>
    </div>`).join("");

  // Per-category highlights — sourced from corpus.json (top_per_category)
  const top = corpus?.top_per_category || {};
  const catEls = { general: $("cat-general"), greeting: $("cat-greeting"), praise: $("cat-praise") };
  const tagCls = { general: "tag-purple", greeting: "tag-mint", praise: "tag-amber" };
  const catLabel = { general: "通用", greeting: "问候", praise: "表扬" };
  for (const [cat, el] of Object.entries(catEls)) {
    if (!el || !top[cat]) continue;
    const existing = el.querySelector(".cat-label");
    if (!existing) {
      el.innerHTML += `<div class="cat-label mt-2 space-y-1">${top[cat].slice(0,3).map(([t,c]) => `
        <div class="text-xs text-[${C.muted}] flex justify-between">
          <span class="truncate mr-2">${escHtml(t)}</span>
          <span class="flex-shrink-0" style="color:${C.brand}">${fmt(c)}×</span>
        </div>`).join("")}</div>`;
    }
  }
}

// ── LIVE STATUS ──────────────────────────────────────────────────────────────
const ROOM_ID = 1713546334;

async function fetchLiveStatus() {
  try {
    const [roomRes, statRes] = await Promise.all([
      fetch(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${ROOM_ID}`),
      fetch(`https://api.bilibili.com/x/relation/stat?vmid=1298779265`),
    ]);
    const room = await roomRes.json();
    const stat = await statRes.json();

    const live = room?.data;
    const isLive = live?.live_status === 1;

    // Live indicator dot
    const dot = $("live-dot");
    dot.style.background = isLive ? C.mint : C.muted;
    dot.title = isLive ? "直播中" : "未开播";

    txt($("live-title"), isLive ? (live.title || "直播中") : "未开播");
    txt($("live-online"),    live?.online ? fmt(live.online) : "—" );

    const followerCount = stat?.data?.follower;
    txt($("live-followers"), followerCount != null ? fmt(followerCount) : "—" );

    // video count (hardcoded from known data — public API unreliable)
    txt($("live-videos"), "68+");
  } catch (e) {
    txt($("live-title"), "数据获取失败");
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const [persona, corpus] = await Promise.all([
      fetchJSON("./data/persona.json"),
      fetchJSON("./data/corpus.json"),
    ]);

    renderHero(persona, corpus);
    renderCorpusStats(corpus);
    renderCharts(corpus);
    renderPersona(persona);
    renderSentimentBars(corpus);
    renderHazelMentions(corpus);
    renderCategoryBars(corpus);
    renderTopPhrases(persona, corpus);
    fetchLiveStatus();
  } catch (err) {
    console.error("Init failed:", err);
    document.body.innerHTML += `
      <div class="text-center py-20 text-[${C.muted}]">
        <p>⚠️ 数据加载失败，请刷新重试</p>
        <p class="text-xs mt-2">${err.message}</p>
      </div>`;
  }
}

init();
