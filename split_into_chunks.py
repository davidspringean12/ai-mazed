from langchain.text_splitter import RecursiveCharacterTextSplitter
import glob
import json

# Increased chunk size for better context preservation
# Larger overlap to maintain continuity across chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1200,  # Increased from 500 to capture more complete information
    chunk_overlap=200,  # Increased from 50 to ensure context continuity
    separators=["\n\n", "\n", ". ", " "]  # Better separation hierarchy
)

all_docs = []

for file_path in glob.glob("data/*.txt"):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    chunks = text_splitter.split_text(text)
    for chunk in chunks:
        all_docs.append({
            "source": file_path,
            "content": chunk
        })

print(f"✅ Split into {len(all_docs)} chunks.")

# Save chunks to JSON file
with open("data/chunks.json", "w", encoding="utf-8") as f:
    json.dump(all_docs, f, ensure_ascii=False, indent=2)

print(f"✅ Saved {len(all_docs)} chunks to data/chunks.json")
