#!/usr/bin/env python3
"""Test Ocean Core with 23 Laboratories"""

import requests
import json

url = 'http://46.224.205.183:8030'

print('=' * 70)
print('🌊 OCEAN CORE 8030 - 23 LABORATORIES INTEGRATION TEST')
print('=' * 70)
print()

# 1. Get laboratory count
print('1. Laboratory Network Overview:')
print('-' * 70)
try:
    r = requests.get(f'{url}/api/laboratories/types', timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f'   ✅ Total Laboratory Types: {data["count"]}')
        print(f'   Types: {", ".join(data["types"][:5])}...')
        print()
except Exception as e:
    print(f'   ❌ Error: {e}')

# 2. Test query routing with laboratories
print('2. Query Routing with Laboratory Intent:')
print('-' * 70)

test_queries = [
    'Tell me about medical laboratories',
    'What AI research are we conducting',
    'Show me marine biology labs',
    'Quantum computing facilities'
]

for query in test_queries:
    try:
        r = requests.post(f'{url}/api/query', params={'question': query}, timeout=5)
        if r.status_code == 200:
            data = r.json()
            intent = data.get('intent', 'unknown')
            persona = data.get('persona_answer', '')
            persona_name = persona.split('\n')[0] if persona else 'Unknown'
            
            print(f'   Q: {query}')
            print(f'      Intent: {intent}')
            print(f'      Persona: {persona_name[:60]}')
            print()
    except Exception as e:
        print(f'   ❌ Error: {e}')

# 3. Get specific lab
print('3. Specific Laboratory Lookup:')
print('-' * 70)
try:
    r = requests.get(f'{url}/api/laboratories/Elbasan_AI', timeout=5)
    if r.status_code == 200:
        lab = r.json()['laboratory']
        print(f"   Lab: {lab['name']}")
        print(f"   Function: {lab['function']}")
        print(f"   Location: {lab['location']}")
        print(f"   Staff: {lab['staff_count']}")
        print(f"   Projects: {lab['active_projects']}")
        print()
except Exception as e:
    print(f'   ❌ Error: {e}')

# 4. Get labs by type
print('4. Filter Labs by Type:')
print('-' * 70)
try:
    r = requests.get(f'{url}/api/laboratories/type/Medical', timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"   Type: {data['type']}")
        print(f"   Count: {data['count']}")
        for lab in data['laboratories']:
            print(f"   - {lab['name']}: {lab['function']}")
        print()
except Exception as e:
    print(f'   ❌ Error: {e}')

# 5. Check health
print('5. Service Health:')
print('-' * 70)
try:
    r = requests.get(f'{url}/health', timeout=5)
    if r.status_code == 200:
        data = r.json()
        print(f"   ✅ Status: {data['status']}")
        print(f"   Service: {data['service']}")
        print()
except Exception as e:
    print(f'   ❌ Error: {e}')

print('=' * 70)
print('✅ OCEAN CORE 8030 WITH 23 LABORATORIES - ALL TESTS COMPLETE')
print('=' * 70)
