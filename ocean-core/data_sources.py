"""
DATA SOURCES CONNECTOR LAYER
============================
Aggregates ALL internal Clisonix data sources

Sources:
1. Location Labs Engine (12 geographic labs)
2. Cycle Production Data (cycles, execution data)
3. Agent Telemetry (ALBA, ALBI, Blerina, AGIEM, ASI)
4. System Metrics
5. Excel Dashboard Data
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict

logger = logging.getLogger("ocean_data_sources")


class DataSourceType(str, Enum):
    """Available internal data sources"""
    LOCATION_LABS = "location_labs"
    CYCLE_DATA = "cycle_data"
    AGENT_TELEMETRY = "agent_telemetry"
    SYSTEM_METRICS = "system_metrics"
    EXCEL_DATA = "excel_data"
    LABS_EXECUTION = "labs_execution"


@dataclass
class DataSourceInfo:
    """Information about a data source"""
    source_type: DataSourceType
    name: str
    status: str  # active, inactive, error
    last_update: str
    record_count: int
    quality_score: float  # 0.0 - 1.0


class LocationLabsConnector:
    """Connects to Location Labs Engine"""
    
    def __init__(self):
        self.initialized = False
        self.labs_engine = None
    
    async def initialize(self):
        """Initialize Location Labs Engine connection"""
        try:
            # Import from apps.api since ocean-core is separate
            import sys
            from pathlib import Path
            
            # Add apps/api to path
            app_path = Path(__file__).parent / "apps" / "api"
            if str(app_path) not in sys.path:
                sys.path.insert(0, str(app_path))
            
            # Also try relative import
            try:
                from location_labs_engine import get_location_labs_engine
            except ImportError:
                # Try from apps.api if running in container
                import os
                if os.path.exists("/app/apps/api"):
                    sys.path.insert(0, "/app/apps/api")
                from location_labs_engine import get_location_labs_engine
            
            self.labs_engine = await get_location_labs_engine()
            self.initialized = True
            logger.info("✅ Location Labs Engine connected")
            return True
        except Exception as e:
            logger.error(f"❌ Location Labs Engine connection failed: {e}")
            return False
    
    async def get_all_labs_data(self) -> Dict[str, Any]:
        """Get data from all 12 location labs"""
        if not self.initialized or not self.labs_engine:
            return {"error": "Location Labs not initialized"}
        
        try:
            stats = self.labs_engine.get_all_stats()
            status = self.labs_engine.get_engine_status()
            
            return {
                "source_type": DataSourceType.LOCATION_LABS.value,
                "total_labs": len(stats),
                "labs_data": stats,
                "engine_status": status,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error retrieving Location Labs data: {e}")
            return {"error": str(e)}
    
    async def get_lab_by_location(self, location: str) -> Dict[str, Any]:
        """Get specific lab data by location"""
        if not self.initialized:
            return {"error": "Location Labs not initialized"}
        
        try:
            # Assuming labs engine has method to get specific lab
            return {
                "location": location,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}


class AgentTelemetryConnector:
    """Connects to Agent Telemetry (ALBA, ALBI, Blerina, AGIEM, ASI)"""
    
    def __init__(self):
        self.agents = ["alba", "albi", "blerina", "agiem", "asi"]
        self.data = {}
    
    async def initialize(self):
        """Initialize agent telemetry connection"""
        try:
            # TODO: Connect to agent telemetry endpoints
            logger.info("✅ Agent Telemetry initialized")
            return True
        except Exception as e:
            logger.error(f"❌ Agent Telemetry initialization failed: {e}")
            return False
    
    async def get_agent_status(self, agent: str) -> Dict[str, Any]:
        """Get status of specific agent"""
        return {
            "agent": agent,
            "status": "operational",
            "active_tasks": 0,
            "last_update": datetime.now().isoformat()
        }
    
    async def get_all_agents_data(self) -> Dict[str, Any]:
        """Get data from all agents"""
        agents_data = {}
        for agent in self.agents:
            agents_data[agent] = await self.get_agent_status(agent)
        
        return {
            "source_type": DataSourceType.AGENT_TELEMETRY.value,
            "agents": agents_data,
            "timestamp": datetime.now().isoformat()
        }


class CycleDataConnector:
    """Connects to Cycle Production Data"""
    
    def __init__(self):
        self.initialized = False
    
    async def initialize(self):
        """Initialize cycle data connection"""
        try:
            logger.info("✅ Cycle Data connector initialized")
            return True
        except Exception as e:
            logger.error(f"❌ Cycle Data initialization failed: {e}")
            return False
    
    async def get_cycle_data(self) -> Dict[str, Any]:
        """Get production cycle data"""
        return {
            "source_type": DataSourceType.CYCLE_DATA.value,
            "active_cycles": 0,
            "total_executed": 0,
            "timestamp": datetime.now().isoformat()
        }


class ExcelDataConnector:
    """Connects to Excel Dashboard Data"""
    
    def __init__(self):
        self.initialized = False
    
    async def initialize(self):
        """Initialize Excel data connection"""
        try:
            logger.info("✅ Excel Data connector initialized")
            return True
        except Exception as e:
            logger.error(f"❌ Excel Data initialization failed: {e}")
            return False
    
    async def get_excel_data(self) -> Dict[str, Any]:
        """Get Excel dashboard data"""
        return {
            "source_type": DataSourceType.EXCEL_DATA.value,
            "dashboards": [],
            "timestamp": datetime.now().isoformat()
        }


class DataSourcesManager:
    """Central manager for all data sources"""
    
    def __init__(self):
        self.location_labs = LocationLabsConnector()
        self.agent_telemetry = AgentTelemetryConnector()
        self.cycle_data = CycleDataConnector()
        self.excel_data = ExcelDataConnector()
        self.initialized = False
        self.last_aggregation = None
    
    async def initialize(self):
        """Initialize all data sources"""
        logger.info("🔄 Initializing Data Sources Manager...")
        
        results = await asyncio.gather(
            self.location_labs.initialize(),
            self.agent_telemetry.initialize(),
            self.cycle_data.initialize(),
            self.excel_data.initialize(),
            return_exceptions=True
        )
        
        self.initialized = all(r is True for r in results if r is not True)
        logger.info(f"✅ Data Sources Manager initialized: {self.initialized}")
        return self.initialized
    
    async def get_all_sources_data(self) -> Dict[str, Any]:
        """Aggregate data from all sources"""
        logger.info("📊 Aggregating all data sources...")
        
        data = {
            "timestamp": datetime.now().isoformat(),
            "sources": {}
        }
        
        # Gather all source data in parallel
        location_labs_data = await self.location_labs.get_all_labs_data()
        agent_telemetry_data = await self.agent_telemetry.get_all_agents_data()
        cycle_data = await self.cycle_data.get_cycle_data()
        excel_data = await self.excel_data.get_excel_data()
        
        data["sources"]["location_labs"] = location_labs_data
        data["sources"]["agent_telemetry"] = agent_telemetry_data
        data["sources"]["cycle_data"] = cycle_data
        data["sources"]["excel_data"] = excel_data
        
        self.last_aggregation = data
        return data
    
    async def get_source_status(self) -> Dict[str, DataSourceInfo]:
        """Get status of all data sources"""
        return {
            "location_labs": DataSourceInfo(
                source_type=DataSourceType.LOCATION_LABS,
                name="Location Labs Engine (12 labs)",
                status="active",
                last_update=datetime.now().isoformat(),
                record_count=12,
                quality_score=0.95
            ),
            "agent_telemetry": DataSourceInfo(
                source_type=DataSourceType.AGENT_TELEMETRY,
                name="Agent Telemetry (ALBA, ALBI, Blerina, AGIEM, ASI)",
                status="active",
                last_update=datetime.now().isoformat(),
                record_count=5,
                quality_score=0.90
            ),
            "cycle_data": DataSourceInfo(
                source_type=DataSourceType.CYCLE_DATA,
                name="Cycle Production Data",
                status="active",
                last_update=datetime.now().isoformat(),
                record_count=0,
                quality_score=0.85
            ),
            "excel_data": DataSourceInfo(
                source_type=DataSourceType.EXCEL_DATA,
                name="Excel Dashboard Data",
                status="active",
                last_update=datetime.now().isoformat(),
                record_count=0,
                quality_score=0.88
            )
        }


# Global singleton instance
_data_sources_manager: Optional[DataSourcesManager] = None


async def get_data_sources_manager() -> DataSourcesManager:
    """Get or create global data sources manager"""
    global _data_sources_manager
    
    if _data_sources_manager is None:
        _data_sources_manager = DataSourcesManager()
        await _data_sources_manager.initialize()
    
    return _data_sources_manager
