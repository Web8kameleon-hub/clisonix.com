# Global Open Data API Plan

## 1. Catalog & Governance

- Establish a master catalog (Postgres table `knowledge_sources`) with columns: `id`, `name`, `category`, `license`, `access_model`, `ingest_type`, `refresh_interval`, `target_store`, `status`, `notes`.
- Seed catalog with the datasets/APIs below. Use airflow DAG `catalog_sync` to revalidate access keys and schema drift weekly.

| Name | Domain | Access | License | Target Store | Notes |
| --- | --- | --- | --- | --- | --- |
| OpenAlex | Scientific literature | REST | CC BY | Weaviate (vector) + Neo4j | Pull works + concepts, citation graph. |
| Semantic Scholar | Scientific literature | REST (key) | Non-commercial | Weaviate | Focus computer science + biomed. |
| ArXiv | Preprint literature | REST | CC BY | Object storage + Weaviate | Store PDFs in cold tier, embeddings only. |
| PubMed / PubMed Central | Biomedical | REST | Public | Weaviate + Neo4j | Use Entrez utilities, map MeSH terms. |
| ClinicalTrials.gov | Clinical research | REST | Public | Postgres | Track statuses, interventions, outcomes. |
| CrossRef | DOIs | REST | CC0 | Neo4j | Maintain DOI metadata and citations. |
| WHO IRIS | Global health | REST | CC BY | Weaviate | International policy docs. |
| OpenFDA | Pharmaceutical | REST | CC0 | Postgres + Neo4j | Drugs, devices, adverse events. |
| WHO ATC/DDD | Pharma classification | Download | CC BY-NC-SA | Postgres | Mapping drug classes. |
| DrugBank (open subset) | Pharmaceutical | CSV | Custom | Neo4j | Check licensing before production. |
| EMA Open Data | Pharmaceutical | REST | CC BY | Postgres | European product info. |
| NIH Gene | Bioscience | REST | Public | Neo4j | |
| Ensembl | Genomics | REST | Apache 2.0 | Neo4j | Genes, transcripts. |
| PDB | Structural biology | Download | CC0 | Object storage | Store mmCIF in cold tier, metadata in Neo4j. |
| Allen Brain Atlas | Neuroscience | REST | CC BY | Postgres + object storage | Expression data. |
| Human Cell Atlas | Bioscience | REST | CC BY | Postgres | Cell type annotations. |
| FIWARE Context Broker | Industrial telemetry | MQTT/REST | Varies | TimescaleDB | Connect via FIWARE Orion. |
| Eclipse Ditto | IoT digital twins | WebSocket | EPL | TimescaleDB | Manage twin states. |
| OPC UA Historians | Industrial telemetry | OPC UA | Varies | TimescaleDB | Use open62541 client. |
| OpenPLC Logs | Industrial control | Files | GPL | TimescaleDB | Parse logs for control signals. |
| NOAA Climate Data | Environmental | REST | Public | Postgres | Environmental context for analytics. |
| World Bank Data | Economic | REST | CC BY | Postgres | Macro indicators for correlations. |

## 2. Ingestion Pipeline Architecture

- **Batch (literature/bioscience)**: Apache Airflow DAGs calling domain-specific operators (ArXivOperator, PubMedOperator, etc.). Persist raw dumps to `s3://knowledge-raw/` (or MinIO equivalent); transform into Parquet for analytics and embeddings.
- **Streaming (telemetry)**: Apache Kafka with connectors:
  - `fiware-source` → Kafka topic `telemetry.fiware.*`
  - `opcua-source` → Kafka topic `telemetry.opcua.*`
  - `openplc-filebeat` → Kafka topic `telemetry.openplc`
  - Stream processing via Kafka Streams / Flink to normalize units, enrich with metadata, and write to TimescaleDB + InfluxDB.
- **Transformation layer**: Dagster or dbt for schema harmonization and quality checks (freshness, null ratios). Emit metrics to Prometheus.
- **Embedding services**: Use `sentence-transformers` (SciBERT, BioClinicalBERT) for literature; `OpenAI text-embedding-3-large` fallback. Deploy as batch workers via Ray for scale.

## 3. Storage & Indexing

- **Vector Store**: Weaviate cluster (`class ScientificDocument`, `ClinicalDocument`, `PolicyDocument`).
- **Graph Store**: Neo4j Aura or self-hosted; model nodes (`Publication`, `Trial`, `Drug`, `Gene`, `TelemetryNode`, `Concept`) with relationships (e.g., `CITES`, `TREATS`, `EXPRESSES`, `MEASURES`).
- **Time-Series DB**: TimescaleDB for high-cardinality telemetry; retention policies per source. Use continuous aggregates for dashboards.
- **Object Storage**: MinIO buckets for PDFs, datasets >10MB. Include metadata tags linking to Neo4j nodes.
- **Relational**: Postgres for catalog tables, normalized clinical/pharma data when graph not needed.

## 4. API Fabric

- Implement FastAPI service `services/knowledge-api` with routers:
  - `/search/scientific` → vector search in Weaviate
  - `/search/bio` → combination of Weaviate + Neo4j path queries
  - `/telemetry/{source}` → TimescaleDB query with downsampling
  - `/clinical/drugs`, `/clinical/trials` → Postgres + Neo4j hybrid queries
  - `/concepts/gaps` → pipeline described below
- Auto-generate OpenAPI specs, publish to Kong API Gateway for routing, auth, rate limiting.
- Use Keycloak for identity (OIDC), integrate with Kong via OIDC plugin.
- Observability: instrument with OpenTelemetry SDK, export traces to Jaeger, metrics to Prometheus. Grafana dashboards per service.

## 5. Born-Concepts Module

- **Input signals**:
  - Query failures (no results, low confidence) captured from API responses.
  - Knowledge gaps from telemetry anomaly detectors.
  - SME feedback ingestion via `/feedback` endpoint.
- **Processing**:
  - Aggregate unresolved concepts into `concept_gap_queue` (Postgres table).
  - Nightly job runs topic modeling (BERTopic) + graph community detection (Louvain) over relevant docs.
  - Generate candidate summaries via LLM orchestrator (LangChain + local Llama 3 or Azure OpenAI), storing outputs in `concept_proposals` table.
  - Trigger review workflow: Alba (scientific), Albi (industrial), Jona (decision). Provide UI in admin dashboard to accept/reject.
- **Outputs**:
  - Accepted concepts become new Neo4j nodes (`Concept`) with provenance.
  - Publish to `/concepts/new` API for downstream consumption.

## 6. Deployment & Ops

- Containerize services (FastAPI, ingest workers, embedding jobs) via Docker Compose / Kubernetes.
- CI/CD:
  - GitHub Actions pipeline stages: lint/test → build images → deploy to staging → data quality checks → promote.
  - Use dbt tests, Great Expectations for schema validation.
- Data governance:
  - Track lineage in OpenMetadata or DataHub (Airflow sends metadata).
  - Store licenses in catalog; enforce usage restrictions with policy engine (OPA) before responding to API requests.
- Backups & DR:
  - Daily snapshots for Postgres/Timescale/Neo4j. Version raw dumps in object storage.

## 7. Next Steps Checklist

1. Approve dataset list and licenses with legal/compliance.
2. Set up infrastructure: Kafka, Airflow, Weaviate, Neo4j, Timescale, object storage, Prometheus/Grafana, Kong, Keycloak.
3. Implement catalog database and seed with entries above.
4. Develop initial Airflow DAGs for OpenAlex, PubMed, FIWARE test feeds.
5. Stand up FastAPI skeleton with `/health`, `/catalog/sources` endpoints.
6. Prototype Born-Concepts module on a subset (e.g., PubMed + FIWARE anomalies).
7. Integrate Alba/Albi/Jona agents via shared API client library.

## 8. Agent Orchestration (ASI, Alba, Albi, Jona)

- **ASI Core**: Acts as orchestration layer. Subscribes to Kong event hooks and Prometheus alerts; dispatches work toward Alba (scientific reasoning), Albi (industrial intelligence), and Jona (decision synthesis). Maintains state in Redis Streams `asi.dispatch.*` and persists mission logs to Postgres table `asi_runs`.
- **Alba (Scientific Intelligence)**: Consumes `/search/scientific`, `/search/bio`, and `/concepts/new`. Implements caching strategy with Weaviate query fingerprints. Publishes validated findings to Kafka topic `insights.science` for Jona.
- **Albi (Industrial Intelligence)**: Streams `/telemetry/*` responses plus Born-Concepts signals related to control systems. Runs anomaly detection (Merlion or Kats) and feeds recommended actuator changes to Kafka topic `insights.industrial`.
- **Jona (Decision Engine)**: Listens to both insight topics, merges with `/clinical/*` and policy data before drafting decisions via `decision-system.ts`. Exposes consolidated recommendations through `/asi/decisions` API and notifies ASI Core through WebSocket callback.
- **Feedback Loop**: All agents call `/feedback` to report low-confidence outputs; ASI aggregates into `concept_gap_queue` to drive Born-Concepts module. Accepted concepts propagate back to agents through nightly config sync (ConfigMap or SSM Parameter Store).
- **Security & Audit**: Keycloak roles `asi-core`, `alba-agent`, `albi-agent`, `jona-engine` restrict endpoint access. OPA policies ensure data sovereignty (e.g., EU datasets for EU nodes). SIEM integration (Elastic/Graylog) logs every cross-agent exchange.
- **Deployment Alignment**: Package agents as separate services; use shared protobuf/JSON schema for insight events. Helm chart `charts/asi-suite` coordinates rollout, with health checks hitting new `/health/agent/{name}` endpoints.

---
This plan covers ingestion, storage, API exposure, and the concept gap workflow so the Alba, Albi, Jona, and ASI agents can generate and serve new APIs built on global open knowledge sources.
