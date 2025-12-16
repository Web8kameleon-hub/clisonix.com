# 🔁 Integrimi i Cycle Engine me Research Data Ecosystem

## Çfarë u realizua?

Sistemi i Research Data Ecosystem tani është i lidhur plotësisht me **Cycle Engine** – motorin e clisonix që krijon dokumente automatikisht.

## Si funksionon?

### 1. Cycles (Ciklet e Punës)

Çdo cycle është një kontratë pune inteligjente që:
- Mbledh të dhëna nga burime (PubMed, ArXiv, Weather, News)
- Gjeneron dokumente automatikisht (raporte javore, mujore)
- Zbulon boshllëqe në njohuritë (knowledge gaps)
- Krijon cikle të reja automatikisht për të mbushur boshllëqet

### 2. Llojet e Cycles

#### INTERVAL (Periodike)
Ekzekutohen në intervale të rregullta:
- **Çdo orë**: Të dhëna moti
- **Çdo ditë**: Artikuj PubMed, ArXiv
- **Çdo javë**: European Open Data
- **Çdo muaj**: Raporte komprehensive

#### EVENT (Të shkaktuara nga ngjarje)
Ekzekutohen kur ndodh diçka e rëndësishme:
- Artikull revolucionar i publikuar
- Anomali e zbuluar
- Boshllëk në njohuri i identifikuar

#### STREAM (Të vazhdueshme)
Punojnë pa pushim:
- Lajme në kohë reale
- Monitorim live

#### GAP-TRIGGERED (Born-Concepts)
Krijohen automatikisht kur:
- ALBI ka besim të ulët (<70%)
- Mungon një koncept në knowledge graph
- Nevojiten të dhëna të reja

## Cycles të para-konfiguruar

Sistemi vjen me 7 cycles të gatshme:

1. **pubmed_daily** - Artikuj medicinë çdo 24 orë
2. **arxiv_daily** - Artikuj shkencë çdo 24 orë
3. **weather_hourly** - Moti çdo orë
4. **news_realtime** - Lajme live
5. **european_data_weekly** - Open Data çdo javë
6. **research_report_monthly** - Raport mujor
7. **knowledge_gap_detection** - Zbulim boshllëqesh çdo 2 ditë

## Si të përdoret?

### Hapi 1: Krijo të gjitha cycles

```python
# Hap notebook-un: Research_Data_Ecosystem_Integration.ipynb
# Ekzekuto këtë cell:

created_ids = create_research_cycles()
# ✓ Krijon 7 cycles automatikisht
```

### Hapi 2: Shiko dashboard-in

```python
display_cycles_dashboard()

# Tregon:
# - Sa cycles janë aktive
# - Cilat janë në pritje
# - Sa dokumente janë gjeneruar
```

### Hapi 3: Krijo cycle custom

```python
# Për të gjeneruar një dokument automatik çdo javë:

doc_cycle_id = create_document_generation_cycle(
    title="Përmbledhje Javore e Kërkimit",
    sources=["pubmed", "arxiv"],
    frequency="weekly"  # ose: hourly, daily, monthly
)
```

### Hapi 4: Krijo cycle për ngjarje

```python
# Për të reaguar kur ndodh diçka:

event_cycle_id = create_event_cycle(
    event_trigger="artikull_i_rëndësishëm",
    task="analizo_menjëherë"
)
```

### Hapi 5: Zbulo boshllëqe automatikisht

```python
# Sistemi gjen vetë se çfarë mungon dhe krijon cycles:

auto_cycles = auto_detect_and_create_cycles(
    trigger="low_confidence",  # kur ALBI nuk është i sigurt
    max_cycles=5
)
```

## Agjentët (Agents)

### ALBA 🔵 - Mbledhësi i të dhënave
- Mbledh artikuj nga PubMed, ArXiv
- Monitoron motin dhe lajmet
- Mbush bazat e të dhënave

### ALBI 🟣 - Analizuesi dhe shkruesi
- Gjeneron raporte mujore
- Krijon përmbledhje dokumentesh
- Zbulon boshllëqe në njohuri

### JONA 🟡 - Mbikëqyrësi etik
- Siguron që kërkimi është etik
- Bllokon cycles problematike
- Kërkon aprovim njerëzor kur nevojitet

## Ku ruhen të dhënat?

Çdo cycle ruan të dhënat në:

- **PostgreSQL** - Të dhëna të strukturuara
- **MongoDB** - Dokumente dhe raporte
- **Elasticsearch** - Kërkim në tekst
- **Weaviate** - Vektorë për AI
- **Neo4j** - Graf i njohurive
- **Local files** - Dokumente të gjeneruar

## Shembuj praktikë

### Raporti javor automatik

```python
# 1. Krijo cycle
cycle = create_document_generation_cycle(
    title="Raporti Javor i Kërkimit Mjekësor",
    sources=["pubmed"],
    frequency="weekly"
)

# 2. Nis cycle
await cycle_engine.start_cycle(cycle)

# 3. Dokumenti gjenerohet automatikisht çdo të diel
# Ruhet në: data/cycles/.../Raporti-Javor-i-Kërkimit-Mjekësor.md
```

### Zbulimi i artikujve revolucionarë

```python
# Krijon cycle që reagon automatikisht:
breakthrough = create_event_cycle(
    event_trigger="artikull_me_impakt_të_lartë",
    task="analizo_dhe_gjenero_raport"
)

# Kur ArXiv publikon artikull me skor > 9.5:
# 1. Cycle aktivizohet automatikisht
# 2. ALBA mbledh artikullin
# 3. ALBI e analizon
# 4. JONA shikon për etikë
# 5. Raporti gjenerohet dhe ruhet
```

### Mbushja e boshllëqeve

```python
# ALBI zbulon: "Mungon koncepti: quantum_neural_interface"

# Sistemi automatikisht:
auto_cycles = auto_detect_and_create_cycles(trigger="concept_gap")

# 1. Krijon cycle të ri
# 2. Kërkon në PubMed, ArXiv
# 3. Mbledh artikuj relevantë
# 4. Analizon dhe e shton në knowledge graph
# 5. Koncepti "lind" (Born-Concept)
```

## Monitorimi

### Shiko gjendjen e një cycle

```python
status = get_cycle_status(cycle_id)

print(f"Status: {status['status']}")
print(f"Ekzekutime totale: {status['total_executions']}")
print(f"Të dhëna të procesuara: {status['metrics']['total_data_processed']}")
```

### Shiko metrikat gjenerale

```python
metrics = get_engine_metrics()

print(f"Cycles totale: {metrics['total_cycles']}")
print(f"Aktive: {metrics['active_cycles']}")
print(f"Boshllëqe të mbusha: {metrics['gaps_filled']}")
```

## Dashboard shembull

```
================================================================================
📊 DASHBOARD I CYCLES TË KËRKIMIT
================================================================================

🔹 KËRKIM MJEKËSOR
--------------------------------------------------------------------------------
  ▶️ cycle_a3f5b891
     Detyrë: literature_ingest (çdo 1 ditë)
     Burim: pubmed → Agjent: ALBA

🔹 KËRKIM SHKENCOR
--------------------------------------------------------------------------------
  ▶️ cycle_c1d9f3a2
     Detyrë: preprint_monitor (çdo 1 ditë)
     Burim: arxiv → Agjent: ALBA

🔹 DOKUMENTIM
--------------------------------------------------------------------------------
  ⏸️ cycle_d5a7e2b9
     Detyrë: monthly_report_generation (çdo 30 ditë)
     Burim: all_research_sources → Agjent: ALBI

================================================================================
📈 METRIKA
--------------------------------------------------------------------------------
  Cycles Totale: 7
  Aktive: 3
  Në pritje: 2
  Të kompletuara: 2
================================================================================
```

## Përfitimet

✅ **Automatizim i plotë** - Nuk duhet të mbledhësh të dhëna manualisht  
✅ **Inteligjencë** - Zbulon vetë se çfarë mungon  
✅ **Etikë** - JONA siguron që gjithçka është e drejtë  
✅ **Multi-storage** - Të dhënat ruhen në disa vende  
✅ **Real-time** - Monitoron gjithçka live  
✅ **Fleksibilitet** - Mund të krijosh çdo lloj cycle  
✅ **Telemetri** - Sheh gjithçka që ndodh  
✅ **Skalabël** - Mund të krijosh mijëra cycles  

## Si të fillosh?

### Metoda e shpejtë (5 minuta)

```python
# 1. Hap notebook-un
# Research_Data_Ecosystem_Integration.ipynb

# 2. Ekzekuto cells 28-32 (Cycle Engine Integration)

# 3. Krijo të gjitha cycles
created_ids = create_research_cycles()

# 4. Shiko dashboard-in
display_cycles_dashboard()

# 5. Gata! Cycles janë duke punuar
```

### Metoda e detajuar

1. **Lexo dokumentacionin**: `RESEARCH_CYCLE_INTEGRATION.md`
2. **Shiko shembujt**: `CYCLE_ENGINE_DEMO.py`
3. **Hap notebook-un**: `Research_Data_Ecosystem_Integration.ipynb`
4. **Ekzekuto cells**: 28-33 (Cycle Engine Integration)
5. **Krijo cycles**: `create_research_cycles()`
6. **Monitoron**: `display_cycles_dashboard()`
7. **Shiko outputet**: `data/cycles/`

## Struktura e file-ve

```
data/
└── cycles/
    ├── pubmed_daily/
    │   ├── executions/          # Ekzekutime
    │   └── outputs/             # Dokumentet e gjeneruar
    ├── research_report_monthly/
    │   └── outputs/
    │       ├── Janar-2025.md
    │       ├── Shkurt-2025.md
    │       └── Mars-2025.md
    └── knowledge_gap_detection/
        ├── executions/
        └── detected_gaps.json   # Boshllëqet e zbuluara
```

## Telemetri dhe Monitorim

Çdo operacion i cycle dërgohet në Trinity (Alba, Albi, Jona):

```python
telemetry_router.send_all({
    "event": "cycle_created",
    "cycle_id": "cycle_abc123",
    "domain": "biomedical_research",
    "timestamp": "2025-12-15T10:30:00Z"
})
```

**Ngjarje të monitoruara:**
- Krijimi i cycles
- Fillimi/ndalimi i ekzekutimit
- Gjenerimi i dokumenteve
- Zbulimi i boshllëqeve
- Probleme etike
- Ruajtja e të dhënave

## Politikat e Alignment

Cycles respektojnë rregulla etike:

| Politika | Përshkrimi | Përdorimi |
|----------|-----------|-----------|
| `STRICT` | Çdo gabim ndal cycle-in | Kërkim mjekësor |
| `MODERATE` | Warning por vazhdon | Kërkim i përgjithshëm |
| `PERMISSIVE` | Vetëm log | Monitorim ambiental |
| `ETHICAL_GUARD` | JONA vendos | Tema sensitive |

## Pyetje të shpeshta

### Si të ndal një cycle?

```python
cycle_engine.stop_cycle(cycle_id)
```

### Si të ndryshoj frekuencën?

```python
# Modifiko cycle definition:
cycle_engine.cycles[cycle_id].interval = 3600  # 1 orë
```

### Si të shoh dokumentet e gjeneruar?

```python
# Në filesystem:
# data/cycles/{cycle_name}/outputs/

# Në MongoDB:
db.generated_documents.find({"cycle_id": cycle_id})
```

### Si të krijoj cycle për burim të ri?

```python
custom_cycle = cycle_engine.create_cycle(
    domain="custom_domain",
    source="my_api",
    agent="ALBA",
    task="custom_task",
    cycle_type="interval",
    interval=7200,  # 2 orë
    alignment="moderate",
    target=["postgresql", "mongodb"]
)
```

## Mbështetje

- **Dokumentacion i plotë**: `RESEARCH_CYCLE_INTEGRATION.md` (anglisht)
- **API Reference**: `cycle_engine.py`
- **Shembuj**: `CYCLE_ENGINE_DEMO.py`
- **Notebook**: `Research_Data_Ecosystem_Integration.ipynb` (cells 28-33)
- **Telemetri**: `agent_telemetry.py`

## Statusi

✅ **INTEGRIMI I PLOTË**  
📅 **Data**: 15 Dhjetor 2025  
🔢 **Versioni**: 1.0.0  
👥 **Ekipi**: clisonix

---

**Gatshëm për të përdorur!** 🚀

Hap notebook-un dhe fillo të krijosh cycles automatike për kërkimin tënd!
