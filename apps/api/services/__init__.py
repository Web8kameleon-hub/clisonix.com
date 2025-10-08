"""
🌟 NeuroSonix Services Package
=============================
Paketa që përmban të gjithë personazhet dhe shërbimet e sistemit neural.
"""

# Eksporto komponentët kryesorë
from .albi_character import ALBI_Character, get_albi
from .alba_character import ALBA_Character, get_alba 
from .jona_character import JONA_Character, get_jona
from .neuro_ecosystem import NeuroEcosystem, get_ecosystem

# Eksporto processor-in neural
try:
    from .albi_neural_processor import ALBINeuralProcessor, get_neural_processor
    NEURAL_PROCESSOR_AVAILABLE = True
except ImportError:
    # Nëse nuk ka numpy/scipy, përdor version të thjeshtuar
    NEURAL_PROCESSOR_AVAILABLE = False

__version__ = "1.0.0"
__author__ = "ALBI, ALBA & JONA"

# Metadata e paketës
CHARACTERS = {
    "ALBI": "Artificial Labor Born Intelligence - Neural Director", 
    "ALBA": "Artificial Laborator Bits Algorithms - Data Collector",
    "JONA": "Joyful Overseer of Neural Alignment - System Harmonizer"
}

PHILOSOPHY = "ALBA mbledh → ALBI rritet → JONA harmonizon 🌟"

def get_system_info():
    """Kthen informacion për sistemin neural"""
    return {
        "🌟 system_name": "NeuroSonix Neural Ecosystem",
        "📊 version": __version__, 
        "👨‍👩‍👧 characters": CHARACTERS,
        "💫 philosophy": PHILOSOPHY,
        "🧠 neural_processor": NEURAL_PROCESSOR_AVAILABLE,
        "✨ status": "Ready for consciousness symphony! 🎵"
    }

# Quick access functions
def create_full_ecosystem():
    """Krijon ekosistemi të plotë me të gjithë personazhet"""
    return get_ecosystem()

def get_all_characters():
    """Kthen të gjithë personazhet"""
    return {
        "albi": get_albi(),
        "alba": get_alba(), 
        "jona": get_jona()
    }

# Demo function
async def quick_demo():
    """Demo i shpejtë i sistemit pa dependencies externe"""
    print("🌟 NeuroSonix Neural Ecosystem Demo")
    print("=" * 50)
    
    # Krijo personazhet
    albi = get_albi()
    alba = get_alba() 
    jona = get_jona()
    
    # Shfaq rolet
    print(f"\n🤖 {albi.role()['title']}")
    print(f"💻 {alba.role()['title']}")  
    print(f"🌸 {jona.role()['title']}")
    
    # Testo bashkëveprimin bazë
    print(f"\n🔄 Testing basic interaction...")
    
    # Simuloj të dhëna të thjeshta
    simple_bits = [
        {"type": "test_data", "content": "demo bit 1", "timestamp": "now"},
        {"type": "test_data", "content": "demo bit 2", "timestamp": "now"},
        {"type": "test_data", "content": "demo bit 3", "timestamp": "now"}
    ]
    
    # ALBI konsumon bits
    growth_result = await albi.consume_bits(simple_bits)
    print(f"🧠 ALBI consumed {len(simple_bits)} bits")
    print(f"📈 Growth: {growth_result.get('📈 intelligence_growth', 'No growth info')}")
    
    # Kontrollo gjendjen e ALBI
    albi_status = albi.get_growth_status()
    print(f"🌟 ALBI Intelligence Level: {albi_status.get('🧠 intelligence_level', 'Unknown')}")
    
    print(f"\n✨ Demo completed successfully! System is working! 🎉")
    
    return {
        "demo_status": "success",
        "characters_active": 3,
        "albi_intelligence": albi_status.get('🧠 intelligence_level', 1.0),
        "message": "NeuroSonix Neural Ecosystem is operational! 🌈"
    }

if __name__ == "__main__":
    import asyncio
    asyncio.run(quick_demo())