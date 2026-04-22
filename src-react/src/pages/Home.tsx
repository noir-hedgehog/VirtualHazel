import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import '../index.css';

Chart.register(...registerables);

export default function Home() {
  const chartRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    // Live status mock data
    const setContent = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setContent('live-title', 'VirtuaReal 灰泽满正在直播中');
    setContent('live-online', '2.3k');
    setContent('live-followers', '18.6k');
    setContent('live-videos', '124');

    // Hero stats
    const heroStats = document.getElementById('hero-stats');
    if (heroStats) {
      heroStats.innerHTML = `
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-mint)">48.2k</div>
          <div class="text-xs text-[#6B6E82] mt-1">弹幕总数</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-brand)">12.4k</div>
          <div class="text-xs text-[#6B6E82] mt-1">独立用户</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-rose)">86.3%</div>
          <div class="text-xs text-[#6B6E82] mt-1">正向情感</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-amber)">7</div>
          <div class="text-xs text-[#6B6E82] mt-1">直播场次</div>
        </div>
      `;
    }

    // Corpus stats
    const corpusStats = document.getElementById('corpus-stats');
    if (corpusStats) {
      corpusStats.innerHTML = `
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-mint)">48,214</div>
          <div class="text-xs text-[#6B6E82] mt-1">弹幕总数</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-brand)">12,438</div>
          <div class="text-xs text-[#6B6E82] mt-1">独立用户</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-rose)">86.3%</div>
          <div class="text-xs text-[#6B6E82] mt-1">正向情感</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-num" style="color:var(--c-amber)">7</div>
          <div class="text-xs text-[#6B6E82] mt-1">直播场次</div>
        </div>
      `;
    }

    // Charts
    const typeCtx = chartRefs.current['chart-type'];
    const sentimentCtx = chartRefs.current['chart-sentiment'];
    const categoryCtx = chartRefs.current['chart-category'];

    if (typeCtx) {
      new Chart(typeCtx, {
        type: 'doughnut',
        data: {
          labels: ['问候', '互动', '打赏', '提问', '刷屏'],
          datasets: [{
            data: [35, 28, 15, 12, 10],
            backgroundColor: ['#7C6FAF', '#6EC6A0', '#E87A90', '#F0A868', '#6B9DED'],
            borderWidth: 0,
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#D8D9E3', boxWidth: 12, padding: 8 } } } }
      });
    }

    if (sentimentCtx) {
      new Chart(sentimentCtx, {
        type: 'bar',
        data: {
          labels: ['正向', '中性', '负向'],
          datasets: [{
            data: [86.3, 10.2, 3.5],
            backgroundColor: ['#6EC6A0', '#F0A868', '#E87A90'],
            borderRadius: 6,
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#6B6E82' }, grid: { color: 'rgba(255,255,255,0.06)' } }, x: { ticks: { color: '#6B6E82' } } } }
      });
    }

    if (categoryCtx) {
      new Chart(categoryCtx, {
        type: 'polarArea',
        data: {
          labels: ['互动', '应援', '闲聊', '提问', '其他'],
          datasets: [{
            data: [40, 25, 18, 12, 5],
            backgroundColor: ['rgba(124,111,175,0.7)', 'rgba(110,198,160,0.7)', 'rgba(232,122,144,0.7)', 'rgba(240,168,104,0.7)', 'rgba(107,157,237,0.7)'],
          }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#D8D9E3', boxWidth: 12, padding: 8 } } } }
      });
    }

    // Persona info
    const personaInfo = document.getElementById('persona-info');
    if (personaInfo) {
      personaInfo.innerHTML = `
        <div class="kuchaku-row"><span class="kuchaku-label">平台</span><span>B站直播 ·VirtuaReal</span></div>
        <div class="kuchaku-row"><span class="kuchaku-label">风格</span><span>活泼亲切 · 宠粉系VTuber</span></div>
        <div class="kuchaku-row"><span class="kuchaku-label">口癖</span><span>会使用独特的句末语气词</span></div>
        <div class="kuchaku-row"><span class="kuchaku-label">活跃时段</span><span>周五/周六 20:00-23:00</span></div>
      `;
    }

    // Kuchaku heatmap
    const kuchakuContainer = document.getElementById('kuchaku-container');
    if (kuchakuContainer) {
      const kuchakuData = [
        { label: 'えいやん', max: 120, value: 98 },
        { label: 'ふわっ', max: 80, value: 72 },
        { label: 'ありがと', max: 60, value: 45 },
        { label: '頑張る', max: 50, value: 38 },
        { label: 'すごい', max: 70, value: 55 },
      ];
      kuchakuContainer.innerHTML = kuchakuData.map(k =>
        `<div class="kuchaku-row">
          <span class="kuchaku-label">${k.label}</span>
          <div class="kuchaku-bar-wrap"><div class="kuchaku-bar" style="width:${(k.value/k.max)*100}%"></div></div>
          <span class="kuchaku-cnt">${k.value}</span>
        </div>`
      ).join('');
    }

    // Sentiment bars
    const sentimentBars = document.getElementById('sentiment-bars');
    if (sentimentBars) {
      const sentiments = [
        { label: '温暖/治愈', color: 'var(--c-mint)', pct: 45 },
        { label: '开心/兴奋', color: 'var(--c-amber)', pct: 32 },
        { label: '中性/平静', color: 'var(--c-brand)', pct: 15 },
        { label: '其他', color: 'var(--c-rose)', pct: 8 },
      ];
      sentimentBars.innerHTML = sentiments.map(s => `
        <div class="kuchaku-row">
          <span class="kuchaku-label" style="min-width:80px">${s.label}</span>
          <div class="kuchaku-bar-wrap"><div class="bar-bg"><div class="bar-fill" style="width:${s.pct}%;background:${s.color}"></div></div></div>
          <span class="kuchaku-cnt">${s.pct}%</span>
        </div>`
      ).join('');
    }

    // Hazel mentions
    const hazelMentions = document.getElementById('hazel-mentions');
    if (hazelMentions) {
      const mentions = [
        { phrase: '灰泽满加油', count: 342 },
        { phrase: 'hazel可爱', count: 287 },
        { phrase: '满宝今天状态好棒', count: 198 },
        { phrase: '期待下一场直播', count: 156 },
        { phrase: '辛苦了满', count: 143 },
      ];
      hazelMentions.innerHTML = mentions.map(m => `
        <div class="kuchaku-row">
          <span class="text-sm">${m.phrase}</span>
          <span class="kuchaku-cnt">${m.count}</span>
        </div>`
      ).join('');
    }

    // Category bars
    const categoryBars = document.getElementById('category-bars');
    if (categoryBars) {
      const categories = [
        { label: '互动应援', pct: 40, color: 'var(--c-brand)' },
        { label: '日常闲聊', pct: 28, color: 'var(--c-mint)' },
        { label: '问题咨询', pct: 18, color: 'var(--c-amber)' },
        { label: '其他', pct: 14, color: 'var(--c-rose)' },
      ];
      categoryBars.innerHTML = categories.map(c => `
        <div class="kuchaku-row">
          <span class="kuchaku-label" style="min-width:70px">${c.label}</span>
          <div class="kuchaku-bar-wrap"><div class="bar-bg"><div class="bar-fill" style="width:${c.pct}%;background:${c.color}"></div></div></div>
          <span class="kuchaku-cnt">${c.pct}%</span>
        </div>`
      ).join('');
    }

    // Top phrases
    const topPhrases = document.getElementById('top-phrases');
    if (topPhrases) {
      const phrases = [
        { text: 'hazel加油', count: 534, cls: 'tag-purple' },
        { text: '太可爱了吧', count: 421, cls: 'tag-mint' },
        { text: '満ちゃん辛苦了', count: 387, cls: 'tag-rose' },
        { text: '下次见啦', count: 312, cls: 'tag-amber' },
        { text: '期待直播', count: 287, cls: 'tag-blue' },
        { text: '暖暖的', count: 234, cls: 'tag-purple' },
        { text: '可爱死了', count: 198, cls: 'tag-mint' },
      ];
      topPhrases.innerHTML = phrases.map(p => `<span class="phrase-chip ${p.cls}">${p.text}<span class="cnt">${p.count}</span></span>`).join('');
    }

    // Per-category top phrases
    const cats = {
      'cat-general': ['hazel加油', '太可爱了吧', '下次见啦'],
      'cat-greeting': ['大家好', '晚上好呀', '开播啦'],
      'cat-praise': ['说得真好', '好棒啊', '专业'],
    };
    Object.entries(cats).forEach(([id, phrases]) => {
      const el = document.getElementById(id);
      if (el) {
        const existing = el.querySelector('.flex');
        if (existing) {
          existing.innerHTML = phrases.map(p => `<span class="phrase-chip tag-purple">${p}</span>`).join('');
        }
      }
    });

  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#2A2D3A]" style={{ background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--c-mint)' }} title="加载中…"></div>
            <span className="font-serif font-bold text-lg" style={{ color: 'var(--c-brand)' }}>灰泽满</span>
            <span className="text-xs text-[#6B6E82]">Hazel Research</span>
          </div>
          <div className="flex gap-5 text-sm text-[#6B6E82]">
            <a href="#corpus">语料库</a>
            <a href="#persona">人设分析</a>
            <a href="#互动">粉丝互动</a>
            <a href="#高频">高频金句</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-gradient pt-14 pb-16 text-center fade-in">
        <div className="max-w-3xl mx-auto px-6">
          <div className="tag tag-purple mb-4">VirtuaReal PROJECT</div>
          <h1 className="font-serif text-5xl font-bold mb-3" style={{ color: '#E8E4F8' }}>
            灰泽满 <span className="text-3xl" style={{ color: 'var(--c-muted)' }}>Hazel</span>
          </h1>
          <p className="text-[#6B6E82] text-base mb-8 leading-relaxed">
            基于B站直播弹幕数据的粉丝互动行为研究<br />
            <span className="text-sm">数据采样 · 内容分析 · 互动模式挖掘</span>
          </p>
          <div className="grid cards grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto" id="hero-stats"></div>
        </div>
      </header>

      {/* LIVE STATUS */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="card p-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="section-title mb-1">直播间状态</div>
            <div id="live-title" className="text-sm text-[#6B6E82]">加载中…</div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div id="live-online" className="stat-num" style={{ color: 'var(--c-mint)' }}>—</div>
              <div className="text-[#6B6E82] text-xs mt-1">在线人数</div>
            </div>
            <div className="text-center">
              <div id="live-followers" className="stat-num" style={{ color: 'var(--c-brand)' }}>—</div>
              <div className="text-[#6B6E82] text-xs mt-1">粉丝数</div>
            </div>
            <div className="text-center">
              <div id="live-videos" className="stat-num" style={{ color: 'var(--c-amber)' }}>—</div>
              <div className="text-[#6B6E82] text-xs mt-1">视频数</div>
            </div>
          </div>
        </div>
      </div>

      {/* CORPUS OVERVIEW */}
      <section id="corpus" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="section-title mb-6">📊 语料库统计</div>
        <div className="grid-cards mb-6" id="corpus-stats"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-5">
            <div className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>弹幕类型分布</div>
            <canvas ref={(el) => { chartRefs.current['chart-type'] = el; }} height="200"></canvas>
          </div>
          <div className="card p-5">
            <div className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>情感分布</div>
            <canvas ref={(el) => { chartRefs.current['chart-sentiment'] = el; }} height="200"></canvas>
          </div>
          <div className="card p-5">
            <div className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>内容分类分布</div>
            <canvas ref={(el) => { chartRefs.current['chart-category'] = el; }} height="200"></canvas>
          </div>
        </div>
      </section>

      {/* PERSONA */}
      <section id="persona" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="section-title mb-6">🎭 人设分析</div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <div className="font-serif font-bold text-xl mb-4" style={{ color: '#E8E4F8' }} id="persona-name">加载中…</div>
            <div className="space-y-3 text-sm" id="persona-info"></div>
          </div>
          <div className="card p-6">
            <div className="font-medium mb-4" style={{ color: '#E8E4F8' }}>🔥 口癖热力图</div>
            <div id="kuchaku-container"></div>
          </div>
        </div>
        <div className="card p-6 mb-6">
          <div className="font-medium mb-4" style={{ color: '#E8E4F8' }}>💬 情感构成</div>
          <div id="sentiment-bars" className="space-y-3"></div>
        </div>
      </section>

      {/* INTERACTION PATTERNS */}
      <section id="互动" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="section-title mb-6">💡 粉丝互动模式</div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="font-medium mb-4" style={{ color: '#E8E4F8' }}>🏷️ 提及灰泽满 TOP</div>
            <div className="space-y-2" id="hazel-mentions"></div>
          </div>
          <div className="card p-6">
            <div className="font-medium mb-4" style={{ color: '#E8E4F8' }}>📂 内容分类</div>
            <div id="category-bars" className="space-y-3"></div>
          </div>
        </div>
      </section>

      {/* TOP PHRASES */}
      <section id="高频" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="section-title mb-6">🌟 高频金句</div>
        <div className="card p-6">
          <div className="text-xs text-[#6B6E82] mb-4">以下为B站弹幕中出现频次最高的重复弹幕，反映直播间独特的互动文化</div>
          <div id="top-phrases" className="flex flex-wrap gap-2"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card p-5" id="cat-general">
            <div className="tag tag-purple mb-3">通用</div>
          </div>
          <div className="card p-5" id="cat-greeting">
            <div className="tag tag-mint mb-3">问候</div>
          </div>
          <div className="card p-5" id="cat-praise">
            <div className="tag tag-amber mb-3">表扬</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#2A2D3A] py-8 text-center text-xs text-[#6B6E82]">
        <p>灰泽满 Hazel — 粉丝互动研究站</p>
        <p className="mt-1">数据来源：B站公开直播弹幕 · 仅供研究使用</p>
      </footer>
    </>
  );
}