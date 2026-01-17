"""
OCEAN CORE 8030 - CONFIGURATION
================================
Centralized configuration for all Ocean Core systems
"""

import os
from enum import Enum

# ============================================================================
# ENVIRONMENT
# ============================================================================

ENV = os.getenv("ENVIRONMENT", "production")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# ============================================================================
# SERVICE CONFIGURATION
# ============================================================================

SERVICE_NAME = "Curiosity Ocean 8030"
SERVICE_VERSION = "2.0.0"
SERVICE_PORT = int(os.getenv("OCEAN_CORE_PORT", "8030"))
SERVICE_HOST = os.getenv("OCEAN_CORE_HOST", "0.0.0.0")

# ============================================================================
# DATA SOURCES CONFIGURATION
# ============================================================================

class DataSourceConfig:
    """Configuration for data sources"""
    
    # Location Labs
    LOCATION_LABS_ENABLED = True
    LOCATION_LABS_LABS = [
        "Elbasan", "Tirana", "Durrës", "Shkodër", "Vlorë", 
        "Korça", "Sarandë", "Prishtina", "Kostur", 
        "Athens", "Rome", "Zurich"
    ]
    
    # Agent Telemetry
    AGENT_TELEMETRY_ENABLED = True
    AGENTS = ["alba", "albi", "blerina", "agiem", "asi"]
    
    # Cycle Data
    CYCLE_DATA_ENABLED = True
    
    # Excel Data
    EXCEL_DATA_ENABLED = True
    
    # System Metrics
    SYSTEM_METRICS_ENABLED = True

# ============================================================================
# EXTERNAL API CONFIGURATION
# ============================================================================

class ExternalAPIsConfig:
    """Configuration for external APIs"""
    
    # API Timeouts (seconds)
    DEFAULT_TIMEOUT = 10
    WIKIPEDIA_TIMEOUT = 15
    ARXIV_TIMEOUT = 15
    PUBMED_TIMEOUT = 20
    GITHUB_TIMEOUT = 15
    DBPEDIA_TIMEOUT = 20
    
    # Result limits
    DEFAULT_LIMIT = 5
    MAX_LIMIT = 20
    
    # APIs
    WIKIPEDIA_ENABLED = True
    ARXIV_ENABLED = True
    PUBMED_ENABLED = True
    GITHUB_ENABLED = True
    DBPEDIA_ENABLED = True
    
    # Retry configuration
    RETRY_ATTEMPTS = 2
    RETRY_DELAY = 1  # seconds

# ============================================================================
# QUERY PROCESSOR CONFIGURATION
# ============================================================================

class QueryProcessorConfig:
    """Configuration for query processing"""
    
    # Intent detection - keyword patterns
    ENABLE_INTENT_DETECTION = True
    ENABLE_ENTITY_EXTRACTION = True
    ENABLE_POLICY_FILTERING = True
    
    # Policy rules
    PROHIBITED_KEYWORDS = [
        "password", "api_key", "secret", "token", "credential",
        "customer_data", "personal_data", "pii", "ssn"
    ]
    
    # Entity recognition
    KNOWN_LABS = [
        "Elbasan", "Tirana", "Durrës", "Shkodër", "Vlorë",
        "Korça", "Sarandë", "Prishtina", "Kostur",
        "Athens", "Rome", "Zurich"
    ]
    
    KNOWN_AGENTS = ["alba", "albi", "blerina", "agiem", "asi"]
    KNOWN_DOMAINS = [
        "university", "medical", "research", "marine",
        "agricultural", "ecological", "tech"
    ]

# ============================================================================
# KNOWLEDGE ENGINE CONFIGURATION
# ============================================================================

class KnowledgeEngineConfig:
    """Configuration for knowledge engine"""
    
    # Source weighting (0.0 - 1.0)
    INTERNAL_WEIGHT = 1.0
    EXTERNAL_WEIGHT = 0.5
    
    # Aggregation
    PARALLEL_QUERIES = True
    CACHE_RESPONSES = True
    CACHE_TTL_SECONDS = 300
    
    # Response generation
    INCLUDE_CURIOSITY_THREADS = True
    MAX_FINDINGS = 10
    MIN_CONFIDENCE = 0.3

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": LOG_LEVEL,
            "formatter": "default"
        }
    },
    "root": {
        "level": LOG_LEVEL,
        "handlers": ["console"]
    }
}

# ============================================================================
# API ENDPOINTS
# ============================================================================

ENDPOINTS = {
    "root": "/",
    "status": "/api/status",
    "sources": "/api/sources",
    "query": "/api/query",
    "labs": "/api/labs",
    "agents": "/api/agents",
    "threads": "/api/threads/{topic}",
    "health": "/health",
    "docs": "/api/docs",
    "openapi": "/api/openapi.json"
}

# ============================================================================
# INTEGRATION WITH MAIN.PY
# ============================================================================

# If running with main.py proxy
MAIN_API_URL = os.getenv("MAIN_API_URL", "http://localhost:8000")
OCEAN_CORE_URL = os.getenv("OCEAN_CORE_URL", f"http://localhost:{SERVICE_PORT}")

# Proxy settings
PROXY_ENABLED = os.getenv("PROXY_ENABLED", "true").lower() == "true"
PROXY_TIMEOUT = int(os.getenv("PROXY_TIMEOUT", "30"))

# ============================================================================
# SECURITY
# ============================================================================

CORS_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:8030",
    "http://localhost:3000",
    "*"  # Allow all for development
]

ALLOW_CREDENTIALS = True
ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
ALLOW_HEADERS = ["*"]

# ============================================================================
# PERFORMANCE TUNING
# ============================================================================

# Connection pooling
CONNECTION_POOL_SIZE = 10
CONNECTION_POOL_TIMEOUT = 30

# Request processing
MAX_CONCURRENT_QUERIES = 50
QUERY_QUEUE_SIZE = 100
QUERY_TIMEOUT = 30  # seconds

# ============================================================================
# TESTING
# ============================================================================

TEST_MODE = os.getenv("TEST_MODE", "false").lower() == "true"

# Test data
TEST_QUERIES = [
    "What labs do we have?",
    "How are ALBA and ALBI performing?",
    "What is the status of our system?",
    "What is consciousness?"
]

# ============================================================================
# FEATURE FLAGS
# ============================================================================

class FeatureFlags:
    """Feature toggles"""
    
    ENABLE_LOCATION_LABS = True
    ENABLE_AGENT_TELEMETRY = True
    ENABLE_WIKIPEDIA_INTEGRATION = True
    ENABLE_ARXIV_INTEGRATION = True
    ENABLE_PUBMED_INTEGRATION = True
    ENABLE_GITHUB_INTEGRATION = True
    ENABLE_CURIOSITY_THREADS = True
    ENABLE_RESPONSE_CACHING = True
    ENABLE_QUERY_LOGGING = True

# ============================================================================
# PRINT CONFIG
# ============================================================================

def print_config():
    """Print current configuration"""
    print(f"""
🌊 OCEAN CORE 8030 - CONFIGURATION
{'='*50}
Environment: {ENV}
Debug: {DEBUG}
Service: {SERVICE_NAME} v{SERVICE_VERSION}
Host: {SERVICE_HOST}:{SERVICE_PORT}
{'='*50}

📊 DATA SOURCES:
  - Location Labs: {DataSourceConfig.LOCATION_LABS_ENABLED}
  - Agent Telemetry: {DataSourceConfig.AGENT_TELEMETRY_ENABLED}
  - Cycle Data: {DataSourceConfig.CYCLE_DATA_ENABLED}
  - System Metrics: {DataSourceConfig.SYSTEM_METRICS_ENABLED}

🔗 EXTERNAL APIs:
  - Wikipedia: {ExternalAPIsConfig.WIKIPEDIA_ENABLED}
  - Arxiv: {ExternalAPIsConfig.ARXIV_ENABLED}
  - PubMed: {ExternalAPIsConfig.PUBMED_ENABLED}
  - GitHub: {ExternalAPIsConfig.GITHUB_ENABLED}

🧠 KNOWLEDGE ENGINE:
  - Internal Weight: {KnowledgeEngineConfig.INTERNAL_WEIGHT}
  - External Weight: {KnowledgeEngineConfig.EXTERNAL_WEIGHT}
  - Caching: {KnowledgeEngineConfig.CACHE_RESPONSES}

{'='*50}
""")

if __name__ == "__main__":
    print_config()
