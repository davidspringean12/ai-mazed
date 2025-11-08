#!/bin/bash

# Regenerate Embeddings Script
# This script recreates chunks and embeddings with the improved settings

echo "🔄 Regenerating chatbot embeddings with improved accuracy settings..."
echo ""

# Step 1: Recreate chunks
echo "📝 Step 1/3: Splitting documents into optimized chunks (1200 chars, 200 overlap)..."
python split_into_chunks.py

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to split chunks"
    exit 1
fi

echo "✅ Chunks created successfully"
echo ""

# Step 2: Check if we should clear old embeddings
echo "⚠️  Step 2/3: Clearing old embeddings from Supabase..."
echo "Please manually clear the 'embeddings' table in Supabase dashboard, or run:"
echo "DELETE FROM embeddings;"
echo ""
read -p "Press Enter when ready to continue..."

# Step 3: Generate and upload new embeddings
echo "🔮 Step 3/3: Generating and uploading new embeddings..."
python generate_embeddings.py

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate embeddings"
    exit 1
fi

echo ""
echo "✅ All done! New embeddings uploaded successfully."
echo ""
echo "📊 Summary of improvements:"
echo "  - Chunk size: 500 → 1200 chars (2.4x larger)"
echo "  - Overlap: 50 → 200 chars (4x larger)"
echo "  - Retrieval: 1 → 5 chunks per query"
echo "  - Added similarity threshold: 0.65"
echo "  - Added query preprocessing"
echo ""
echo "🚀 Restart your API server:"
echo "   python api_server.py"
echo ""
