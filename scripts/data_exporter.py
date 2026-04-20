#!/usr/bin/env python3
"""
data_exporter.py — Extract public research findings from Hazel project sources.
Produces: dist/data/persona.json
"""
import json, re, os
from pathlib import Path

SRC = Path("/root/.hermes/hazel")
OUT = Path("/root/VirtualHazel/data")
OUT.mkdir(parents=True, exist_ok=True)

# ── 1. Parse persona.md ──────────────────────────────────────────────────────
def parse_persona_md(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    out = {}

    # Basic info block
    for line in text.splitlines():
        m = re.match(r"^\*\*名称\*\*:\s*(.+)", line)
        if m: out["name"] = m.group(1).strip()
        m = re.match(r"^\*\*昵称\*\*:\s*(.+)", line)
        if m: out["nicknames"] = [s.strip() for s in m.group(1).split(",")]
        m = re.match(r"^\*\*VTB组织\*\*:\s*(.+)", line)
        if m: out["org"] = m.group(1).strip()
        m = re.match(r"^\*\*风格\*\*:\s*(.+)", line)
        if m: out["style"] = m.group(1).strip()

    # Cleaning stats
    stats = {}
    for line in text.splitlines():
        m = re.match(r"^\|\s*原始弹幕.*?(\d[\d,]+)", line)
        if m: stats["total_raw"] = int(m.group(1).replace(",", ""))
        m = re.match(r"^\|\s*清洗后弹幕.*?(\d[\d,]+)", line)
        if m: stats["cleaned"] = int(m.group(1).replace(",", ""))
        m = re.match(r"^\|\s*过滤Spam.*?(\d[\d,]+)", line)
        if m: stats["spam_filtered"] = int(m.group(1).replace(",", ""))
        m = re.match(r"^\|\s*高质量LLM子集.*?(\d[\d,]+)", line)
        if m: stats["hq_subset"] = int(m.group(1).replace(",", ""))
    out["cleaning_stats"] = stats

    # Sentiment distribution
    sentiment = {}
    sentiment_rows = [l for l in text.splitlines() if re.match(r"^\|\s*(中性|疑问|负向|正向)", l)]
    for row in sentiment_rows:
        m = re.match(r"^\|\s*(\S+)\s*\|\s*([\d,]+)\s*\|\s*([\d.]+%)", row)
        if m: sentiment[m.group(1)] = {"count": int(m.group(2).replace(",", "")), "pct": m.group(3)}
    out["sentiment_dist"] = sentiment

    # Category distribution
    categories = {}
    cat_rows = [l for l in text.splitlines() if re.match(r"^\|\s*(通用|提问|调侃|问候|表扬|Spam)", l)]
    for row in cat_rows:
        m = re.match(r"^\|\s*(\S+)\s*\|\s*([\d,]+)\s*\|\s*([\d.]+%)", row)
        if m: categories[m.group(1)] = {"count": int(m.group(2).replace(",", "")), "pct": m.group(3)}
    out["category_dist"] = categories

    # Type distribution
    types = {}
    type_rows = [l for l in text.splitlines() if re.match(r"^\|\s*(LLM|Fast|Question|Spam)", l)]
    for row in type_rows:
        m = re.match(r"^\|\s*(\S+)\s*\|\s*([\d,]+)\s*\|\s*([\d.]+%)", row)
        if m: types[m.group(1)] = {"count": int(m.group(2).replace(",", "")), "pct": m.group(3)}
    out["type_dist"] = types

    # Top phrases (highlight gold sentences)
    top_phrases = []
    in_phrases = False
    for line in text.splitlines():
        if "高频金句" in line:
            in_phrases = True
            continue
        if in_phrases and line.startswith("-"):
            m = re.match(r"^- `(\d+)×`\s*(.+)", line)
            if m:
                top_phrases.append({"count": int(m.group(1)), "text": m.group(2).strip()})
                if len(top_phrases) >= 15:
                    break
        elif in_phrases and line.startswith("#"):
            break
    out["top_phrases"] = top_phrases

    # Top hazel mentions
    hazel_mentions = []
    in_section = False
    for line in text.splitlines():
        if "灰泽满专属提及" in line:
            in_section = True
            continue
        if in_section and line.startswith("-") and "次" in line:
            m = re.match(r"^- (.+?)（(\d+)次）", line)
            if m: hazel_mentions.append({"text": m.group(1), "count": int(m.group(2))})
            if len(hazel_mentions) >= 10:
                break
        elif in_section and line.startswith("#"):
            break
    out["top_hazel_mentions"] = hazel_mentions

    # 口癖热力图 (tsundere phrases)
    out["口癖"] = extract_kuchaku(text)

    # Updated timestamp
    m = re.search(r"最后更新[:\s]*(\d{4}-\d{2}-\d{2})", text)
    if m: out["research_date"] = m.group(1)

    return out

def extract_kuchaku(text: str) -> dict:
    """Extract 口癖热力图 data from persona.md."""
    categories = {}
    current_cat = None
    for line in text.splitlines():
        # Section headers (### 傲娇口癖 / ### 正向情感口癖 / ### 调侃/傲娇口癖)
        if "口癖" in line:
            stripped = line.strip()
            if stripped.startswith("#"):
                # Check more specific first, then fall back
                if "正向" in stripped:
                    current_cat = "正向"
                elif "调侃" in stripped:
                    current_cat = "调侃"
                elif "傲娇" in stripped:
                    current_cat = "傲娇"
                continue
        # Phrase rows: - **phrase** `count`
        m = re.match(r"^- \*\*([^\*]+)\*\*\s*`(\d+)`", line)
        if m and current_cat:
            categories.setdefault(current_cat, [])
            categories[current_cat].append({"phrase": m.group(1).strip(), "count": int(m.group(2))})
    return categories

# ── 2. Write output ──────────────────────────────────────────────────────────
persona = parse_persona_md(SRC / "persona.md")
persona["source"] = "灰泽满弹幕语料库研究"
persona["generated_at"] = "2026-04-20"

out_path = OUT / "persona.json"
out_path.write_text(json.dumps(persona, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✓ persona.json → {out_path}  ({out_path.stat().st_size:,} bytes)")
print(f"  - top_phrases: {len(persona.get('top_phrases', []))}")
print(f"  - 口癖 categories: {list(persona.get('口癖', {}).keys())}")
print(f"  - sentiment keys: {list(persona.get('sentiment_dist', {}).keys())}")
