# Link Integration Feature - Implementation Guide

## Overview

This feature enables the chatbot to automatically include relevant university webpage links in its responses, enhancing user experience by providing direct access to official sources.

## How It Works

### 1. **URL Mapping System**

- File: `url_mappings.json`
- Maps each data source file to its corresponding university webpage
- Includes a fallback URL for unmapped sources

### 2. **Integration Flow**

```
User Query → Retrieval (RAG) → Get Source File → Map to URL → Include in Prompt → AI Response with Link
```

### 3. **Response Format**

The chatbot will automatically include links when relevant:

- **Romanian**: "Pentru mai multe detalii, consultați: [link]"
- **English**: "For more details, visit: [link]"

## Configuration

### Current URL Mappings

Edit `url_mappings.json` to update or add new mappings:

```json
{
  "source_to_url": {
    "data/departament.txt": "https://economice.ulbsibiu.ro/departamente-profesori",
    "data/cercetare.txt": "https://economice.ulbsibiu.ro/cercetare",
    "data/structura-2025-2026.txt": "https://economice.ulbsibiu.ro/calendar-academic",
    "data/licentamk.txt": "https://economice.ulbsibiu.ro/programe-studii"
  },
  "fallback_url": "https://economice.ulbsibiu.ro"
}
```

### Adding New URL Mappings

**When you add new data sources:**

1. Add the new `.txt` file to `data/` folder
2. Run your embedding pipeline to process it
3. **Update `url_mappings.json`**:
   ```json
   {
     "source_to_url": {
       "data/your_new_file.txt": "https://economice.ulbsibiu.ro/corresponding-page",
       ...existing mappings...
     }
   }
   ```

## Example Interactions

### Example 1: Academic Calendar Question

**User**: "Când începe sesiunea de examene?"

**Response**:

```
Sesiunea de examene pentru semestrul I începe pe 26 ianuarie 2026 și se încheie pe 15 februarie 2026.

Pentru mai multe detalii despre calendarul academic, consultați:
https://economice.ulbsibiu.ro/calendar-academic
```

### Example 2: Professor Information

**User**: "Who teaches at the Economics department?"

**Response**:

```
The Economics Faculty has numerous professors including:
• Prof.dr. Carmen Comaniciu
• Prof.dr. Claudia Ogrean
• Prof.dr. Camelia Oprean-Stan
... (and many more)

For the complete list and contact information, visit:
https://economice.ulbsibiu.ro/departamente-profesori
```

### Example 3: Research Information

**User**: "Ce activități de cercetare are facultatea?"

**Response**:

```
Facultatea de Științe Economice desfășoară activități de cercetare prin:

• **Centrul de Cercetări Economice** - promovează cercetarea fundamentală și aplicativă
• **IECS (International Economic Conference of Sibiu)** - eveniment academic major
• Proiecte europene (Horizon Europe, PNRR)
• Colaborări internaționale cu cercetători străini

Pentru mai multe detalii, consultați:
https://economice.ulbsibiu.ro/cercetare
```

## Advanced Features

### Multi-Source Responses (Future Enhancement)

Currently retrieves top 1 source. Can be extended to:

- Retrieve top K sources
- Include multiple relevant links
- Aggregate information from various pages

### Implementation:

```python
# Get top 3 sources instead of 1
top_k = 3
top_indices = np.argsort(similarities)[-top_k:][::-1]

urls = []
for idx in top_indices:
    source = sources[idx]
    url = url_mappings["source_to_url"].get(source)
    if url and url not in urls:
        urls.append(url)
```

## Troubleshooting

### Issue: Links not appearing

**Check:**

1. `url_mappings.json` exists in project root
2. Source file names match exactly (case-sensitive)
3. URLs are valid and accessible

### Issue: Wrong link displayed

**Solution:**
Update the mapping in `url_mappings.json` for the specific source file.

### Issue: Fallback URL always shown

**Reason:**
Source file not in mapping dictionary. Add it to `url_mappings.json`.

## Future Enhancements

### Option A: Database Integration

Add `url` column to Supabase `embeddings` table:

```sql
ALTER TABLE embeddings ADD COLUMN url TEXT;
```

Benefits:

- Single source of truth
- No separate configuration file
- Easier to maintain at scale

### Option B: Web Scraping with URL Preservation

When scraping web pages directly:

```python
import trafilatura

url = "https://economice.ulbsibiu.ro/calendar-academic"
html = requests.get(url).text
text = trafilatura.extract(html)

# Store both text and URL
chunk = {
    "content": text,
    "source": url,  # Direct URL instead of file path
    "url": url
}
```

### Option C: Smart Link Context

Analyze query intent to determine which specific page section to link:

```python
link_mappings = {
    "calendar|examene|sesiune": "https://economice.ulbsibiu.ro/calendar-academic",
    "profesor|cadre didactice|contact": "https://economice.ulbsibiu.ro/departamente-profesori",
    "cercetare|research|publicații": "https://economice.ulbsibiu.ro/cercetare"
}
```

## Testing

### Manual Test Cases

1. **Professor query**: Should link to departamente-profesori page
2. **Calendar query**: Should link to calendar-academic page
3. **Research query**: Should link to cercetare page
4. **Unmapped source**: Should use fallback URL

### Automated Testing

```python
def test_url_mapping():
    assert url_mappings["source_to_url"]["data/departament.txt"] == "https://economice.ulbsibiu.ro/departamente-profesori"
    assert "fallback_url" in url_mappings
    print("✅ URL mappings validated")
```

## Maintenance

**Regular Updates Needed:**

- When university website structure changes
- When new pages are added
- When URLs change or redirect
- When new data sources are indexed

**Best Practice:**
Review and update `url_mappings.json` monthly or whenever content is updated.

---

**Status**: ✅ Fully Implemented and Ready for Production
**Last Updated**: November 7, 2025
