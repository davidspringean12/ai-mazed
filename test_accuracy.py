"""
Test script to compare chatbot accuracy before and after improvements
Run this after regenerating embeddings to see the difference
"""

import requests
import json

API_URL = "http://localhost:5001/api/chat"

# Test queries that often failed before improvements
test_queries = [
    {
        "query": "Care sunt conditiile pentru bursa de performanta?",
        "expected_info": ["medie", "8.00", "9.00", "performanță"]
    },
    {
        "query": "Cand incepe sesiunea de examene?",
        "expected_info": ["sesiune", "ianuarie", "februarie", "iunie", "septembrie"]
    },
    {
        "query": "Vreau informatii despre camin",
        "expected_info": ["cămin", "cazare", "dormitor", "contact"]
    },
    {
        "query": "fse orar",  # Tests abbreviation expansion
        "expected_info": ["orar", "edupage", "economice.edupage.org"]
    },
    {
        "query": "Ce masterate sunt disponibile?",
        "expected_info": ["master", "programe"]
    },
    {
        "query": "Cum fac cererea pentru erasmus?",
        "expected_info": ["erasmus", "mobilitate", "cerere", "aplicație"]
    }
]

def test_query(query, expected_info):
    """Test a single query and analyze response quality"""
    try:
        response = requests.post(API_URL, json={
            "message": query,
            "session_id": "test_session"
        })
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get('response', '')
            confidence = data.get('confidence', 'unknown')
            chunks_used = data.get('chunks_used', 0)
            
            # Check if expected information appears in answer
            found_info = [info for info in expected_info if info.lower() in answer.lower()]
            coverage = len(found_info) / len(expected_info) * 100
            
            print(f"\n{'='*80}")
            print(f"Q: {query}")
            print(f"{'-'*80}")
            print(f"Answer: {answer[:200]}...")
            print(f"{'-'*80}")
            print(f"✓ Confidence: {confidence}")
            print(f"✓ Chunks used: {chunks_used}")
            print(f"✓ Information coverage: {coverage:.0f}%")
            print(f"✓ Found keywords: {', '.join(found_info)}")
            
            if coverage >= 50:
                print(f"✅ PASS - Good response quality")
            else:
                print(f"⚠️  PARTIAL - Some information missing")
                print(f"   Missing: {', '.join([i for i in expected_info if i not in found_info])}")
            
            return {
                'query': query,
                'confidence': confidence,
                'chunks_used': chunks_used,
                'coverage': coverage,
                'passed': coverage >= 50
            }
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to API server. Make sure it's running on port 5001")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("🧪 Testing Chatbot Accuracy with New Improvements")
    print("=" * 80)
    print("\nMake sure:")
    print("1. ✓ You've regenerated chunks (python split_into_chunks.py)")
    print("2. ✓ You've regenerated embeddings (python generate_embeddings.py)")
    print("3. ✓ API server is running (python api_server.py)")
    print("\nStarting tests in 3 seconds...")
    
    import time
    time.sleep(3)
    
    results = []
    for test in test_queries:
        result = test_query(test['query'], test['expected_info'])
        if result:
            results.append(result)
        time.sleep(1)  # Brief pause between requests
    
    # Summary
    print(f"\n\n{'='*80}")
    print("📊 TEST SUMMARY")
    print('='*80)
    
    if results:
        passed = sum(1 for r in results if r['passed'])
        total = len(results)
        avg_coverage = sum(r['coverage'] for r in results) / total
        avg_chunks = sum(r['chunks_used'] for r in results) / total
        
        high_conf = sum(1 for r in results if r['confidence'] == 'high')
        medium_conf = sum(1 for r in results if r['confidence'] == 'medium')
        low_conf = sum(1 for r in results if r['confidence'] == 'low')
        
        print(f"\n✅ Passed: {passed}/{total} tests ({passed/total*100:.0f}%)")
        print(f"📊 Average information coverage: {avg_coverage:.0f}%")
        print(f"📚 Average chunks used: {avg_chunks:.1f}")
        print(f"\n🎯 Confidence Distribution:")
        print(f"   High: {high_conf} | Medium: {medium_conf} | Low: {low_conf}")
        
        print("\n💡 Interpretation:")
        if avg_coverage >= 70:
            print("   ✅ Excellent accuracy - system is working well")
        elif avg_coverage >= 50:
            print("   ⚠️  Good accuracy - some improvements possible")
        else:
            print("   ❌ Poor accuracy - check if embeddings were regenerated")
            print("      and if data files are complete")
    else:
        print("❌ No results collected. Check API server connection.")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    main()
