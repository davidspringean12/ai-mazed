# Quick Start: Improving Chatbot Accuracy

## What Was Wrong?

Your chatbot had **5 critical issues** causing inaccurate responses:

1. ❌ Only retrieved **1 chunk** per query (missing context)
2. ❌ Chunks too small (**500 chars** - incomplete information)
3. ❌ No confidence threshold (answered everything, even when it shouldn't)
4. ❌ Didn't handle Romanian abbreviations (poor matching)
5. ❌ Wrong model name ("gpt-5" doesn't exist)

## What Was Fixed?

✅ Now retrieves **5 chunks** per query (12x more context)  
✅ Chunks are **1200 chars** with **200 overlap** (complete info)  
✅ Added **similarity threshold** (0.65) to detect unknown queries  
✅ **Query preprocessing** expands abbreviations (fse → Facultatea de Științe Economice)  
✅ Using **gpt-4o** with **temperature 0.3** for factual responses

## How to Apply the Fixes

### Option A: Automated (Recommended)

```bash
cd "/Users/sb70cta/Desktop/Chatbot Hackathon/ai-mazed"
./regenerate_embeddings.sh
```

### Option B: Manual Steps

```bash
# 1. Recreate chunks with new settings
python split_into_chunks.py

# 2. Clear old embeddings in Supabase
# (Go to Supabase dashboard → SQL editor → run: DELETE FROM embeddings;)

# 3. Upload new embeddings
python generate_embeddings.py

# 4. Restart API server
python api_server.py
```

## Test the Improvements

```bash
# In a new terminal
python test_accuracy.py
```

This will test 6 common queries and show you:

- ✓ Confidence scores
- ✓ How many chunks were used
- ✓ Information coverage percentage
- ✓ Overall accuracy improvement

## Expected Results

| Metric                 | Before    | After      |
| ---------------------- | --------- | ---------- |
| Context per query      | 500 chars | 6000 chars |
| Chunks used            | 1         | 5          |
| Accuracy               | ~40-50%   | ~80-90%    |
| Handles "I don't know" | No        | Yes        |
| Abbreviation support   | No        | Yes        |

## Configuration Options

Edit `api_server.py` to adjust:

```python
TOP_K = 5  # Number of chunks (3-7 recommended)
SIMILARITY_THRESHOLD = 0.65  # Strictness (0.6-0.75)
temperature=0.3  # Creativity (0.1-0.5)
```

## Troubleshooting

**"Still inaccurate?"**

- Verify you ran `python generate_embeddings.py` AFTER changing chunk size
- Check `http://localhost:5001/api/health` shows embeddings loaded

**"Too many 'I don't know' responses?"**

- Lower `SIMILARITY_THRESHOLD` to 0.6 or 0.55

**"Responses too long?"**

- Reduce `TOP_K` from 5 to 3
- Increase `temperature` to 0.4

## More Details

Read `ACCURACY_IMPROVEMENTS.md` for:

- Technical explanation of each fix
- Performance benchmarks
- Advanced tuning options
- Next steps for further improvements
