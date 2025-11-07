from supabase import create_client, Client
import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import time
from typing import List, Dict


def load_env_vars():
    load_dotenv()
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    missing = [name for name, val in (("SUPABASE_URL", SUPABASE_URL), ("SUPABASE_KEY", SUPABASE_KEY), ("OPENAI_API_KEY", OPENAI_API_KEY)) if not val]
    if missing:
        raise EnvironmentError(f"Missing environment variables: {', '.join(missing)}. Please set them in your .env or shell before running this script.")
    return SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY


def read_chunks(path: str = "data/chunks.json") -> List[Dict]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Chunks file not found: {path}. Run split_into_chunks.py first to create it.")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_embeddings(openai_client: OpenAI, chunks: List[Dict]) -> List[Dict]:
    embeddings = []
    for i, chunk in enumerate(chunks):
        # create embedding
        resp = openai_client.embeddings.create(model="text-embedding-3-small", input=chunk["content"])
        vec = resp.data[0].embedding
        embeddings.append({
            "embedding": vec,
            "text": chunk.get("content", ""),
            "source": chunk.get("source", "")
        })
        if (i + 1) % 50 == 0:
            print(f"Generated embeddings for {i+1} chunks")
            time.sleep(1)
    return embeddings


def insert_into_supabase(supabase: Client, embeddings: List[Dict]):
    for i, e in enumerate(embeddings):
        supabase.table("embeddings").insert({
            "source": e["source"],
            "content": e["text"],
            "embedding": e["embedding"]
        }).execute()
        if (i + 1) % 50 == 0:
            print(f"Inserted {i+1} embeddings into Supabase")


def main():
    SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY = load_env_vars()

    # init clients
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # read chunks
    chunks = read_chunks()
    print(f"Read {len(chunks)} chunks from data/chunks.json")

    # generate embeddings
    embeddings = generate_embeddings(openai_client, chunks)
    print(f"Generated {len(embeddings)} embeddings")

    # insert to supabase
    insert_into_supabase(supabase, embeddings)
    print("Done: inserted all embeddings into Supabase")


if __name__ == "__main__":
    main()
