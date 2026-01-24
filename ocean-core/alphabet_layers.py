"""
ALPHABET LAYERS - Mathematical Layer System
============================================
Sistemi i plotë i 60 shtresave alfabetiko-matematikore
Greek (24) + Albanian (36) = 60 unique mathematical layers

Çdo shkronjë është një funksion matematikor i pastër.
Fjalët kompozohen në shtresa të reja.
"""

import numpy as np
from typing import Dict, List, Callable, Any, Optional
import hashlib
import logging
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger("alphabet_layers")


@dataclass
class LayerResult:
    """Rezultati i një shtrese matematikore"""
    layer_name: str
    input_value: Any
    output_value: Any
    complexity: float
    phonetic_properties: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class AlbanianGreekLayerSystem:
    """Sistemi i plotë i 60 shtresave alfabetiko-matematikore"""
    
    def __init__(self):
        self.alphabet = self._initialize_alphabet()
        self.layers: Dict[str, Callable] = {}
        self.phonetic_map = self._initialize_phonetics()
        self.layer_history: List[LayerResult] = []
        self.initialize_base_layers()
        logger.info(f"✅ AlphabetLayerSystem initialized with {self.alphabet['size']} letters")
    
    def _initialize_alphabet(self) -> Dict[str, Any]:
        """Inicializon alfabetin e plotë greko-shqip"""
        # Alfabeti grek (24 shkronja)
        greek = [chr(i) for i in range(0x03B1, 0x03C9+1)]  # α deri ω
        
        # Alfabeti shqip (36 shkronja)
        albanian = [
            'a', 'b', 'c', 'ç', 'd', 'dh', 'e', 'ë', 'f', 'g', 'gj', 'h',
            'i', 'j', 'k', 'l', 'll', 'm', 'n', 'nj', 'o', 'p', 'q', 'r',
            'rr', 's', 'sh', 't', 'th', 'u', 'v', 'x', 'xh', 'y', 'z', 'zh'
        ]
        
        return {
            'greek': greek,
            'albanian': albanian,
            'all': greek + albanian,  # 60 shkronja
            'size': len(greek) + len(albanian)
        }
    
    def _initialize_phonetics(self) -> Dict[str, Dict[str, Any]]:
        """Inicializon vetitë fonetike për çdo shkronjë"""
        phonetics = {}
        
        # Zanore shqipe
        vowels = ['a', 'e', 'ë', 'i', 'o', 'u', 'y']
        
        # Bashkëtingëllore
        consonants = ['b', 'c', 'ç', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 
                      'n', 'p', 'q', 'r', 's', 't', 'v', 'x', 'z']
        
        # Digrafët
        digraphs = ['dh', 'gj', 'll', 'nj', 'rr', 'sh', 'th', 'xh', 'zh']
        
        for letter in self.alphabet['albanian']:
            if letter in vowels:
                phonetics[letter] = {
                    'type': 'vowel',
                    'frequency': vowels.index(letter) * 0.15 + 0.5,
                    'resonance': 1.0 + vowels.index(letter) * 0.1
                }
            elif letter in digraphs:
                phonetics[letter] = {
                    'type': 'consonant',
                    'digraph': True,
                    'frequency': 0.3 + digraphs.index(letter) * 0.08,
                    'complexity': 2.0  # Digrafët kanë kompleksitet më të lartë
                }
            else:
                phonetics[letter] = {
                    'type': 'consonant',
                    'frequency': 0.2 + (consonants.index(letter) if letter in consonants else 0) * 0.05,
                    'complexity': 1.0
                }
        
        # Shkronjat greke - matematikë e pastër
        greek_functions = {
            'α': {'function': 'origin', 'domain': 'quantum'},
            'β': {'function': 'distribution', 'domain': 'probability'},
            'γ': {'function': 'gamma', 'domain': 'factorial'},
            'δ': {'function': 'change', 'domain': 'differential'},
            'ε': {'function': 'epsilon', 'domain': 'limits'},
            'ζ': {'function': 'zeta', 'domain': 'primes'},
            'η': {'function': 'eta', 'domain': 'efficiency'},
            'θ': {'function': 'theta', 'domain': 'angles'},
            'ι': {'function': 'iota', 'domain': 'infinitesimal'},
            'κ': {'function': 'kappa', 'domain': 'curvature'},
            'λ': {'function': 'lambda', 'domain': 'wavelength'},
            'μ': {'function': 'mu', 'domain': 'mean'},
            'ν': {'function': 'nu', 'domain': 'frequency'},
            'ξ': {'function': 'xi', 'domain': 'random'},
            'ο': {'function': 'omicron', 'domain': 'order'},
            'π': {'function': 'pi', 'domain': 'circle'},
            'ρ': {'function': 'rho', 'domain': 'density'},
            'σ': {'function': 'sigma', 'domain': 'sum'},
            'τ': {'function': 'tau', 'domain': 'time'},
            'υ': {'function': 'upsilon', 'domain': 'velocity'},
            'φ': {'function': 'phi', 'domain': 'golden'},
            'χ': {'function': 'chi', 'domain': 'distribution'},
            'ψ': {'function': 'psi', 'domain': 'wave'},
            'ω': {'function': 'omega', 'domain': 'end'},
        }
        
        for letter in self.alphabet['greek']:
            if letter in greek_functions:
                phonetics[letter] = {
                    'type': 'greek',
                    **greek_functions[letter],
                    'frequency': 1.0,
                    'complexity': 1.5
                }
        
        return phonetics
    
    def initialize_base_layers(self):
        """Krijon shtresat bazë për çdo shkronjë"""
        for letter in self.alphabet['all']:
            self.layers[letter] = self._create_letter_layer(letter)
        logger.info(f"📊 Created {len(self.layers)} base layers")
    
    def _create_letter_layer(self, letter: str) -> Callable:
        """Krijon një shtresë matematikore për një shkronjë"""
        # Krijo një hash unik për shkronjën
        letter_hash = int(hashlib.md5(letter.encode()).hexdigest()[:8], 16)
        letter_hash_normalized = (letter_hash % 1000) / 1000.0  # 0.0 - 1.0
        
        phonetic_props = self.phonetic_map.get(letter, {'type': 'unknown', 'frequency': 0.5})
        
        if letter in self.alphabet['greek']:
            # Shtresa greke - matematikë e pastër
            def greek_layer(x, params={'letter': letter, 'hash': letter_hash_normalized, 'props': phonetic_props}):
                try:
                    if isinstance(x, str):
                        # Konverto string në vektor numerik
                        x = np.array([ord(c) for c in x[:100]], dtype=float)
                    
                    x = np.atleast_1d(np.array(x, dtype=float))
                    base = np.sin(params['hash'] * np.pi * x) * np.cos(params['hash'] * np.pi * x)
                    
                    # Funksione specifike për shkronja të caktuara
                    domain = params['props'].get('domain', 'general')
                    
                    if domain == 'quantum':
                        return np.abs(base) * np.exp(-np.abs(x) * 0.1)
                    elif domain == 'probability':
                        return np.tanh(base)
                    elif domain == 'differential':
                        return np.gradient(base) if len(base) > 1 else base
                    elif domain == 'golden':
                        phi = (1 + np.sqrt(5)) / 2
                        return base * phi
                    elif domain == 'wave':
                        return base * np.exp(1j * params['hash'] * np.pi)
                    else:
                        return base
                except Exception as e:
                    logger.warning(f"Layer error for {letter}: {e}")
                    return np.array([0.0])
            
            return greek_layer
        
        else:
            # Shtresa shqipe - kombinim i matematikës dhe fonetikës
            def albanian_layer(x, params={'letter': letter, 'hash': letter_hash_normalized, 'props': phonetic_props}):
                try:
                    if isinstance(x, str):
                        x = np.array([ord(c) for c in x[:100]], dtype=float)
                    
                    x = np.atleast_1d(np.array(x, dtype=float))
                    base = np.sin(params['hash'] * np.pi * x)
                    
                    letter_type = params['props'].get('type', 'consonant')
                    freq = params['props'].get('frequency', 0.5)
                    
                    if letter_type == 'vowel':
                        # Zanoret janë më rezonante
                        resonance = params['props'].get('resonance', 1.0)
                        return base * resonance * np.cos(freq * np.pi * x)
                    elif params['props'].get('digraph', False):
                        # Digrafët janë më komplekse
                        complexity = params['props'].get('complexity', 2.0)
                        return base * complexity * np.tanh(x * 0.1)
                    else:
                        # Bashkëtingëlloret janë më të mprehta
                        return base * np.sign(x) * np.abs(np.sin(freq * x))
                except Exception as e:
                    logger.warning(f"Layer error for {letter}: {e}")
                    return np.array([0.0])
            
            return albanian_layer
    
    def _decompose_word(self, word: str) -> List[str]:
        """Zbërthen një fjalë në shkronjat e saj (duke trajtuar digrafët)"""
        letters = []
        i = 0
        word_lower = word.lower()
        
        while i < len(word_lower):
            # Kontrollo për digrafët shqip (2 karaktere)
            if i + 1 < len(word_lower):
                digraph = word_lower[i:i+2]
                if digraph in ['dh', 'gj', 'll', 'nj', 'rr', 'sh', 'th', 'xh', 'zh']:
                    letters.append(digraph)
                    i += 2
                    continue
            
            # Shkronjë e vetme
            char = word_lower[i]
            if char in self.alphabet['all'] or char in self.alphabet['greek']:
                letters.append(char)
            i += 1
        
        return letters
    
    def compose(self, word: str) -> Callable:
        """Krijon një shtresë të re nga një fjalë"""
        letters = self._decompose_word(word)
        
        if not letters:
            logger.warning(f"No valid letters in word: {word}")
            return lambda x: np.array([0.0])
        
        # Merr shtresat individuale
        letter_functions = []
        for letter in letters:
            if letter in self.layers:
                letter_functions.append(self.layers[letter])
        
        if not letter_functions:
            return lambda x: np.array([0.0])
        
        # Krijon funksionin e kompozuar
        def composed_function(x):
            result = x
            for func in letter_functions:
                try:
                    result = func(result)
                except:
                    pass
            return result
        
        # Regjistro shtresën e re
        layer_name = f"word_{word}"
        self.layers[layer_name] = composed_function
        
        logger.info(f"📝 Created composed layer '{layer_name}' from {len(letters)} letters: {letters}")
        
        return composed_function
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Proceson një pyetje duke përdorur shtresat alfabetike"""
        words = query.lower().split()
        
        results = []
        total_complexity = 0.0
        
        for word in words[:10]:  # Max 10 fjalë
            letters = self._decompose_word(word)
            
            if letters:
                # Krijo shtresën për këtë fjalë
                word_layer = self.compose(word)
                
                # Apliko shtresën
                try:
                    input_vector = np.array([ord(c) for c in word], dtype=float)
                    output = word_layer(input_vector)
                    
                    # Llogarit kompleksitetin
                    complexity = len(letters) * sum(
                        self.phonetic_map.get(l, {}).get('complexity', 1.0) 
                        for l in letters
                    ) / len(letters)
                    
                    total_complexity += complexity
                    
                    results.append({
                        'word': word,
                        'letters': letters,
                        'letter_count': len(letters),
                        'complexity': round(complexity, 2),
                        'output_magnitude': float(np.abs(output).mean()) if len(output) > 0 else 0.0
                    })
                except Exception as e:
                    logger.warning(f"Error processing word '{word}': {e}")
        
        return {
            'query': query,
            'word_count': len(words),
            'processed_words': len(results),
            'total_complexity': round(total_complexity, 2),
            'average_complexity': round(total_complexity / max(len(results), 1), 2),
            'word_analysis': results,
            'alphabet_size': self.alphabet['size'],
            'active_layers': len(self.layers)
        }
    
    def get_layer_stats(self) -> Dict[str, Any]:
        """Kthen statistika për shtresat"""
        return {
            'total_layers': len(self.layers),
            'greek_letters': len(self.alphabet['greek']),
            'albanian_letters': len(self.alphabet['albanian']),
            'composed_layers': len([k for k in self.layers.keys() if k.startswith('word_')]),
            'phonetic_entries': len(self.phonetic_map)
        }


# Singleton instance
_layer_system: Optional[AlbanianGreekLayerSystem] = None


def get_alphabet_layer_system() -> AlbanianGreekLayerSystem:
    """Merr instancën singleton të sistemit të shtresave"""
    global _layer_system
    if _layer_system is None:
        _layer_system = AlbanianGreekLayerSystem()
    return _layer_system


# Test
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    system = get_alphabet_layer_system()
    
    print("\n🔤 ALPHABET LAYER SYSTEM TEST")
    print("=" * 50)
    
    # Test me fjalë shqipe
    result = system.process_query("dritë e diellit mbi deti")
    print(f"\nQuery: {result['query']}")
    print(f"Total Complexity: {result['total_complexity']}")
    print(f"Active Layers: {result['active_layers']}")
    
    print("\nWord Analysis:")
    for word_data in result['word_analysis']:
        print(f"  • {word_data['word']}: {word_data['letters']} (complexity: {word_data['complexity']})")
    
    # Stats
    stats = system.get_layer_stats()
    print(f"\n📊 Layer Stats: {stats}")
