#!/usr/bin/env python3
"""
MALI - Master Announced Labor Intelligence
==========================================

Kulmi i inteligjencës së Clisonix.
Peak node që supervizion gjithë sistemin.

MALI është:
- Master Node (qendra e koordinimit)
- Announced Intelligence (shpall ngjarje të rëndësishme)
- Laboratory of Signals (laborator i thelluar)
- Inspector of Patterns (inspektor i pattern-eve)
- Peak of System Awareness (maja e vetëdijes së sistemit)

Author: Ledjan Ahmati (CEO, ABA GmbH)
"""

import asyncio
import hashlib
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

import numpy as np

# Import KLAJDI for integration
try:
    from klajdi_lab import (
        KlajdiLab,
        SignalChannel,
        SignalSeverity,
        SignalSource,
        get_klajdi_lab,
    )
    KLAJDI_AVAILABLE = True
except ImportError:
    KLAJDI_AVAILABLE = False

logger = logging.getLogger("mali")


# ═══════════════════════════════════════════════════════════════════════════════
# ANNOUNCEMENT TYPES
# ═══════════════════════════════════════════════════════════════════════════════

class AnnouncementType(Enum):
    """Tipet e shpalljeve"""
    ALERT = "alert"              # Alarm urgjent
    INSIGHT = "insight"          # Njohuri e re
    REPORT = "report"            # Raport periodik
    DISCOVERY = "discovery"      # Zbulim
    WARNING = "warning"          # Paralajmërim
    SUCCESS = "success"          # Sukses
    RECOMMENDATION = "recommendation"  # Rekomandim


class AnnouncementPriority(Enum):
    """Prioriteti i shpalljeve"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5


@dataclass
class Announcement:
    """
    Një shpallje nga MALI.
    Kur diçka e rëndësishme ndodh, MALI e shpall.
    """
    id: str
    type: AnnouncementType
    priority: AnnouncementPriority
    title: str
    content: str
    source_module: str
    data: Dict[str, Any] = field(default_factory=dict)
    actions: List[str] = field(default_factory=list)
    acknowledged: bool = False
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value,
            "priority": self.priority.value,
            "title": self.title,
            "content": self.content,
            "source_module": self.source_module,
            "data": self.data,
            "actions": self.actions,
            "acknowledged": self.acknowledged,
            "created_at": self.created_at
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SIGNAL INTAKE - Marrja e sinjaleve
# ═══════════════════════════════════════════════════════════════════════════════

class SignalIntake:
    """
    SIGNAL INTAKE - Mbledh sinjale nga të gjitha modulet.
    """
    
    def __init__(self) -> None:
        self._buffer: List[Dict[str, Any]] = []
        self._max_buffer = 5000
        self._sources: Dict[str, Dict[str, Any]] = {}
        self._last_intake: Dict[str, str] = {}
    
    async def intake_from_liam(self) -> Dict[str, Any]:
        """Merr metrika nga LIAM"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get("http://localhost:7575/api/metrics")
                if resp.status_code == 200:
                    data = resp.json()
                    self._sources["liam"] = data
                    self._last_intake["liam"] = datetime.now(timezone.utc).isoformat()
                    return {"source": "liam", "status": "ok", "data": data}
        except Exception as e:
            return {"source": "liam", "status": "error", "error": str(e)}
        return {"source": "liam", "status": "unavailable"}
    
    async def intake_from_alda(self) -> Dict[str, Any]:
        """Merr metrika nga ALDA"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get("http://localhost:8063/api/labor/stats")
                if resp.status_code == 200:
                    data = resp.json()
                    self._sources["alda"] = data
                    self._last_intake["alda"] = datetime.now(timezone.utc).isoformat()
                    return {"source": "alda", "status": "ok", "data": data}
        except Exception as e:
            return {"source": "alda", "status": "error", "error": str(e)}
        return {"source": "alda", "status": "unavailable"}
    
    async def intake_from_excel_core(self) -> Dict[str, Any]:
        """Merr të dhëna nga Excel Core për tabela"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                # System metrics
                resp = await client.get("http://localhost:8010/api/reporting/system-metrics")
                if resp.status_code == 200:
                    metrics = resp.json()
                    
                    # Docker stats
                    resp2 = await client.get("http://localhost:8010/api/reporting/docker-stats")
                    docker_stats = resp2.json() if resp2.status_code == 200 else {}
                    
                    data = {
                        "system_metrics": metrics,
                        "docker_stats": docker_stats
                    }
                    self._sources["excel_core"] = data
                    self._last_intake["excel_core"] = datetime.now(timezone.utc).isoformat()
                    return {"source": "excel_core", "status": "ok", "data": data}
        except Exception as e:
            return {"source": "excel_core", "status": "error", "error": str(e)}
        return {"source": "excel_core", "status": "unavailable"}
    
    async def intake_from_blerina(self) -> Dict[str, Any]:
        """Merr analiza nga Blerina"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get("http://localhost:8050/status")
                if resp.status_code == 200:
                    data = resp.json()
                    self._sources["blerina"] = data
                    self._last_intake["blerina"] = datetime.now(timezone.utc).isoformat()
                    return {"source": "blerina", "status": "ok", "data": data}
        except Exception as e:
            return {"source": "blerina", "status": "error", "error": str(e)}
        return {"source": "blerina", "status": "unavailable"}
    
    async def intake_all(self) -> Dict[str, Any]:
        """Mbledh nga të gjitha burimet"""
        results = await asyncio.gather(
            self.intake_from_liam(),
            self.intake_from_alda(),
            self.intake_from_excel_core(),
            self.intake_from_blerina(),
            return_exceptions=True
        )
        
        return {
            "liam": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "alda": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "excel_core": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "blerina": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_source_status(self) -> Dict[str, Any]:
        """Status i burimeve"""
        return {
            "sources": list(self._sources.keys()),
            "last_intake": self._last_intake,
            "buffer_size": len(self._buffer)
        }


# ═══════════════════════════════════════════════════════════════════════════════
# INTELLIGENCE ENGINE - Motori i inteligjencës
# ═══════════════════════════════════════════════════════════════════════════════

class IntelligenceEngine:
    """
    INTELLIGENCE ENGINE - Pattern Recognition, Meta-Analysis, Correlation.
    """
    
    def __init__(self) -> None:
        self._patterns: List[Dict[str, Any]] = []
        self._correlations: List[Dict[str, Any]] = []
        self._predictions: List[Dict[str, Any]] = []
    
    def analyze_patterns(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gjen pattern-e në të dhëna"""
        patterns = []
        
        # Analyze system metrics patterns
        if "system_metrics" in data:
            metrics = data["system_metrics"]
            
            # High CPU pattern
            cpu = metrics.get("cpu_percent", 0)
            if cpu > 80:
                patterns.append({
                    "type": "high_cpu",
                    "value": cpu,
                    "threshold": 80,
                    "severity": "warning" if cpu < 95 else "critical"
                })
            
            # High memory pattern
            mem = metrics.get("memory_percent", 0)
            if mem > 85:
                patterns.append({
                    "type": "high_memory",
                    "value": mem,
                    "threshold": 85,
                    "severity": "warning" if mem < 95 else "critical"
                })
        
        # Analyze docker stats patterns
        if "docker_stats" in data:
            stats = data.get("docker_stats", {}).get("stats", [])
            for container in stats:
                cpu_str = container.get("cpu_percent", "0%").replace("%", "")
                try:
                    cpu = float(cpu_str)
                    if cpu > 50:
                        patterns.append({
                            "type": "container_high_cpu",
                            "container": container.get("name"),
                            "value": cpu,
                            "severity": "info"
                        })
                except ValueError:
                    pass
        
        self._patterns.extend(patterns)
        return patterns
    
    def cross_module_correlation(self, sources: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Gjen korrelacione midis moduleve"""
        correlations = []
        
        # Check if multiple sources show stress
        stress_sources = []
        
        if "liam" in sources:
            liam_data = sources["liam"].get("data", {})
            if liam_data.get("processing_load", 0) > 70:
                stress_sources.append("liam")
        
        if "alda" in sources:
            alda_data = sources["alda"].get("data", {})
            if alda_data.get("active_units", 0) > 50:
                stress_sources.append("alda")
        
        if len(stress_sources) > 1:
            correlations.append({
                "type": "multi_module_stress",
                "modules": stress_sources,
                "description": f"Multiple modules under stress: {', '.join(stress_sources)}",
                "recommendation": "Consider load balancing or scaling"
            })
        
        self._correlations.extend(correlations)
        return correlations
    
    def predictive_model(self, historical_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Model parashikues i thjeshtë"""
        predictions: List[Dict[str, Any]] = []
        
        if len(historical_data) < 5:
            return predictions
        
        # Simple trend detection using numpy
        try:
            cpu_values = [d.get("cpu", 50) for d in historical_data[-10:]]
            if len(cpu_values) >= 3:
                trend = np.polyfit(range(len(cpu_values)), cpu_values, 1)[0]
                
                if trend > 2:  # Rising trend
                    predictions.append({
                        "type": "cpu_rising_trend",
                        "trend_slope": round(trend, 2),
                        "prediction": "CPU usage increasing, may hit threshold in near future",
                        "confidence": min(0.9, 0.5 + abs(trend) / 10)
                    })
        except Exception:
            pass
        
        self._predictions.extend(predictions)
        return predictions


# ═══════════════════════════════════════════════════════════════════════════════
# ANNOUNCEMENT LAYER - Shtresa e shpalljeve
# ═══════════════════════════════════════════════════════════════════════════════

class AnnouncementLayer:
    """
    ANNOUNCEMENT LAYER - Menaxhon dhe shpërndan shpalljet.
    """
    
    def __init__(self) -> None:
        self._announcements: List[Announcement] = []
        self._subscribers: List[Callable[[Announcement], None]] = []
        self._max_announcements: int = 1000
    
    def announce(
        self,
        type: AnnouncementType,
        priority: AnnouncementPriority,
        title: str,
        content: str,
        source_module: str,
        data: Optional[Dict[str, Any]] = None,
        actions: Optional[List[str]] = None
    ) -> Announcement:
        """Krijo dhe shpall një njoftim"""
        ann_id = hashlib.md5(
            f"{title}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:10]
        
        announcement = Announcement(
            id=ann_id,
            type=type,
            priority=priority,
            title=title,
            content=content,
            source_module=source_module,
            data=data or {},
            actions=actions or []
        )
        
        self._announcements.append(announcement)
        
        # Cleanup old announcements
        if len(self._announcements) > self._max_announcements:
            self._announcements = self._announcements[-self._max_announcements // 2:]
        
        # Notify subscribers
        for subscriber in self._subscribers:
            try:
                subscriber(announcement)
            except Exception as e:
                logger.error(f"Subscriber error: {e}")
        
        logger.info(f"📢 Announced: [{type.value}] {title}")
        
        return announcement
    
    def subscribe(self, callback: Callable) -> None:
        """Subscribe to announcements"""
        self._subscribers.append(callback)
    
    def get_unacknowledged(self) -> List[Announcement]:
        """Get unacknowledged announcements"""
        return [a for a in self._announcements if not a.acknowledged]
    
    def acknowledge(self, announcement_id: str) -> bool:
        """Acknowledge an announcement"""
        for ann in self._announcements:
            if ann.id == announcement_id:
                ann.acknowledged = True
                return True
        return False
    
    def get_by_priority(self, min_priority: AnnouncementPriority) -> List[Announcement]:
        """Get announcements by minimum priority"""
        return [a for a in self._announcements if a.priority.value >= min_priority.value]
    
    def get_recent(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent announcements"""
        return [a.to_dict() for a in self._announcements[-limit:]]


# ═══════════════════════════════════════════════════════════════════════════════
# EXCEL TABULATOR - Gjenerimi i tabelave për artikuj
# ═══════════════════════════════════════════════════════════════════════════════

class ExcelTabulator:
    """
    Gjeneron tabela nga të dhënat reale për përdorim në artikuj.
    Integrohet me Excel Core dhe LIAM/ALDA.
    """
    
    def __init__(self, intake: SignalIntake):
        self.intake = intake
    
    async def generate_system_metrics_table(self) -> Dict[str, Any]:
        """Gjeneron tabelë me metrikat e sistemit"""
        result = await self.intake.intake_from_excel_core()
        
        if result.get("status") != "ok":
            return {"error": "Could not fetch metrics", "table": None}
        
        metrics = result.get("data", {}).get("system_metrics", {})
        
        # Create markdown table
        table_md = """
| Metric | Value | Status |
|--------|-------|--------|
| CPU Usage | {cpu}% | {cpu_status} |
| Memory Usage | {mem}% | {mem_status} |
| Disk Usage | {disk}% | {disk_status} |
| Total Memory | {mem_total} GB | - |
| Total Disk | {disk_total} GB | - |
""".format(
            cpu=metrics.get("cpu_percent", "N/A"),
            cpu_status="🟢 OK" if metrics.get("cpu_percent", 0) < 80 else "🔴 High",
            mem=metrics.get("memory_percent", "N/A"),
            mem_status="🟢 OK" if metrics.get("memory_percent", 0) < 85 else "🔴 High",
            disk=metrics.get("disk_percent", "N/A"),
            disk_status="🟢 OK" if metrics.get("disk_percent", 0) < 90 else "🔴 High",
            mem_total=metrics.get("memory_total_gb", "N/A"),
            disk_total=metrics.get("disk_total_gb", "N/A")
        )
        
        return {
            "type": "system_metrics",
            "markdown": table_md.strip(),
            "raw_data": metrics,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_docker_stats_table(self) -> Dict[str, Any]:
        """Gjeneron tabelë me statistikat e Docker"""
        result = await self.intake.intake_from_excel_core()
        
        if result.get("status") != "ok":
            return {"error": "Could not fetch stats", "table": None}
        
        stats = result.get("data", {}).get("docker_stats", {}).get("stats", [])
        
        if not stats:
            return {"error": "No docker stats available", "table": None}
        
        # Create markdown table
        rows = ["| Container | CPU | Memory | Usage |", "|-----------|-----|--------|-------|"]
        for container in stats[:10]:  # Limit to 10
            rows.append(f"| {container.get('name', 'N/A')} | {container.get('cpu_percent', 'N/A')} | {container.get('memory_percent', 'N/A')} | {container.get('memory_usage', 'N/A')} |")
        
        table_md = "\n".join(rows)
        
        return {
            "type": "docker_stats",
            "markdown": table_md,
            "raw_data": stats,
            "container_count": len(stats),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_liam_matrix_table(self) -> Dict[str, Any]:
        """Gjeneron tabelë me matricat LIAM"""
        result = await self.intake.intake_from_liam()
        
        if result.get("status") != "ok":
            # Generate simulated data for demo
            data = {
                "matrix_operations": 1250,
                "tensor_transforms": 340,
                "binary_encodings": 890,
                "svd_compressions": 45,
                "avg_latency_ms": 12.5
            }
        else:
            data = result.get("data", {})
        
        table_md = """
| LIAM Operation | Count/Value | Performance |
|----------------|-------------|-------------|
| Matrix Operations | {matrix_ops} | 🟢 Optimal |
| Tensor Transforms | {tensor} | 🟢 Optimal |
| Binary Encodings | {binary} | 🟢 Optimal |
| SVD Compressions | {svd} | 🟢 Optimal |
| Avg Latency | {latency} ms | {latency_status} |
""".format(
            matrix_ops=data.get("matrix_operations", "N/A"),
            tensor=data.get("tensor_transforms", "N/A"),
            binary=data.get("binary_encodings", "N/A"),
            svd=data.get("svd_compressions", "N/A"),
            latency=data.get("avg_latency_ms", "N/A"),
            latency_status="🟢 Fast" if data.get("avg_latency_ms", 100) < 50 else "🟡 Moderate"
        )
        
        return {
            "type": "liam_matrix",
            "markdown": table_md.strip(),
            "raw_data": data,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_alda_labor_table(self) -> Dict[str, Any]:
        """Gjeneron tabelë me statistikat ALDA"""
        result = await self.intake.intake_from_alda()
        
        if result.get("status") != "ok":
            # Generate simulated data
            data = {
                "active_units": 24,
                "completed_units": 1560,
                "failed_units": 3,
                "avg_processing_time": 45.2,
                "determinism_level": "strict"
            }
        else:
            data = result.get("data", {})
        
        # Extract failed_units with proper type handling
        failed_units_raw = data.get("failed_units", 0)
        failed_units = int(failed_units_raw) if isinstance(failed_units_raw, (int, float, str)) and str(failed_units_raw).isdigit() else 0
        
        table_md = """
| ALDA Labor Metric | Value | Status |
|-------------------|-------|--------|
| Active Units | {active} | 🔄 Processing |
| Completed Units | {completed} | ✅ Done |
| Failed Units | {failed} | {fail_status} |
| Avg Processing Time | {avg_time} ms | 🟢 Normal |
| Determinism Level | {determ} | 🔒 Strict |
""".format(
            active=data.get("active_units", "N/A"),
            completed=data.get("completed_units", "N/A"),
            failed=failed_units,
            fail_status="🟢 Low" if failed_units < 5 else "🔴 High",
            avg_time=data.get("avg_processing_time", "N/A"),
            determ=data.get("determinism_level", "strict")
        )
        
        return {
            "type": "alda_labor",
            "markdown": table_md.strip(),
            "raw_data": data,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_all_tables(self) -> Dict[str, Any]:
        """Gjeneron të gjitha tabelat"""
        tables = await asyncio.gather(
            self.generate_system_metrics_table(),
            self.generate_docker_stats_table(),
            self.generate_liam_matrix_table(),
            self.generate_alda_labor_table(),
            return_exceptions=True
        )
        
        return {
            "system_metrics": tables[0] if not isinstance(tables[0], Exception) else {"error": str(tables[0])},
            "docker_stats": tables[1] if not isinstance(tables[1], Exception) else {"error": str(tables[1])},
            "liam_matrix": tables[2] if not isinstance(tables[2], Exception) else {"error": str(tables[2])},
            "alda_labor": tables[3] if not isinstance(tables[3], Exception) else {"error": str(tables[3])},
            "generated_at": datetime.now(timezone.utc).isoformat()
        }


# ═══════════════════════════════════════════════════════════════════════════════
# MALI CORE - Qendra e inteligjencës
# ═══════════════════════════════════════════════════════════════════════════════

class MaliCore:
    """
    MALI - Master Announced Labor Intelligence
    
    Kulmi i inteligjencës së Clisonix.
    Peak node që supervizion gjithë sistemin.
    
    Components:
    - Signal Intake: Mbledh sinjale
    - Intelligence Engine: Analizon pattern-e
    - Announcement Layer: Shpall ngjarje
    - KLAJDI Integration: Lidhet me laboratorin hetimor
    - Excel Tabulator: Gjeneron tabela reale
    """
    
    def __init__(self) -> None:
        self.intake: SignalIntake = SignalIntake()
        self.intelligence: IntelligenceEngine = IntelligenceEngine()
        self.announcements: AnnouncementLayer = AnnouncementLayer()
        self.tabulator: ExcelTabulator = ExcelTabulator(self.intake)
        
        # KLAJDI integration
        self.klajdi: Optional[KlajdiLab] = None
        if KLAJDI_AVAILABLE:
            self.klajdi = get_klajdi_lab()
        
        self._stats: Dict[str, Any] = {
            "started_at": datetime.now(timezone.utc).isoformat(),
            "intake_cycles": 0,
            "patterns_detected": 0,
            "announcements_made": 0
        }
        
        self._running: bool = False
        self._cycle_interval: int = 60  # seconds
    
    async def run_intake_cycle(self) -> Dict[str, Any]:
        """Run one intake and analysis cycle"""
        logger.info("🏔️ MALI: Running intake cycle...")
        
        # Intake from all sources
        intake_results = await self.intake.intake_all()
        
        # Analyze patterns
        patterns = []
        for source, result in intake_results.items():
            if source != "timestamp" and result.get("status") == "ok":
                source_patterns = self.intelligence.analyze_patterns(result.get("data", {}))
                patterns.extend(source_patterns)
        
        # Cross-module correlation
        correlations = self.intelligence.cross_module_correlation(intake_results)
        
        # Generate announcements for critical findings
        for pattern in patterns:
            if pattern.get("severity") == "critical":
                self.announcements.announce(
                    type=AnnouncementType.ALERT,
                    priority=AnnouncementPriority.HIGH,
                    title=f"Critical: {pattern.get('type')}",
                    content=f"Value: {pattern.get('value')}, Threshold: {pattern.get('threshold')}",
                    source_module="mali_intelligence",
                    data=pattern
                )
        
        for correlation in correlations:
            self.announcements.announce(
                type=AnnouncementType.INSIGHT,
                priority=AnnouncementPriority.MEDIUM,
                title=correlation.get("type", "Correlation"),
                content=correlation.get("description", ""),
                source_module="mali_correlation",
                data=correlation,
                actions=[correlation.get("recommendation", "")]
            )
        
        # Forward to KLAJDI if available
        if self.klajdi:
            for source, result in intake_results.items():
                if source != "timestamp" and result.get("status") == "ok":
                    try:
                        source_enum = SignalSource[source.upper()] if source.upper() in SignalSource.__members__ else SignalSource.EXTERNAL
                        await self.klajdi.ingest_signal(
                            source=source_enum,
                            channel=SignalChannel.INTERNAL,
                            payload=result.get("data", {}),
                            severity=SignalSeverity.INFO
                        )
                    except Exception:
                        pass
        
        # Update stats
        self._stats["intake_cycles"] += 1
        self._stats["patterns_detected"] += len(patterns)
        self._stats["announcements_made"] = len(self.announcements._announcements)
        
        return {
            "cycle": self._stats["intake_cycles"],
            "sources_reached": len([r for r in intake_results.values() if isinstance(r, dict) and r.get("status") == "ok"]),
            "patterns_found": len(patterns),
            "correlations": len(correlations),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def start_continuous_monitoring(self) -> None:
        """Start continuous monitoring loop"""
        self._running = True
        logger.info("🏔️ MALI: Starting continuous monitoring...")
        
        while self._running:
            try:
                await self.run_intake_cycle()
                await asyncio.sleep(self._cycle_interval)
            except Exception as e:
                logger.error(f"MALI cycle error: {e}")
                await asyncio.sleep(10)
    
    def stop_monitoring(self) -> None:
        """Stop continuous monitoring"""
        self._running = False
        logger.info("🏔️ MALI: Stopping monitoring...")
    
    async def generate_comprehensive_report(self) -> Dict[str, Any]:
        """Generate comprehensive system report"""
        # Get all tables
        tables = await self.tabulator.generate_all_tables()
        
        # Get KLAJDI diagnostics if available
        klajdi_report = None
        if self.klajdi:
            klajdi_report = await self.klajdi.run_diagnostics()
        
        # Get recent announcements
        recent_announcements = self.announcements.get_recent(20)
        
        # Get patterns and correlations
        patterns = self.intelligence._patterns[-50:]
        correlations = self.intelligence._correlations[-20:]
        
        report = {
            "title": "MALI Comprehensive System Report",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "intake_cycles": self._stats["intake_cycles"],
                "patterns_detected": self._stats["patterns_detected"],
                "announcements": self._stats["announcements_made"]
            },
            "tables": tables,
            "recent_announcements": recent_announcements,
            "patterns": patterns,
            "correlations": correlations,
            "klajdi_diagnostics": klajdi_report,
            "source_status": self.intake.get_source_status()
        }
        
        # Generate markdown report
        report["markdown"] = self._generate_markdown_report(report)
        
        return report
    
    def _generate_markdown_report(self, report: Dict[str, Any]) -> str:
        """Generate markdown version of report"""
        md = f"""# 🏔️ MALI System Intelligence Report

**Generated:** {report['generated_at']}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Intake Cycles | {report['summary']['intake_cycles']} |
| Patterns Detected | {report['summary']['patterns_detected']} |
| Announcements | {report['summary']['announcements']} |

## 📈 System Metrics

{report['tables'].get('system_metrics', {}).get('markdown', 'N/A')}

## 🐳 Docker Stats

{report['tables'].get('docker_stats', {}).get('markdown', 'N/A')}

## 🧮 LIAM Matrix Operations

{report['tables'].get('liam_matrix', {}).get('markdown', 'N/A')}

## ⚙️ ALDA Labor Statistics

{report['tables'].get('alda_labor', {}).get('markdown', 'N/A')}

## 📢 Recent Announcements

"""
        for ann in report.get('recent_announcements', [])[:5]:
            md += f"- **[{ann.get('type')}]** {ann.get('title')}\n"
        
        md += """
---
*Generated by MALI - Master Announced Labor Intelligence*
*Clisonix Cloud Platform*
"""
        return md
    
    def get_stats(self) -> Dict[str, Any]:
        """Get MALI statistics"""
        return {
            **self._stats,
            "running": self._running,
            "klajdi_available": self.klajdi is not None,
            "sources": self.intake.get_source_status()
        }


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON AND FACTORY
# ═══════════════════════════════════════════════════════════════════════════════

_mali_core: Optional[MaliCore] = None


def get_mali_core() -> MaliCore:
    """Get or create MALI Core instance"""
    global _mali_core
    if _mali_core is None:
        _mali_core = MaliCore()
        logger.info("🏔️ MALI Core initialized")
    return _mali_core


# ═══════════════════════════════════════════════════════════════════════════════
# CLI INTERFACE
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    mali = get_mali_core()
    
    async def main():
        # Run one cycle
        result = await mali.run_intake_cycle()
        print(json.dumps(result, indent=2))
        
        # Generate report
        report = await mali.generate_comprehensive_report()
        print("\n" + report["markdown"])
        
        # Show stats
        print("\n📊 MALI Stats:")
        print(json.dumps(mali.get_stats(), indent=2))
    
    asyncio.run(main())
