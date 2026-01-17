"""
LOCATION LABS ENGINE - Distributed Geographic Research Processing
===================================================================
Isolated engine for location-based laboratory cycles across cities.
Operates independently like Ocean Central Hub - NOT in main.py.

Supported Locations: Elbasan, Tirana, Durrës, Vlorë, Shkodër, Korçë, 
                     Sarandë, Prishtina, Kostur, Athens, Rome, Zurich

Author: Ledjan Ahmati
License: Closed Source
Version: 1.0.0
"""

import os
import asyncio
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import uuid4
from enum import Enum
from dataclasses import dataclass, field

logger = logging.getLogger("location_labs_engine")

# ============================================================================
# ENUMS & TYPES
# ============================================================================

class LocationRegion(str, Enum):
    """Geographic regions with laboratories"""
    # Albania
    ELBASAN = "elbasan"
    TIRANA = "tirana"
    DURRES = "durres"
    VLORE = "vlore"
    SHKODER = "shkoder"
    KORCE = "korce"
    SARANDA = "saranda"
    # Kosovo
    PRISHTINA = "prishtina"
    # North Macedonia
    KOSTUR = "kostur"
    # Greece
    ATHENS = "athens"
    # Italy
    ROME = "rome"
    # Switzerland
    ZURICH = "zurich"


class LabDomain(str, Enum):
    """Lab domain types by location"""
    UNIVERSITY = "university"
    MEDICAL = "medical"
    RESEARCH = "research"
    MARINE = "marine"
    AGRICULTURAL = "agricultural"
    ECOLOGICAL = "ecological"
    TECH = "tech"


class LabDataType(str, Enum):
    """Types of data produced by location labs"""
    EXPERIMENTAL = "experimental"
    OBSERVATIONAL = "observational"
    SENSOR = "sensor"
    CLINICAL = "clinical"
    ENVIRONMENTAL = "environmental"


@dataclass
class LocationLabResult:
    """Result from a location-based lab execution"""
    lab_id: str
    location: LocationRegion
    domain: LabDomain
    data_type: LabDataType
    collection_timestamp: str
    processing_time_ms: float
    data_quality_score: float  # 0-1
    sample_count: int
    artifacts_generated: int
    errors: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'lab_id': self.lab_id,
            'location': self.location.value,
            'domain': self.domain.value,
            'data_type': self.data_type.value,
            'collection_timestamp': self.collection_timestamp,
            'processing_time_ms': self.processing_time_ms,
            'data_quality_score': self.data_quality_score,
            'sample_count': self.sample_count,
            'artifacts_generated': self.artifacts_generated,
            'errors': self.errors,
            'metadata': self.metadata
        }


# ============================================================================
# LOCATION LAB DEFINITIONS
# ============================================================================

@dataclass
class LocationLabConfig:
    """Configuration for a location laboratory"""
    location: LocationRegion
    domain: LabDomain
    country: str
    source_api: str
    cycle_interval_minutes: int
    data_types: List[LabDataType]
    description: str


LOCATION_LABS_CONFIG: Dict[LocationRegion, LocationLabConfig] = {
    # ALBANIA
    LocationRegion.ELBASAN: LocationLabConfig(
        location=LocationRegion.ELBASAN,
        domain=LabDomain.UNIVERSITY,
        country="Albania",
        source_api="elbasan.university.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.OBSERVATIONAL],
        description="Elbasan University Laboratory - Physics & Biology Research"
    ),
    LocationRegion.TIRANA: LocationLabConfig(
        location=LocationRegion.TIRANA,
        domain=LabDomain.MEDICAL,
        country="Albania",
        source_api="tirana.medical.center",
        cycle_interval_minutes=30,
        data_types=[LabDataType.CLINICAL, LabDataType.SENSOR],
        description="Tirana Medical Center - Clinical & Biomedical Research"
    ),
    LocationRegion.DURRES: LocationLabConfig(
        location=LocationRegion.DURRES,
        domain=LabDomain.RESEARCH,
        country="Albania",
        source_api="durres.research.institute",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.SENSOR],
        description="Durrës Research Institute - General Research & Development"
    ),
    LocationRegion.VLORE: LocationLabConfig(
        location=LocationRegion.VLORE,
        domain=LabDomain.MARINE,
        country="Albania",
        source_api="vlore.marine.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.OBSERVATIONAL, LabDataType.ENVIRONMENTAL],
        description="Vlorë Marine Laboratory - Marine Biology & Oceanography"
    ),
    LocationRegion.SHKODER: LocationLabConfig(
        location=LocationRegion.SHKODER,
        domain=LabDomain.UNIVERSITY,
        country="Albania",
        source_api="shkoder.university.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.OBSERVATIONAL],
        description="Shkodër University - Environmental & Ecological Studies"
    ),
    LocationRegion.KORCE: LocationLabConfig(
        location=LocationRegion.KORCE,
        domain=LabDomain.AGRICULTURAL,
        country="Albania",
        source_api="korce.agricultural.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.OBSERVATIONAL, LabDataType.ENVIRONMENTAL],
        description="Korçë Agricultural Lab - Agricultural Science & Soil Studies"
    ),
    LocationRegion.SARANDA: LocationLabConfig(
        location=LocationRegion.SARANDA,
        domain=LabDomain.ECOLOGICAL,
        country="Albania",
        source_api="saranda.ecological.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.OBSERVATIONAL, LabDataType.ENVIRONMENTAL],
        description="Sarandë Ecological Lab - Biodiversity & Ecosystem Monitoring"
    ),
    # KOSOVO
    LocationRegion.PRISHTINA: LocationLabConfig(
        location=LocationRegion.PRISHTINA,
        domain=LabDomain.MEDICAL,
        country="Kosovo",
        source_api="prishtina.university.hospital",
        cycle_interval_minutes=30,
        data_types=[LabDataType.CLINICAL, LabDataType.SENSOR],
        description="Prishtina University Hospital - Medical & Healthcare Research"
    ),
    # NORTH MACEDONIA
    LocationRegion.KOSTUR: LocationLabConfig(
        location=LocationRegion.KOSTUR,
        domain=LabDomain.MEDICAL,
        country="North Macedonia",
        source_api="kostur.medical.center",
        cycle_interval_minutes=30,
        data_types=[LabDataType.CLINICAL, LabDataType.SENSOR],
        description="Kostur Medical Center - Clinical Research & Medicine"
    ),
    # GREECE
    LocationRegion.ATHENS: LocationLabConfig(
        location=LocationRegion.ATHENS,
        domain=LabDomain.RESEARCH,
        country="Greece",
        source_api="athens.national.lab",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.SENSOR],
        description="Athens National Lab - Multidisciplinary Research"
    ),
    # ITALY
    LocationRegion.ROME: LocationLabConfig(
        location=LocationRegion.ROME,
        domain=LabDomain.RESEARCH,
        country="Italy",
        source_api="rome.research.center",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.OBSERVATIONAL],
        description="Rome Research Center - European Research Hub"
    ),
    # SWITZERLAND
    LocationRegion.ZURICH: LocationLabConfig(
        location=LocationRegion.ZURICH,
        domain=LabDomain.TECH,
        country="Switzerland",
        source_api="zurich.tech.university",
        cycle_interval_minutes=30,
        data_types=[LabDataType.EXPERIMENTAL, LabDataType.SENSOR],
        description="Zurich Tech University - Technology & Innovation Lab"
    ),
}


# ============================================================================
# LOCATION LAB PROCESSOR
# ============================================================================

class LocationLabProcessor:
    """Processes data from a specific geographic laboratory"""
    
    def __init__(self, config: LocationLabConfig):
        self.config = config
        self.lab_id = f"loc-lab-{config.location.value}"
        self.execution_count = 0
        self.total_processing_time = 0.0
        self.last_execution: Optional[datetime] = None
    
    async def process(self) -> LocationLabResult:
        """Process lab data cycle"""
        import time
        from random import random, randint
        
        start_time = time.time()
        collection_timestamp = datetime.utcnow().isoformat()
        
        # Simulate data collection
        await asyncio.sleep(0.1)  # Simulate network/processing
        
        sample_count = randint(50, 500)
        artifacts_generated = randint(1, 10)
        data_quality_score = 0.75 + (0.2 * random())  # 0.75 - 0.95
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        result = LocationLabResult(
            lab_id=self.lab_id,
            location=self.config.location,
            domain=self.config.domain,
            data_type=self.config.data_types[0],  # Primary data type
            collection_timestamp=collection_timestamp,
            processing_time_ms=processing_time_ms,
            data_quality_score=data_quality_score,
            sample_count=sample_count,
            artifacts_generated=artifacts_generated,
            metadata={
                'country': self.config.country,
                'source_api': self.config.source_api,
                'data_types': [dt.value for dt in self.config.data_types]
            }
        )
        
        self.execution_count += 1
        self.total_processing_time += processing_time_ms
        self.last_execution = datetime.utcnow()
        
        logger.info(f"✅ {self.config.location.value} lab processed: {sample_count} samples, "
                   f"{artifacts_generated} artifacts, quality={data_quality_score:.2f}")
        
        return result
    
    def get_stats(self) -> Dict[str, Any]:
        """Get lab statistics"""
        avg_processing_time = (
            self.total_processing_time / self.execution_count 
            if self.execution_count > 0 else 0
        )
        return {
            'lab_id': self.lab_id,
            'location': self.config.location.value,
            'execution_count': self.execution_count,
            'avg_processing_time_ms': avg_processing_time,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None,
            'domain': self.config.domain.value,
            'country': self.config.country
        }


# ============================================================================
# LOCATION LABS ENGINE
# ============================================================================

class LocationLabsEngine:
    """Central engine managing all location-based laboratories"""
    
    def __init__(self):
        self.labs: Dict[LocationRegion, LocationLabProcessor] = {}
        self.results_cache: Dict[LocationRegion, LocationLabResult] = {}
        self.initialized = False
    
    async def initialize(self) -> None:
        """Initialize all location labs"""
        logger.info("🌍 Initializing Location Labs Engine...")
        
        for location, config in LOCATION_LABS_CONFIG.items():
            processor = LocationLabProcessor(config)
            self.labs[location] = processor
        
        self.initialized = True
        logger.info(f"✅ Location Labs Engine initialized - {len(self.labs)} labs active")
    
    async def process_lab(self, location: LocationRegion) -> LocationLabResult:
        """Process a single lab"""
        if location not in self.labs:
            raise ValueError(f"Location {location.value} not configured")
        
        processor = self.labs[location]
        result = await processor.process()
        self.results_cache[location] = result
        return result
    
    async def process_all_labs(self) -> List[LocationLabResult]:
        """Process all labs in parallel"""
        results = []
        tasks = [
            self.process_lab(location) 
            for location in self.labs.keys()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if not isinstance(r, Exception)]
    
    def get_lab_stats(self, location: LocationRegion) -> Optional[Dict[str, Any]]:
        """Get stats for a specific lab"""
        if location not in self.labs:
            return None
        return self.labs[location].get_stats()
    
    def get_all_stats(self) -> List[Dict[str, Any]]:
        """Get stats for all labs"""
        return [lab.get_stats() for lab in self.labs.values()]
    
    def get_last_result(self, location: LocationRegion) -> Optional[LocationLabResult]:
        """Get last result for a location"""
        return self.results_cache.get(location)
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Get overall engine status"""
        return {
            "initialized": self.initialized,
            "total_labs": len(self.labs),
            "labs_by_domain": self._count_by_domain(),
            "labs_by_country": self._count_by_country(),
            "cached_results": len(self.results_cache),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _count_by_domain(self) -> Dict[str, int]:
        """Count labs by domain"""
        counts = {}
        for processor in self.labs.values():
            domain = processor.config.domain.value
            counts[domain] = counts.get(domain, 0) + 1
        return counts
    
    def _count_by_country(self) -> Dict[str, int]:
        """Count labs by country"""
        counts = {}
        for processor in self.labs.values():
            country = processor.config.country
            counts[country] = counts.get(country, 0) + 1
        return counts


# ============================================================================
# GLOBAL INSTANCE
# ============================================================================

_location_engine: Optional[LocationLabsEngine] = None


async def get_location_labs_engine() -> LocationLabsEngine:
    """Get or create global Location Labs Engine"""
    global _location_engine
    if _location_engine is None:
        _location_engine = LocationLabsEngine()
        await _location_engine.initialize()
    return _location_engine


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    "LocationLabsEngine",
    "LocationLabProcessor",
    "LocationLabResult",
    "LocationRegion",
    "LabDomain",
    "LabDataType",
    "get_location_labs_engine",
    "LOCATION_LABS_CONFIG"
]
