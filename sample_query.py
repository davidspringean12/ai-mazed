import os
import numpy as np
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Initialize clients ---
client = OpenAI(api_key=OPENAI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Step 3: Define your query ---
query = "Care este strucutura universitara pentru semestrul II 2025-2026?"

# Generate embedding for the query
query_vector = client.embeddings.create(
    model="text-embedding-3-small",
    input=query
).data[0].embedding

# --- Step 4: Retrieve all embeddings from Supabase ---
data = supabase.table("embeddings").select("*").execute().data
vectors = np.array([row["embedding"] for row in data])
texts = [row["content"] for row in data]
sources = [row["source"] for row in data]

# --- Step 5: Compute cosine similarity and find the top match ---
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

similarities = [cosine_similarity(query_vector, v) for v in vectors]
top_idx = int(np.argmax(similarities))

# --- Print the most relevant chunk ---
print("\n--- Most Relevant Chunk ---")
print("Source:", sources[top_idx])
print("Content:", texts[top_idx])
