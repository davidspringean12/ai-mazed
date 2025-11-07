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

# --- Step 1: User query ---
query = "Zi-mi toti profesorii lectori"

# --- Step 2: Generate embedding for the query ---
query_vector = client.embeddings.create(
    model="text-embedding-3-small",
    input=query
).data[0].embedding

# --- Step 3: Retrieve all embeddings from Supabase ---
data = supabase.table("embeddings").select("*").execute().data
vectors = np.array([row["embedding"] for row in data])
texts = [row["content"] for row in data]
sources = [row["source"] for row in data]

# --- Step 4: Find most similar chunk ---
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

similarities = [cosine_similarity(query_vector, v) for v in vectors]
top_idx = int(np.argmax(similarities))

relevant_chunk = texts[top_idx]

# --- Step 5: Feed the chunk into GPT for a clean answer ---
prompt = f"""
You are a helpful university assistant. 
Use ONLY the context below to answer the question. 
If the answer is not in the context, say "Nu există informații disponibile." 
Provide the answer **in bullet points** if possible.

CONTEXT:
{relevant_chunk}

QUESTION:
Zi-mi toti profesorii lectori
{query}
"""

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}]
)

print("\n--- Chatbot Answer ---")
print(response.choices[0].message.content)
