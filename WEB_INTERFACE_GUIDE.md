# Web Interface Setup & Troubleshooting Guide

## What Was Wrong

1. **Missing `.env` file** - React app couldn't find Supabase credentials
2. **Missing backend API** - Frontend was trying to call a Supabase Edge Function that doesn't exist
3. **Wrong environment variable names** - Vite requires `VITE_` prefix

## Solution Implemented

Created a Flask API server (`api_server.py`) that:

- Connects your React frontend to the existing chatbot logic
- Uses the same RAG system and embeddings
- Returns responses with source URLs
- Stores chat history in Supabase

## How to Run

### Step 1: Install Flask Dependencies

```bash
cd "/Users/sb70cta/Desktop/Chatbot Hackathon/ai-mazed"
pip3 install -r requirements-api.txt
```

### Step 2: Start the API Server (Terminal 1)

```bash
cd "/Users/sb70cta/Desktop/Chatbot Hackathon/ai-mazed"
python3 api_server.py
```

You should see:

```
Starting chatbot API server...
Loaded 4 embeddings
 * Running on http://127.0.0.1:5000
```

### Step 3: Start the React Frontend (Terminal 2)

```bash
cd "/Users/sb70cta/Desktop/Chatbot Hackathon/ai-mazed/web-interface"
npm run dev
```

You should see:

```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open Browser

Go to: **http://localhost:5173/**

## Testing

1. Open the web interface in your browser
2. Type a question like: "Când începe sesiunea de examene?"
3. You should get a response with a link

## File Structure

```
ai-mazed/
├── api_server.py              # Flask backend API (NEW)
├── requirements-api.txt       # API dependencies (NEW)
├── url_mappings.json          # URL mappings for sources
├── chatbot_app.py            # Streamlit version (still works)
├── .env                      # Main environment variables
│
└── web-interface/
    ├── .env                  # React environment variables (NEW)
    ├── src/
    │   ├── hooks/
    │   │   └── useChatSession.ts    # Updated to use local API
    │   ├── App.tsx
    │   └── ...
    └── package.json
```

## Common Issues

### Issue: "Failed to get response"

**Solution:** Make sure the Flask API server is running on port 5000

### Issue: "Missing Supabase environment variables"

**Solution:** The `.env` file in `web-interface/` has been created with the correct values

### Issue: Port 5000 already in use

**Solution:** Change the port in `api_server.py` (line 219) and update `web-interface/.env` `VITE_API_URL`

### Issue: CORS errors

**Solution:** `flask-cors` is already installed and configured in `api_server.py`

### Issue: "Import flask could not be resolved"

**Solution:** This is just a linting warning. Run `pip3 install -r requirements-api.txt` to install Flask

## API Endpoints

### POST /api/chat

Send a message and get a response

**Request:**

```json
{
  "session_id": "uuid-here",
  "message": "Your question"
}
```

**Response:**

```json
{
  "response": "The assistant's answer",
  "source": "data/structura-2025-2026.txt",
  "url": "https://economice.ulbsibiu.ro/calendar-academic",
  "message_id": 123
}
```

### GET /api/health

Check if the server is running

**Response:**

```json
{
  "status": "ok",
  "embeddings_loaded": 4
}
```

## Database Schema (Optional - for tracking)

The API tries to store messages in these Supabase tables:

- `chat_sessions` - User sessions
- `messages` - Chat messages
- `analytics_events` - Analytics
- `message_feedback` - User feedback

If these tables don't exist, the chat will still work but won't store history.

## Quick Test Commands

```bash
# Test if API is running
curl http://localhost:5000/api/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Când începe sesiunea?","session_id":"test-123"}'
```

## Next Steps

1. ✅ Environment files created
2. ✅ Flask API server created
3. ✅ Frontend updated to use local API
4. 🔄 Run both servers (see Step 2 & 3 above)
5. 🎉 Test in browser

---

**Status:** Ready to run!  
**Last Updated:** November 7, 2025
