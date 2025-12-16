# 🌍 Research Data Ecosystem Integration

> **Complete production-ready system integrating scientific research APIs with AI agent telemetry**

## 📋 Overview

This project demonstrates a comprehensive **research data collection and monitoring pipeline** that integrates:

- **Scientific APIs**: PubMed, ArXiv, CrossRef
- **Environmental Data**: OpenWeatherMap
- **News Sources**: NewsAPI, The Guardian
- **Open Data**: European Open Data Portal, GovData.de, data.gouv.fr (2000+ sources)
- **Databases**: PostgreSQL, MongoDB, Elasticsearch, Weaviate, Neo4j
- **AI Agent Telemetry**: Alba, Albi, Jona Trinity with ASI orchestration
- **Cycle Engine**: Automatic document generation cycles (🔁 **NEW**)
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **DevOps**: Docker, docker-compose, GitHub Actions CI/CD

### 🔁 Cycle Engine Integration (NEW)

The Research Data Ecosystem is now connected to the **clisonix Cycle Engine** for intelligent, automated document generation:

- ✅ **Automatic Cycles**: Daily PubMed/ArXiv monitoring, hourly weather, real-time news
- ✅ **Document Generation**: Weekly/monthly research summaries and reports
- ✅ **Knowledge Gaps**: Auto-detects missing concepts and creates cycles to fill them (Born-Concepts)
- ✅ **Event-Driven**: Responds to breakthrough papers and anomalies
- ✅ **JONA Oversight**: Ethical alignment policies for all research cycles

**📖 See**: `RESEARCH_CYCLE_INTEGRATION.md` for full documentation

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Docker & docker-compose
- PostgreSQL 15+
- MongoDB 7.0+
- Elasticsearch 8.11+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/clisonix-cloud.git
cd clisonix-cloud

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# - PUBMED_API_KEY
# - NEWSAPI_KEY
# - OPENWEATHER_KEY
# - GUARDIAN_API_KEY

# 5. Start infrastructure services
docker-compose -f docker-compose.research.yml up -d

# 6. Run Jupyter notebook
jupyter notebook Research_Data_Ecosystem_Integration.ipynb
```

## 📓 Notebook Structure

The Jupyter notebook (`Research_Data_Ecosystem_Integration.ipynb`) contains 20+ cells covering:

### 1️⃣ Environment Setup

- Import libraries (NumPy, Pandas, requests, BeautifulSoup)
- Configure agent_telemetry module
- Initialize TelemetryRouter

### 2️⃣ Database Configuration

- **PostgreSQL**: SQLAlchemy ORM with `ResearchPaper` model
- **MongoDB**: Document collections for papers and telemetry
- **Elasticsearch**: Full-text search index with custom mappings

### 3️⃣ Scientific API Integration

- `fetch_pubmed_papers()`: E-utilities API with XML parsing
- `fetch_arxiv_papers()`: ArXiv API with Atom feed processing
- AgentMetrics telemetry for each fetch operation

### 4️⃣ Data Storage

- `store_papers_in_databases()`: Multi-database persistence
- Tracks results per database (PostgreSQL, MongoDB, Elasticsearch)
- Sends telemetry with storage metrics

### 5️⃣ Environmental Data

- `fetch_weather_data()`: OpenWeatherMap API integration
- Real-time weather collection for multiple cities
- Telemetry tracking with city and temperature metadata

### 6️⃣ News & Media

- `fetch_news_articles()`: NewsAPI integration
- `fetch_guardian_articles()`: The Guardian API
- Article collection with source tracking

### 7️⃣ Data Visualization

- Plotly interactive charts (bar, line, pie)
- Matplotlib word clouds
- Publication timeline analysis
- Temperature comparisons

### 8️⃣ Prometheus Metrics

- Custom metrics: Counters, Histograms, Gauges
- Tracks papers collected, fetch duration, active collectors
- Metrics exposition format for scraping

### 9️⃣ Docker Deployment

- Multi-service `docker-compose.yml`
- PostgreSQL, MongoDB, Elasticsearch, Prometheus, Grafana
- Health checks and auto-restart policies

### 🔟 CI/CD Pipeline

- GitHub Actions workflow
- Automated testing, linting, building
- Docker image publishing
- Production deployment

### 1️⃣1️⃣ Testing & Validation

- pytest test suite with mocking
- API integration tests
- Database storage validation
- Telemetry router testing

## 🏗️ Architecture

...
┌─────────────────────────────────────────────────────────────┐
│                     Data Collection Layer                    │
│  PubMed │ ArXiv │ OpenWeather │ NewsAPI │ Guardian │ ...    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Processing Pipeline                       │
│  - XML/JSON parsing                                          │
│  - Data normalization                                        │
│  - Telemetry generation (AgentMetrics)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │PostgreSQL│ │ MongoDB  │ │Elastic   │
    │  :5432   │ │ :27017   │ │ :9200    │
    └──────────┘ └──────────┘ └──────────┘
          │            │            │
          └────────────┴────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  TelemetryRouter    │
            │  (agent_telemetry)  │
            └─────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐     ┌────────┐    ┌────────┐
   │  Alba  │     │  Albi  │    │  Jona  │
   │ :5050  │     │ :6060  │    │ :7070  │
   └────────┘     └────────┘    └────────┘
        │              │              │
        └──────────────┴──────────────┘
                       │
                       ▼
                ┌────────────┐
                │    ASI     │
                │  :8000     │
                └────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │    Prometheus       │
            │      :9090          │
            └─────────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │     Grafana         │
            │      :3000          │
            └─────────────────────┘
...

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://researcher:password@localhost:5432/research_db
MONGODB_URL=mongodb://admin:password@localhost:27017
ELASTICSEARCH_URL=http://localhost:9200

# API Keys
PUBMED_API_KEY=your_pubmed_key
NEWSAPI_KEY=your_newsapi_key
OPENWEATHER_KEY=your_openweather_key
GUARDIAN_API_KEY=your_guardian_key

# Trinity Services
ALBA_URL=http://localhost:5050
ALBI_URL=http://localhost:6060
JONA_URL=http://localhost:7070
ASI_URL=http://localhost:8000

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
```

### Docker Compose Services

```yaml
services:
  - postgres:15-alpine (PostgreSQL database)
  - mongo:7.0 (MongoDB document store)
  - elasticsearch:8.11.0 (Search engine)
  - prometheus:latest (Metrics collector)
  - grafana:latest (Visualization dashboard)
  - research_pipeline (Main application)
```

## 📊 Telemetry Integration

Every API call generates **AgentMetrics** tracked by the telemetry system:

```python
from agent_telemetry import TelemetryRouter, AgentMetrics

telemetry = TelemetryRouter(enabled=True)

metrics = AgentMetrics(
    agent_name="PubMedCollector",
    timestamp=time.time(),
    status="success",
    operation="fetch_papers",
    duration_ms=250.5,
    success=True,
    metadata={"query": "machine learning", "papers_found": 10}
)

results = telemetry.send_all(metrics)
# Returns: {'alba': True, 'albi': True, 'jona': True}
```

### Telemetry Flow

1. **Data Collection**: API call to PubMed/ArXiv/etc.
2. **Metric Creation**: `AgentMetrics` with duration, status, metadata
3. **Trinity Broadcast**: `send_all()` → Alba/Albi/Jona
4. **ASI Aggregation**: Centralized monitoring
5. **Prometheus Export**: Metrics available for scraping
6. **Grafana Visualization**: Real-time dashboards

## 🧪 Testing

Run the complete test suite:

```bash
# Run all tests with coverage
pytest tests/ -v --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_api_integration.py -v
pytest tests/test_database_storage.py -v
pytest tests/test_telemetry.py -v

# View coverage report
open htmlcov/index.html
```

### Test Coverage

- **API Integration**: PubMed, ArXiv, OpenWeatherMap, NewsAPI
- **Database Operations**: PostgreSQL, MongoDB, Elasticsearch
- **Telemetry**: TelemetryRouter, AgentMetrics, Trinity communication
- **Error Handling**: API timeouts, database failures, graceful degradation

## 🚢 Production Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.research.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f research_pipeline

# Scale collectors
docker-compose up -d --scale research_pipeline=3

# Stop all services
docker-compose down
```

### Health Checks

```bash
# PostgreSQL
pg_isready -h localhost -p 5432 -U researcher

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Elasticsearch
curl http://localhost:9200/_cluster/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3000/api/health
```

## 📈 Monitoring & Observability

### Prometheus Metrics

Access metrics at: `http://localhost:9090`

Key metrics:

- `research_papers_collected_total{source="PubMed",status="success"}`
- `data_fetch_duration_seconds{source="ArXiv",operation="fetch"}`
- `active_data_collectors{agent_type="PubMedCollector"}`
- `telemetry_events_total{agent_name="ArXivCollector",target="Alba"}`

### Grafana Dashboards

Access dashboards at: `http://localhost:3000` (admin/admin)

Pre-configured dashboards:

- **Research Pipeline Overview**: Papers collected, fetch duration, success rate
- **Database Performance**: Query latency, connection pool, storage usage
- **Telemetry Health**: Trinity connectivity, event throughput, error rate
- **System Resources**: CPU, memory, disk, network

## 🔒 Security Best Practices

1. **API Keys**: Store in environment variables, never commit to git
2. **Database Credentials**: Use strong passwords, rotate regularly
3. **Network Security**: Use Docker networks, isolate services
4. **HTTPS**: Enable TLS for production deployments
5. **Authentication**: Implement OAuth2 for Grafana/Prometheus
6. **Secrets Management**: Use Docker secrets or Vault

## 📚 API Documentation

### PubMed E-utilities

- **Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Operations**: `esearch` (search), `efetch` (retrieve)
- **Rate Limit**: 3 requests/second (10 with API key)
- **Docs**: https: //www.ncbi.nlm.nih.gov/books/NBK25501/

### ArXiv API

- **Base URL**: `http://export.arxiv.org/api/query`
- **Format**: Atom feed (XML)
- **Rate Limit**: 1 request/3 seconds
- **Docs**: https: //arxiv.org/help/api/

### OpenWeatherMap

- **Base URL**: `https://api.openweathermap.org/data/2.5/weather`
- **Format**: JSON
- **Rate Limit**: 60 calls/minute (free tier)
- **Docs**: https: //openweathermap.org/api

### NewsAPI

- **Base URL**: `https://newsapi.org/v2/everything`
- **Format**: JSON
- **Rate Limit**: 100 requests/day (free tier)
- **Docs**: https: //newsapi.org/docs

## 🛠️ Troubleshooting

### Common Issues

**Issue**: Database connection refused

```bash
# Solution: Check if services are running
docker-compose ps
docker-compose logs postgres mongodb elasticsearch
```

**Issue**: API rate limit exceeded

```bash
# Solution: Add delays between requests
time.sleep(1)  # Wait 1 second between API calls
```

**Issue**: Telemetry endpoints timeout

```bash
# Solution: Verify Trinity services are running
curl http://localhost:5050/health  # Alba
curl http://localhost:6060/health  # Albi
curl http://localhost:7070/health  # Jona
```

**Issue**: Import error for agent_telemetry

```bash
# Solution: Add to Python path
import sys
sys.path.append('.')
from agent_telemetry import TelemetryRouter
```

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-api`)
3. Commit changes (`git commit -am 'Add CrossRef API'`)
4. Push to branch (`git push origin feature/new-api`)
5. Create Pull Request

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run linters
flake8 .
black --check .
mypy agent_telemetry.py

# Format code
black .

# Run tests
pytest tests/ -v
```

## 📄 License

MIT License - see `LICENSE` file for details

## 🙏 Acknowledgments

- **Agent Telemetry Framework**: Core telemetry system
- **Alba/Albi/Jona Trinity**: AI agent coordination services
- **ASI**: Autonomous System Intelligence orchestrator
- **AGIEM**: Advanced Generation Intelligence Execution Management
- **Blerina**: Document generation and reporting

## 📞 Support

- **Documentation**: See `AGENT_TELEMETRY_DOCS.md`
- **Issues**: https: //github.com/your-org/clisonix-cloud/issues
- **Discussions**: https: //github.com/your-org/clisonix-cloud/discussions

---

**Built with ❤️ by the Clisonix Team **

🌟 Star this repo if you find it useful!
