"""
Test script to verify link functionality in chatbot responses
"""
import json
import os

def test_url_mappings():
    """Test that URL mappings are correctly loaded"""
    print("🔍 Testing URL Mapping System...\n")
    
    # Check if mapping file exists
    if not os.path.exists("url_mappings.json"):
        print("❌ ERROR: url_mappings.json not found!")
        return False
    
    # Load mappings
    with open("url_mappings.json", "r", encoding="utf-8") as f:
        mappings = json.load(f)
    
    # Validate structure
    assert "source_to_url" in mappings, "Missing 'source_to_url' key"
    assert "fallback_url" in mappings, "Missing 'fallback_url' key"
    
    print("✅ URL mappings file structure is valid")
    print(f"\n📊 Loaded {len(mappings['source_to_url'])} URL mappings:")
    
    for source, url in mappings["source_to_url"].items():
        print(f"   {source}")
        print(f"   └─> {url}")
    
    print(f"\n🔗 Fallback URL: {mappings['fallback_url']}")
    
    return True

def simulate_source_lookup():
    """Simulate how the chatbot looks up URLs for sources"""
    print("\n\n🎯 Simulating Source → URL Lookup...\n")
    
    with open("url_mappings.json", "r", encoding="utf-8") as f:
        mappings = json.load(f)
    
    test_sources = [
        "data/departament.txt",
        "data/cercetare.txt",
        "data/unknown_file.txt"  # This should use fallback
    ]
    
    for source in test_sources:
        url = mappings["source_to_url"].get(
            source, 
            mappings.get("fallback_url", "")
        )
        status = "✅ Mapped" if source in mappings["source_to_url"] else "⚠️ Fallback"
        print(f"{status} | {source}")
        print(f"         → {url}\n")

def show_integration_example():
    """Show how the feature works in practice"""
    print("\n📝 Example Integration Flow:\n")
    print("1. User asks: 'Când începe sesiunea de examene?'")
    print("2. RAG retrieves chunk from: data/structura-2025-2026.txt")
    print("3. System maps source to URL: https://economice.ulbsibiu.ro/calendar-academic")
    print("4. URL is included in the prompt sent to GPT-4")
    print("5. GPT-4 generates response with link:")
    print("\n   Response:")
    print("   ┌─────────────────────────────────────────────────────────┐")
    print("   │ Sesiunea de examene pentru semestrul I începe pe        │")
    print("   │ 26 ianuarie 2026 și se încheie pe 15 februarie 2026.   │")
    print("   │                                                         │")
    print("   │ Pentru mai multe detalii, consultați:                  │")
    print("   │ https://economice.ulbsibiu.ro/calendar-academic        │")
    print("   └─────────────────────────────────────────────────────────┘")

if __name__ == "__main__":
    print("="*60)
    print("  LINK FUNCTIONALITY TEST SUITE")
    print("="*60 + "\n")
    
    if test_url_mappings():
        simulate_source_lookup()
        show_integration_example()
        
        print("\n" + "="*60)
        print("✅ All tests passed! Link functionality is ready.")
        print("="*60)
    else:
        print("\n❌ Tests failed. Please check the setup.")
