from langchain.text_splitter import RecursiveCharacterTextSplitter
import glob
import json

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " "]
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
