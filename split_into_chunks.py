from langchain_text_splitters import RecursiveCharacterTextSplitter
import glob

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
