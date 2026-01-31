# -*- coding: utf-8 -*-
"""Create initial patterns for autolearning"""
import cbor2
from datetime import datetime, timezone

patterns = {
    'patterns': [
        {
            'pattern_id': 'svc_alba',
            'query_template': r'.*(alba|analytical|analysis|pattern).*',
            'response_template': 'ALBA (port 5555) eshte Analytical Intelligence - per analiza dhe pattern recognition.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'svc_albi',
            'query_template': r'.*(albi|creative|creativity|content).*',
            'response_template': 'ALBI (port 6666) eshte Creative Intelligence - per gjenerim dhe ideation.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'svc_ocean',
            'query_template': r'.*(ocean|knowledge|curiosity|chat).*',
            'response_template': 'Ocean Core (port 8030) eshte Knowledge Engine - truri qendror me 14 persona.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'svc_asi',
            'query_template': r'.*(asi|superintelligence|reasoning|strategy).*',
            'response_template': 'ASI (port 9094) eshte Artificial Super Intelligence - per reasoning avancuar.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'svc_jona',
            'query_template': r'.*(jona|coordinator|orchestrat).*',
            'response_template': 'JONA (port 7777) eshte Master Coordinator - orkestron te gjitha sherbimet.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'services_count',
            'query_template': r'.*(sa sherbime|how many services|microservices|count).*',
            'response_template': 'Clisonix ka 56 microservices: ALBA, ALBI, ASI, Ocean Core, JONA, dhe shume te tjere.',
            'category': 'info',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'founder',
            'query_template': r'.*(founder|themelues|ceo|ledjan).*',
            'response_template': 'Themeluesi dhe CEO i Clisonix eshte Ledjan Ahmati.',
            'category': 'company',
            'confidence': 1.0,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'company',
            'query_template': r'.*(company|kompani|web8|euroweb|gmbh).*',
            'response_template': 'Clisonix eshte produkt i WEB8euroweb GmbH. Website: www.clisonix.com',
            'category': 'company',
            'confidence': 1.0,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'neuro',
            'query_template': r'.*(neuro|brain|eeg|cognitive).*',
            'response_template': 'NeuroSonix (port 8006) ofron Industrial Neuroscience - EEG, brain analysis, cognitive optimization.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'pattern_id': 'cycles',
            'query_template': r'.*(cycle|circadian|ultradian|rhythm).*',
            'response_template': 'Cycle Engine (port 8005) menaxhon ciklet biologjike - circadian, ultradian, alignment.',
            'category': 'service',
            'confidence': 0.95,
            'usage_count': 0,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ],
    'updated_at': datetime.now(timezone.utc).isoformat(),
    'format': 'cbor2'
}

with open('learned_patterns.cbor', 'wb') as f:
    cbor2.dump(patterns, f)

print(f"Created learned_patterns.cbor with {len(patterns['patterns'])} initial patterns")
