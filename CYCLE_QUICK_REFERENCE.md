# 🔁 Cycle Engine - Quick Reference Card

## 📌 Essential Commands (Copy & Paste Ready)

### Create All Cycles

```python
created_ids = create_research_cycles()
```

### Display Dashboard

```python
display_cycles_dashboard()
```

### Create Custom Document Cycle

```python
doc_cycle = create_document_generation_cycle(
    title="Weekly AI Research Digest",
    sources=["arxiv", "pubmed"],
    frequency="weekly"
)
```

### Auto-Detect Knowledge Gaps

```python
auto_cycles = auto_detect_and_create_cycles(trigger="low_confidence", max_cycles=5)
```

### Get Cycle Status

```python
status = get_cycle_status(cycle_id)
```

### Get Engine Metrics

```python
metrics = get_engine_metrics()
```

---

## 📊 Predefined Cycles Reference

| Name | Frequency | Source | Agent | Purpose |
|------|-----------|--------|-------|---------|
| `pubmed_daily` | 24h | PubMed | ALBA | Medical literature |
| `arxiv_daily` | 24h | ArXiv | ALBA | Scientific preprints |
| `weather_hourly` | 1h | Weather | ALBA | Environmental data |
| `news_realtime` | Stream | NewsAPI | ALBA | News monitoring |
| `european_data_weekly` | 7d | EU Portals | ALBA | Open Data |
| `research_report_monthly` | 30d | All | ALBI | Reports |
| `knowledge_gap_detection` | 2d | Insights | ALBI | Gap analysis |

---

## 🎯 Cycle Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `INTERVAL` | Periodic (hourly/daily/weekly/monthly) | Daily PubMed fetch |
| `EVENT` | Triggered by events | Breakthrough paper alert |
| `STREAM` | Continuous real-time | Live news feed |
| `BATCH` | One-time execution | Quarterly report |
| `GAP-TRIGGERED` | Auto-created for gaps | Born-Concepts |

---

## 🤖 Agent Roles

| Agent | Role | Responsibilities |
|-------|------|------------------|
| **ALBA 🔵** | Data Collector | Fetch APIs, monitor sources, store data |
| **ALBI 🟣** | Analyzer | Generate reports, analyze gaps, synthesize |
| **JONA 🟡** | Overseer | Ethical review, approve/block, human values |

---

## 💾 Storage Targets

| Target | Purpose | Data Type |
|--------|---------|-----------|
| `postgresql` | Structured data | Papers, citations, metadata |
| `mongodb` | Documents | Reports, summaries, JSON |
| `elasticsearch` | Search | Full-text indexed content |
| `weaviate` | Vectors | Semantic search, embeddings |
| `neo4j` | Graphs | Knowledge relationships |
| `local` | Files | Generated documents (.md) |

---

## 🛡️ Alignment Policies

| Policy | Behavior | Use Case |
|--------|----------|----------|
| `strict` | Stop on any error | Medical research, critical data |
| `moderate` | Warn and continue | General research |
| `permissive` | Log only | Environmental monitoring |
| `ethical_guard` | JONA reviews | Sensitive topics |

---

## 📁 File Locations

...
data/cycles/
├── pubmed_daily/
│   ├── executions/         # Execution logs
│   └── outputs/            # Collected data
├── research_report_monthly/
│   └── outputs/
│       └── Report-2025-12.md   # Generated documents
└── knowledge_gap_detection/
    └── detected_gaps.json      # Identified gaps
...

---

## 🔧 Advanced Functions

### Create Event Cycle

```python
event_cycle = create_event_cycle(
    event_trigger="high_impact_paper",
    task="immediate_analysis",
    domain="biomedical_research"
)
```

### List All Cycles

```python
all_cycles = list_all_cycles()
for cycle in all_cycles:
    print(f"{cycle['cycle_id']}: {cycle['status']}")
```

### Manual Cycle Creation

```python
custom = cycle_engine.create_cycle(
    domain="my_domain",
    source="my_source",
    agent="ALBA",
    task="my_task",
    cycle_type="interval",
    interval=7200,  # 2 hours
    alignment="moderate",
    target=["postgresql", "mongodb"]
)
```

---

## 📡 Telemetry Events

All cycle operations send telemetry:

```python
telemetry_router.send_all({
    "event": "cycle_created",
    "cycle_id": cycle_id,
    "domain": domain,
    "timestamp": datetime.now().isoformat()
})
```

**Tracked Events:**

- `cycle_created`
- `cycle_started`
- `cycle_stopped`
- `document_generated`
- `gap_detected`
- `alignment_violation`

---

## ⚡ Quick Start (5 Steps)

1. **Open Notebook**

   ```python
   # Research_Data_Ecosystem_Integration.ipynb
   ```

2. **Run Setup Cells** (Cells 1-3)

   ```python
   # Initialize environment, telemetry
   ```

3. **Create Cycles** (Cell 32)

   ```python
   created_ids = create_research_cycles()
   ```

4. **View Dashboard** (Cell 32)

   ```python
   display_cycles_dashboard()
   ```

5. **Start Cycles** (Async)

   ```python
   await cycle_engine.start_cycle(cycle_id)
   ```

---

## 🔍 Monitoring

### Check Cycle Status

```python
status = get_cycle_status("cycle_abc123")
print(f"Status: {status['status']}")
print(f"Executions: {status['total_executions']}")
print(f"Success rate: {status['metrics']['success_rate']:.1%}")
```

### Check Engine Metrics

```python
metrics = get_engine_metrics()
print(f"Active cycles: {metrics['active_cycles']}")
print(f"Gaps filled: {metrics['gaps_filled']}")
```

### Stop Cycle

```python
cycle_engine.stop_cycle(cycle_id)
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `RESEARCH_CYCLE_INTEGRATION.md` | Full guide (English) |
| `RESEARCH_CYCLE_INTEGRATION_SQ.md` | Full guide (Albanian) |
| `CYCLE_INTEGRATION_SUMMARY.md` | Integration report |
| `CYCLE_ARCHITECTURE_DIAGRAM.md` | Visual architecture |
| `cycle_engine.py` | Core module code |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cycle not starting | Check cycle status, verify agent availability |
| Document not generated | Check ALBI logs, verify storage targets |
| Gap detection not working | Check ALBI confidence thresholds |
| Telemetry not sending | Verify Alba/Albi/Jona ports open |
| Storage error | Check database connections |

---

## 💡 Examples

### Weekly Digest

```python
digest = create_document_generation_cycle(
    title="Weekly Research Digest",
    sources=["pubmed", "arxiv"],
    frequency="weekly"
)
await cycle_engine.start_cycle(digest)
```

### Real-Time Monitoring

```python
monitor = create_event_cycle(
    event_trigger="anomaly_detected",
    task="alert_and_analyze"
)
await cycle_engine.start_cycle(monitor)
```

### Gap Filling

```python
auto_cycles = auto_detect_and_create_cycles(
    trigger="concept_gap",
    max_cycles=10
)
for cycle in auto_cycles:
    await cycle_engine.start_cycle(cycle.cycle_id)
```

---

## ✅ Status: READY TO USE

**Version**: 1.0.0  
**Updated**: December 15, 2025  
**Integration**: ✅ COMPLETE

---

**🚀 Ready to create cycles! Open the notebook and start!**
