# Chatbot Accuracy Improvements Guide

## Problems Identified and Solutions Implemented

### 1. ❌ **Single Chunk Retrieval (CRITICAL)**

**Problem:** The system was only retrieving the **single most similar chunk** to answer questions. This caused:

- Incomplete answers when information spans multiple chunks
- Missing context that could clarify ambiguous queries
- Poor responses for complex multi-part questions

**Solution Implemented:**

- ✅ Changed to **TOP-K retrieval** (5 chunks)
- ✅ Combines multiple relevant chunks into unified context
- ✅ Provides LLM with broader context for better answers

**Code Change in `api_server.py`:**

```python
# OLD: Single chunk
top_idx = int(np.argmax(similarities))
relevant_chunk = texts[top_idx]

# NEW: Multiple chunks
TOP_K = 5
top_k_indices = np.argsort(similarities)[-TOP_K:][::-1]
combined_context = "\n\n---\n\n".join(relevant_chunks)
```

---

### 2. ❌ **Chunks Too Small**

**Problem:** Chunk size of **500 characters** with only **50 overlap** was:

- Breaking sentences and paragraphs mid-thought
- Losing important context relationships
- Creating fragmented information that's hard to understand

**Solution Implemented:**

- ✅ Increased chunk size to **1200 characters** (2.4x larger)
- ✅ Increased overlap to **200 characters** (4x larger)
- ✅ Better separation hierarchy for natural breaks

**Code Change in `split_into_chunks.py`:**

```python
# OLD
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " "]
)

# NEW
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1200,  # More complete information per chunk
    chunk_overlap=200,  # Better context continuity
    separators=["\n\n", "\n", ". ", " "]
)
```

---

### 3. ❌ **No Confidence Threshold**

**Problem:** System would always return an answer, even when:

- Query was completely unrelated to knowledge base
- Similarity was very low (random match)
- No relevant information existed

**Solution Implemented:**

- ✅ Added **similarity threshold of 0.65**
- ✅ Returns helpful fallback message when below threshold
- ✅ Includes **confidence scores** (high/medium/low) in response

**Code Added:**

```python
SIMILARITY_THRESHOLD = 0.65

if similarities[idx] >= SIMILARITY_THRESHOLD:
    relevant_chunks.append(texts[idx])

if not relevant_chunks:
    return "Nu am găsit informații relevante..."
```

---

### 4. ❌ **No Query Preprocessing**

**Problem:** Romanian abbreviations and informal language caused:

- Poor embedding matches (e.g., "fse" vs "Facultatea de Științe Economice")
- Missing results when using common shortcuts
- Reduced accuracy for casual queries

**Solution Implemented:**

- ✅ **Query expansion** for common abbreviations
- ✅ Adds semantic context to improve matching
- ✅ Handles both formal and informal language

**Code Added:**

```python
def preprocess_query(query: str) -> str:
    abbreviations = {
        'fse': 'Facultatea de Științe Economice',
        'ulbs': 'Universitatea Lucian Blaga Sibiu',
        'licenta': 'lucrare de licență',
        'camin': 'cămin dormitor cazare',
        'bursa': 'bursă financiară',
        # ... more mappings
    }
    # Expands query with full terms
```

---

### 5. ✨ **Additional Improvements**

#### **Lower Temperature**

- Changed from default to **0.3** for more factual, consistent responses
- Reduces hallucination and creative interpretation

#### **Better Model**

- Changed from `gpt-5` (which doesn't exist) to **`gpt-4o`**
- Improved reasoning and instruction following

#### **Enhanced Prompt**

- Clear instructions to use ALL provided chunks
- Explicit request for cross-referencing information
- Guidance on handling incomplete information

---

## 🔄 How to Apply These Changes

### Step 1: Recreate Chunks with New Settings

```bash
cd "/Users/sb70cta/Desktop/Chatbot Hackathon/ai-mazed"
python split_into_chunks.py
```

### Step 2: Regenerate Embeddings

```bash
# Clear old embeddings first (in Supabase dashboard or via SQL)
# Then run:
python generate_embeddings.py
```

### Step 3: Restart API Server

```bash
# Stop current server (Ctrl+C)
python api_server.py
```

### Step 4: Test Improvements

Try these test queries to see the difference:

- "Care sunt conditiile pentru bursa de performanta?"
- "Cand incepe sesiunea de examene?"
- "Vreau sa fac licenta despre marketing"
- "fse orar" (tests abbreviation expansion)

---

## 📊 Expected Improvements

| Metric                | Before    | After      | Improvement              |
| --------------------- | --------- | ---------- | ------------------------ |
| Context per query     | 500 chars | 6000 chars | **12x more**             |
| Chunks retrieved      | 1         | 5          | **5x more**              |
| Chunk overlap         | 50        | 200        | **4x better continuity** |
| False positives       | High      | Low        | **Threshold filtering**  |
| Abbreviation handling | None      | Yes        | **Better matching**      |
| Response quality      | Variable  | Consistent | **Lower temperature**    |

---

## 🔍 Monitoring Accuracy

The API now returns additional metadata to help you monitor:

```json
{
  "response": "...",
  "confidence": "high", // high, medium, or low
  "chunks_used": 5, // how many chunks were relevant
  "source": "...",
  "url": "..."
}
```

**Interpret confidence:**

- **high** (>0.8): Very confident, accurate answer
- **medium** (0.7-0.8): Good match, likely accurate
- **low** (0.65-0.7): Borderline relevance, verify answer

---

## ⚙️ Fine-Tuning Parameters

If you want to adjust the system further:

### In `api_server.py`:

```python
# Retrieve more/fewer chunks
TOP_K = 5  # Try 3-7

# Adjust similarity threshold
SIMILARITY_THRESHOLD = 0.65  # Try 0.6-0.75
# Lower = more permissive, Higher = stricter

# Adjust response creativity
temperature=0.3  # Try 0.1-0.5
# Lower = more factual, Higher = more creative
```

### In `split_into_chunks.py`:

```python
# Adjust chunk size
chunk_size=1200  # Try 800-1500

# Adjust overlap
chunk_overlap=200  # Try 150-300 (15-25% of chunk_size)
```

---

## 🐛 Troubleshooting

### "Still getting inaccurate responses"

1. Check if embeddings were regenerated with new chunk size
2. Verify data files in `data/` folder are complete and up-to-date
3. Test with very specific questions first
4. Check the `confidence` score - low confidence = data might be missing

### "Getting 'no relevant information' too often"

- Lower `SIMILARITY_THRESHOLD` to 0.6 or 0.55
- Check if query preprocessing is working (add more abbreviations)
- Verify embeddings loaded: visit `http://localhost:5001/api/health`

### "Responses are too long/verbose"

- Adjust system prompt to request concise answers
- Reduce `TOP_K` from 5 to 3
- Increase `SIMILARITY_THRESHOLD` to 0.7

### "Model says it doesn't know, but data exists"

- Check if data is properly chunked (view `data/chunks.json`)
- Test query preprocessing with print statements
- Try rephrasing the question more explicitly
- Ensure embeddings were regenerated after chunk changes

---

## 📈 Next Steps for Even Better Accuracy

1. **Add Reranking**: Use a cross-encoder model to rerank top-k results
2. **Implement Hybrid Search**: Combine semantic + keyword search (BM25)
3. **Add Query Intent Classification**: Route different query types differently
4. **Implement Feedback Loop**: Log bad responses and retrain/adjust
5. **Add Caching**: Cache common questions for consistency
6. **Use RAG Evaluation**: Implement RAGAS or similar metrics

---

## 💡 Key Takeaways

The main accuracy improvements come from:

1. **More context** = better answers (top-k retrieval)
2. **Larger chunks** = more complete information
3. **Quality filtering** = fewer wrong answers (threshold)
4. **Query enhancement** = better retrieval (preprocessing)
5. **Consistent behavior** = reliable output (lower temperature)

These changes should significantly improve accuracy while maintaining fast response times.
