import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import analyticsData from '../data/analytics_data.json';
import '../index.css';

Chart.register(...registerables);

interface VideoStats {
  count: number;
  duration: number;
  min_time: number;
  max_time: number;
  avg_per_min: number;
}

interface TimeSegment {
  beg_20pct: number;
  mid_20_60pct: number;
  end60_80pct: number;
  end80_100pct: number;
}

interface AnalyticsJson {
  total_danmaku: number;
  unique_senders: number;
  live_videos: number;
  top20_sender_pct: number;
  top_phrases: { text: string; count: number }[];
  sentiment: {
    positive: number; positive_pct: number;
    negative: number; negative_pct: number;
    question: number; question_pct: number;
    neutral: number; neutral_pct: number;
  };
  category: {
    interaction: number; interaction_pct: number;
    greeting: number; greeting_pct: number;
    praise: number; praise_pct: number;
    spam: number; spam_pct: number;
  };
  video_stats: Record<string, VideoStats>;
  time_segments: Record<string, TimeSegment>;
  density_data: Record<string, number[]>;
}

export default function Analytics() {
  const chartRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [activeVideo, setActiveVideo] = useState<string>('BV1BSQABTEzR');
  const [data, setData] = useState<AnalyticsJson | null>(null);

  useEffect(() => {
    setData(analyticsData as AnalyticsJson);
  }, []);

  useEffect(() => {
    if (!data) return;

    // Destroy old charts
    Object.entries(chartRefs.current).forEach(([, el]) => {
      if (el) {
        const existing = Chart.getChart(el);
        if (existing) existing.destroy();
      }
    });

    const d = data as AnalyticsJson;

    // Sentiment donut
    const sentimentCtx = chartRefs.current['chart-sentiment'];
    if (sentimentCtx) {
      new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
          labels: ['正向情感', '中性', '疑问', '负向'],
          datasets: [{
            data: [d.sentiment.positive, d.sentiment.neutral, d.sentiment.question, d.sentiment.negative],
            backgroundColor: ['#6EC6A0', '#7C6FAF', '#F0A868', '#E87A90'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          cutout: '60%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#D8D9E3', boxWidth: 12, padding: 8, font: { size: 11 } } }
          }
        }
      });
    }

    // Category polar area
    const categoryCtx = chartRefs.current['chart-category'];
    if (categoryCtx) {
      new Chart(categoryCtx, {
        type: 'polarArea',
        data: {
          labels: ['粉丝互动', '弹幕调侃', '正向应援', '低质/刷屏'],
          datasets: [{
            data: [d.category.interaction, d.category.greeting, d.category.praise, d.category.spam],
            backgroundColor: ['rgba(124,111,175,0.7)', 'rgba(110,198,160,0.7)', 'rgba(240,168,104,0.7)', 'rgba(232,122,144,0.7)'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#D8D9E3', boxWidth: 12, padding: 8, font: { size: 11 } } }
          },
          scales: {
            r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.06)' } }
          }
        }
      });
    }

    // Density timeline
    const densityCtx = chartRefs.current['chart-density'];
    const densityBuckets = d.density_data[activeVideo];
    if (densityCtx && densityBuckets) {
      const labels = densityBuckets.map((_, idx) => `${idx*5}-${(idx+1)*5}min`);
      new Chart(densityCtx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '弹幕数/5min',
            data: densityBuckets,
            backgroundColor: 'rgba(124,111,175,0.6)',
            borderRadius: 3,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { ticks: { color: '#6B6E82', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
            x: { ticks: { color: '#6B6E82', font: { size: 9 }, maxRotation: 45 } }
          }
        }
      });
    }

    // Time segment bar
    const timeCtx = chartRefs.current['chart-time'];
    const timeSeg = d.time_segments[activeVideo];
    if (timeCtx && timeSeg) {
      new Chart(timeCtx, {
        type: 'bar',
        data: {
          labels: ['开场 0-20%', '中段 20-60%', '后段 60-80%', '结尾 80-100%'],
          datasets: [{
            label: '弹幕占比%',
            data: [timeSeg.beg_20pct, timeSeg.mid_20_60pct, timeSeg.end60_80pct, timeSeg.end80_100pct],
            backgroundColor: ['#4F4789', '#7C6FAF', '#E87A90', '#F0A868'],
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { max: 100, ticks: { color: '#6B6E82', callback: (v) => v + '%' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#D8D9E3', font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }

  }, [data, activeVideo]);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="card p-8 text-[#6B6E82]">加载中…</div>
      </div>
    );
  }

  const d = data as AnalyticsJson;
  const { total_danmaku, unique_senders, live_videos, top20_sender_pct, top_phrases } = d;

  const videoLabels: Record<string, string> = {
    'BV175dnBfEH9': '4月18日 直播回放',
    'BV1BSQABTEzR': '4月18日 深夜档',
    'BV1M7D1BKEBo': '4月19日 直播回放',
    'BV1ocDsBxEQb': '4月20日 直播回放',
    'BV1rYQhBQEQe': '4月21日 直播回放',
    'BV1wjQpBaEXt': '4月21日 深夜档',
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="section-title mb-6">📈 弹幕数据分析</div>

      {/* Stats Overview */}
      <div className="grid cards grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card p-4 text-center">
          <div className="stat-num" style={{ color: 'var(--c-mint)' }}>{total_danmaku.toLocaleString()}</div>
          <div className="text-xs text-[#6B6E82] mt-1">弹幕总数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="stat-num" style={{ color: 'var(--c-brand)' }}>{unique_senders.toLocaleString()}</div>
          <div className="text-xs text-[#6B6E82] mt-1">独立用户</div>
        </div>
        <div className="card p-4 text-center">
          <div className="stat-num" style={{ color: 'var(--c-amber)' }}>{live_videos}</div>
          <div className="text-xs text-[#6B6E82] mt-1">直播场次</div>
        </div>
        <div className="card p-4 text-center">
          <div className="stat-num" style={{ color: 'var(--c-rose)' }}>{top20_sender_pct}%</div>
          <div className="text-xs text-[#6B6E82] mt-1">Top20发送者占比</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-5">
          <div className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>情感分布</div>
          <canvas ref={(el) => { chartRefs.current['chart-sentiment'] = el; }} height="220"></canvas>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'#6EC6A0'}}></span>正向 {d.sentiment.positive_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'#7C6FAF'}}></span>中性 {d.sentiment.neutral_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'#F0A868'}}></span>疑问 {d.sentiment.question_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'#E87A90'}}></span>负向 {d.sentiment.negative_pct}%</div>
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm font-medium mb-3" style={{ color: 'var(--c-text)' }}>内容分类分布</div>
          <canvas ref={(el) => { chartRefs.current['chart-category'] = el; }} height="220"></canvas>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'rgba(124,111,175,0.7)'}}></span>粉丝互动 {d.category.interaction_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'rgba(110,198,160,0.7)'}}></span>弹幕调侃 {d.category.greeting_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'rgba(240,168,104,0.7)'}}></span>正向应援 {d.category.praise_pct}%</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{background:'rgba(232,122,144,0.7)'}}></span>低质/刷屏 {d.category.spam_pct}%</div>
          </div>
        </div>
      </div>

      {/* Video Timeline Selector */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>📊 弹幕密度时间线</div>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(d.video_stats).map((bv) => (
              <button
                key={bv}
                onClick={() => setActiveVideo(bv)}
                className={`text-xs px-2 py-1 rounded transition-colors ${activeVideo === bv ? 'bg-[#7C6FAF] text-white' : 'bg-[#2A2D3A] text-[#6B6E82] hover:bg-[#3A3D4A]'}`}
              >
                {videoLabels[bv] || bv}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#6B6E82] mb-2">弹幕密度（5分钟窗口）</div>
            <canvas ref={(el) => { chartRefs.current['chart-density'] = el; }} height="160"></canvas>
          </div>
          <div>
            <div className="text-xs text-[#6B6E82] mb-2">时间段分布</div>
            <canvas ref={(el) => { chartRefs.current['chart-time'] = el; }} height="160"></canvas>
          </div>
        </div>
        {d.video_stats[activeVideo] && (
          <div className="mt-3 flex gap-4 text-xs text-[#6B6E82]">
            <span>累计 {d.video_stats[activeVideo].count.toLocaleString()} 条弹幕</span>
            <span>峰值 {Math.round(d.video_stats[activeVideo].avg_per_min * 5)} 条/5min</span>
          </div>
        )}
      </div>

      {/* Top Phrases */}
      <div className="card p-5 mb-6">
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--c-text)' }}>🔥 高频金句 TOP 20</div>
        <div className="text-xs text-[#6B6E82] mb-3">基于弹幕文本精确匹配（去重后），反映直播间独特的互动文化</div>
        <div className="space-y-2">
          {top_phrases.slice(0, 20).map((phrase, i) => (
            <div key={i} className="flex items-center gap-3 py-1 border-b border-[#2A2D3A] last:border-0">
              <span className={`w-5 h-5 rounded text-center text-xs font-bold flex-shrink-0 ${i < 3 ? 'bg-[#7C6FAF] text-white' : 'bg-[#2A2D3A] text-[#6B6E82]'}`}>
                {i + 1}
              </span>
              <span className="text-sm flex-1" style={{ color: 'var(--c-text)' }}>{phrase.text}</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(124,111,175,0.2)', color: 'var(--c-brand)' }}>
                {phrase.count.toLocaleString()}次
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Video Stats Table */}
      <div className="card p-5">
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--c-text)' }}>📺 直播回放档案</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[#6B6E82] border-b border-[#2A2D3A]">
                <th className="text-left py-2 pr-4">视频</th>
                <th className="text-right py-2 pr-4">弹幕数</th>
                <th className="text-right py-2 pr-4">时长</th>
                <th className="text-right py-2 pr-4">峰值密度</th>
                <th className="text-right py-2">弹幕/min</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(d.video_stats).map(([bv, stats]) => (
                <tr key={bv} className="border-b border-[#2A2D3A] last:border-0 hover:bg-[#1A1D27] transition-colors">
                  <td className="py-2 pr-4">
                    <div className="text-[#D8D9E3]">{videoLabels[bv] || bv}</div>
                    <div className="text-xs text-[#6B6E82]">{bv}</div>
                  </td>
                  <td className="text-right py-2 pr-4 text-[#6B6E82]">{stats.count.toLocaleString()}</td>
                  <td className="text-right py-2 pr-4 text-[#6B6E82]">{Math.round(stats.duration / 60)}min</td>
                  <td className="text-right py-2 pr-4 text-[#6EC6A0]">
                    {d.density_data[bv] ? Math.max(...d.density_data[bv]) : '—'} 条/5min
                  </td>
                  <td className="text-right py-2 text-[#7C6FAF]">{stats.avg_per_min.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-xs text-[#6B6E82] text-center">
        数据来源：5个直播回放弹幕采集 · corpus_cleaned.json (22,068条去重语料) · 统计基于关键词分类
      </div>
    </div>
  );
}
