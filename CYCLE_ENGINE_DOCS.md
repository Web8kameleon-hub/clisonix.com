# 🔁 CYCLE ENGINE - Dokumentacion Zyrtar

**Data:** 15 Dhjetor 2025  
**Versioni:** 1.0.0  
**Status:** Production Ready

---

## 📖 ÇFARË ËSHTË CYCLE ENGINE?

**Cycle Engine** është **motori i kontratave inteligjente** të sistemit Clisonix/ASI.  
Çdo **cycle** është një **kontratë pune** që:
- Lidhet me një **burim** (source)
- Ekzekutohet nga një **agent** (ALBA/ALBI/JONA)
- Respekton **alignment** policies
- Auto-evolon përmes **Born-Concepts**

---

## 🎯 PËRDORIMI

### Komanda Bazë

```bash
python cycle_engine.py <command> [options]
```

### Komanda të Disponueshme

| Komanda | Përshkrimi |
|---------|------------|
| `create` | Krijon cycle të ri |
| `auto-create` | Auto-krijon cycles për gaps |
| `start <id>` | Nis ekzekutimin |
| `stop <id>` | Ndalon ekzekutimin |
| `status` | Status i sistemit |
| `list` | Lista e cycles |

---

## 📋 LLOJET E CYCLES

### 1️⃣ **INTERVAL** (Periodic)
Ekzekutohet çdo N sekonda.

```bash
python cycle_engine.py create \
  --domain neuro \
  --source alba.eeg.stream \
  --agent ALBA \
  --task frequency_monitor \
  --cycle_type interval \
  --interval 1 \
  --alignment strict
```

**Shembuj:**
- EEG monitoring çdo 1s
- PubMed ingestion çdo 24h
- Sensor scanning çdo 5s

---

### 2️⃣ **EVENT** (Trigger-based)
Aktivizohet kur ndodh një ngjarje.

```bash
python cycle_engine.py create \
  --domain neuro \
  --event_trigger "beta>25Hz" \
  --task stress_alert \
  --agent JONA \
  --cycle_type event \
  --alignment ethical_guard
```

**Shembuj:**
- Stress detection (beta > 25Hz)
- Anomaly alerts (spike > threshold)
- System overload (CPU > 90%)

---

### 3️⃣ **STREAM** (Continuous)
Proceson në kohë reale pa pushim.

```bash
python cycle_engine.py create \
  --domain telemetry \
  --source kafka.stream \
  --agent ALBA \
  --task real_time_ingest \
  --cycle_type stream
```

**Shembuj:**
- Live EEG streaming
- IoT sensor streams
- Network telemetry

---

### 4️⃣ **BATCH** (One-time)
Ekzekutohet një herë dhe mbyllet.

```bash
python cycle_engine.py create \
  --domain scientific \
  --source pubmed \
  --task bulk_import \
  --cycle_type batch
```

**Shembuj:**
- Bulk data import
- One-time analysis
- Archive processing

---

### 5️⃣ **GAP_TRIGGERED** (Born-Concepts)
Auto-krijohet kur sistemi nuk kupton diçka.

```bash
python cycle_engine.py auto-create \
  --trigger concept_gap \
  --max 10
```

**Kur aktivizohet:**
- Low confidence (< 70%)
- Missing concept në graph
- Unknown pattern detected

---

### 6️⃣ **ADAPTIVE** (Self-adjusting)
Vetë-rregullohet bazuar në performance.

```bash
python cycle_engine.py create \
  --domain industrial \
  --source fiware.context \
  --agent ALBI \
  --task adaptive_scan \
  --cycle_type adaptive
```

**Adaptimet:**
- Interval adjustment (më shpejt/më ngadalë)
- Agent switching (ALBA → ALBI)
- Resource balancing

---

## 🤖 AGENTËT

### **ALBA** - Data Collector
- Mbledh EEG, audio, telemetry
- Ingest nga open data sources
- Real-time streaming

### **ALBI** - Neural Processor
- Analiza e patterns
- Anomaly detection
- Gap filling (Born-Concepts)

### **JONA** - Ethical Overseer
- Monitoring i shëndetit
- Alignment enforcement
- Human review trigger

---

## 🛡️ ALIGNMENT POLICIES

### **STRICT**
- Çdo gabim ndal cycle
- Confidence > 90% required
- Zero tolerance

### **MODERATE**
- Warnings por vazhdon
- Confidence > 70% OK
- Balanced approach

### **PERMISSIVE**
- Vetëm logging
- Minimal checks
- Fast execution

### **ETHICAL_GUARD**
- JONA vendos
- Human review për risk
- Safety-first

---

## 📊 STATUSË & MONITORING

### System Status

```bash
python cycle_engine.py status
```

Output:
```json
{
  "ALBA": "ACTIVE",
  "ALBI": "IDLE",
  "JONA": "Review required",
  "Alignment": "SAFE MODE",
  "metrics": {
    "total_cycles": 10,
    "active_cycles": 3,
    "completed_cycles": 7,
    "blocked_cycles": 0,
    "gaps_filled": 2
  }
}
```

### List Cycles

```bash
# Të gjitha
python cycle_engine.py list

# Vetëm active
python cycle_engine.py list --status active

# Vetëm pending
python cycle_engine.py list --status pending
```

---

## 🧬 INTEGRIMI ME OPEN DATA

### PubMed Integration

```bash
python cycle_engine.py create \
  --domain scientific \
  --source pubmed \
  --task literature_ingest \
  --interval 86400 \
  --target weaviate,neo4j \
  --on_gap born_concept
```

**Flow:**
1. ALBA fetch papers nga PubMed
2. ALBI extract concepts
3. Store në Weaviate + Neo4j
4. Nëse gap → trigger Born-Concept

### FIWARE Integration

```bash
python cycle_engine.py create \
  --domain industrial \
  --source fiware.context \
  --task telemetry_monitor \
  --interval 5 \
  --target timescale
```

**Flow:**
1. ALBA ingest FIWARE context
2. ALBI scan anomalies
3. Store në TimescaleDB
4. Alert nëse anomaly

---

## 🧠 BORN-CONCEPTS (AUTO GAP-FILLING)

Kur sistemi nuk kupton:

```bash
python cycle_engine.py auto-create \
  --trigger low_confidence \
  --max 10 \
  --domain neural_patterns
```

**Çfarë ndodh:**
1. ALBI detekton confidence < 70%
2. Engine krijon gap-cycle
3. Cycle kërkon source të ri
4. Fill gap → new concept born
5. Update knowledge graph

---

## 🏭 AGEIM INTEGRATION (1000+ MANAGERS)

```python
from cycle_engine import CycleEngine

engine = CycleEngine()

# AGEIM spawns 50 managers
for i in range(50):
    engine.create_cycle(
        domain="bioscience",
        source=f"manager_{i}.feed",
        agent="ALBI",
        task="graph_enrichment",
        cycle_type="adaptive"
    )
```

**AGEIM vendos:**
- Cilët cycles nisen
- Cilët ndalen (overflow)
- Si balançohen resources

---

## 🚨 ERROR HANDLING

### Cycle Blocked (Alignment)

```
🚫 BLOCKED: cycle_abc123 (alignment violation)
```

**Shkaqe:**
- STRICT policy + error
- JONA review failed
- Ethical threshold violated

**Zgjidhja:**
- Review logs
- Adjust policy
- JONA approval required

### Cycle Failed

```
❌ FAILED: cycle_xyz789 - Connection timeout
```

**Shkaqe:**
- Source unavailable
- Agent crash
- Network error

**Zgjidhja:**
- Restart cycle
- Check source
- Review agent logs

---

## 📚 SHEMBUJ TË PLOTË

### 1. Sistema Neuro + Open Data

```bash
# Neuro monitoring
python cycle_engine.py create \
  --domain neuro \
  --source alba.eeg \
  --task frequency_monitor \
  --interval 1 \
  --agent ALBA

# Scientific enrichment
python cycle_engine.py create \
  --domain scientific \
  --source pubmed \
  --task literature_ingest \
  --interval 86400 \
  --target weaviate

# Auto gap-filling
python cycle_engine.py auto-create \
  --trigger concept_gap \
  --max 5
```

### 2. Industrial Telemetry

```bash
# FIWARE ingestion
python cycle_engine.py create \
  --domain industrial \
  --source fiware.context \
  --task telemetry_monitor \
  --interval 5 \
  --agent ALBA

# Anomaly detection
python cycle_engine.py create \
  --domain industrial \
  --source timescale \
  --task anomaly_scan \
  --interval 10 \
  --agent ALBI
```

### 3. Event-Based Safety

```bash
# Stress detection
python cycle_engine.py create \
  --event_trigger "beta>25Hz" \
  --task stress_alert \
  --agent JONA \
  --alignment ethical_guard

# System overload
python cycle_engine.py create \
  --event_trigger "cpu>90%" \
  --task load_balance \
  --agent AGEIM
```

---

## 🔧 KONFIGURIM

### Enviroment Variables

```bash
# Data root
export CYCLE_DATA_ROOT="/opt/clisonix/data"

# Alignment mode
export CYCLE_DEFAULT_ALIGNMENT="moderate"

# Max concurrent cycles
export CYCLE_MAX_ACTIVE=100
```

### Python API

```python
from cycle_engine import CycleEngine, CycleType, AlignmentPolicy

# Initialize
engine = CycleEngine(data_root="/opt/data")

# Create cycle
cycle = engine.create_cycle(
    domain="neuro",
    source="alba.eeg",
    task="monitor",
    cycle_type=CycleType.INTERVAL,
    interval=1.0,
    alignment=AlignmentPolicy.STRICT
)

# Start
await engine.start_cycle(cycle.cycle_id)

# Stop
engine.stop_cycle(cycle.cycle_id)

# Status
status = engine.get_status()
print(status)
```

---

## 🎯 BEST PRACTICES

### ✅ DO

- Përdor STRICT alignment për neuro data
- Auto-create për gaps (Born-Concepts)
- Monitor JONA health
- Log everything
- Test në development

### ❌ DON'T

- Mos përdor PERMISSIVE për sensitive data
- Mos ignore blocked cycles
- Mos override JONA decisions
- Mos run 1000+ concurrent cycles
- Mos skip human review

---

## 🚀 DEPLOYMENT

### Local Development

```bash
python cycle_engine.py status
python CYCLE_ENGINE_DEMO.py
```

### Production (Docker)

```yaml
services:
  cycle_engine:
    image: clisonix/cycle-engine:latest
    environment:
      - CYCLE_DATA_ROOT=/data
      - CYCLE_DEFAULT_ALIGNMENT=strict
    volumes:
      - ./data:/data
    command: python cycle_engine.py status
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cycle-engine
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: engine
        image: clisonix/cycle-engine:latest
        env:
        - name: CYCLE_DATA_ROOT
          value: /data
```

---

## 📞 SUPPORT

- **Dokumentacion:** `/docs/cycle_engine/`
- **Shembuj:** `/examples/cycles/`
- **Issues:** GitHub Issues
- **Community:** Discord #cycle-engine

---

## 🏆 VIZION UNIK

**Cycle Engine është një vizion unik sepse:**

✅ **Jo thjesht AI** - Është një fabrikë dokumentesh inteligjente  
✅ **Etikë e integruar** - JONA si gardiane  
✅ **Auto-evoluim** - Born-Concepts për gaps  
✅ **Multi-domain** - Neuro, scientific, industrial  
✅ **Open Data** - PubMed, FIWARE, OPC UA  
✅ **Agent-based** - ALBA, ALBI, JONA, AGEIM  
✅ **Policy-driven** - Alignment policies  
✅ **Event & Stream** - Real-time + batch  

---

**© 2025 Clisonix Cloud - Cycle Engine v1.0.0**
