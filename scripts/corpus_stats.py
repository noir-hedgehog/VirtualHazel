#!/usr/bin/env python3
"""
corpus_stats.py — Produce public-facing corpus statistics from cleaning_report.json.
Removes: raw spam content (not for public display), excessive detail.
"""
import json
from pathlib import Path

REPORT = Path("/root/.hermes/hazel_danmu/corpus/cleaning_report.json")
OUT    = Path("/root/VirtualHazel/data")
OUT.mkdir(parents=True, exist_ok=True)

raw = json.loads(REPORT.read_text(encoding="utf-8"))

# Build public-facing summary (no spam content, no raw danmaku text beyond aggregates)
pub = {
    "generated_at":    raw["generated_at"][:10],
    "research_date":  "2026-04-20",
    "total_raw":       raw["total_raw"],
    "total_analyzed":  raw["total_labeled"],
    "after_cleaning":  raw["cleaned_count"],
    "spam_filtered":   raw["spam_filtered"],
    "spam_rate":       raw["type_dist_pct"]["spam"],
    "hq_subset_count": raw["hq_count"],

    "type_distribution": {
        k: {"count": raw["type_dist"][k], "pct": v}
        for k, v in raw["type_dist_pct"].items()
    },
    "sentiment_distribution": {
        k: {"count": raw["sentiment_dist"][k], "pct": v}
        for k, v in raw["sentiment_dist_pct"].items()
    },
    "category_distribution": {
        k: {"count": raw["category_dist"][k], "pct": v}
        for k, v in raw["category_dist_pct"].items()
    },

    "hazel_mention_count": raw["hazel_mentions"],
    "hazel_mention_rate":  raw["hazel_mentions_pct"],

    # Top phrases per category — sanitised to top 5 per category only
    "top_per_category": {
        cat: [(t, c) for t, c in items[:5]]
        for cat, items in raw["top_per_category"].items()
    },

    # Top hazel mentions — sanitised
    "top_hazel_mentions": raw["top_hazel_mentions"][:8],

    "notes": [
        "数据来源：B站直播弹幕（公开可获取）",
        "已过滤广告、垃圾弹幕及个人信息",
        "高质量子集（hq_subset）用于内容分析",
    ]
}

out_path = OUT / "corpus.json"
out_path.write_text(json.dumps(pub, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✓ corpus.json  → {out_path}  ({out_path.stat().st_size:,} bytes)")
print(f"  - total_raw: {pub['total_raw']:,}")
print(f"  - after_cleaning: {pub['after_cleaning']:,}")
print(f"  - hq_subset: {pub['hq_subset_count']:,}")
