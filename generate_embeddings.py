from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from a .env file (if present)
load_dotenv()

# import the chunks list produced by split_into_chunks.py
from split_into_chunks import all_docs

# Validate API key early with a friendly message
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise SystemExit(
        "OPENAI_API_KEY environment variable is not set.\n"
        "Export it in your shell, e.g. `export OPENAI_API_KEY=sk-...`, or create a .env file with that variable."
    )

client = OpenAI(api_key=api_key)

embeddings = []
for i, doc in enumerate(all_docs):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=doc["content"]
    )
    embeddings.append({
        "embedding": response.data[0].embedding,
        "text": doc["content"],
        "source": doc["source"]
    })
    if i % 50 == 0:
        print(f"Processed {i} chunks...")

print("✅ All chunks embedded.")

