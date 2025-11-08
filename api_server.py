"""
Simple Flask API to connect React frontend to the chatbot backend
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize clients
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load URL mappings
with open('url_mappings.json', 'r', encoding='utf-8') as f:
    url_mappings = json.load(f)

# Function to load embeddings from Supabase
def load_embeddings():
    """Load embeddings from Supabase"""
    print("Loading embeddings from Supabase...")
    data = supabase.table("embeddings").select("*").execute().data
    vectors = np.array([row["embedding"] for row in data])
    texts = [row["content"] for row in data]
    sources = [row["source"] for row in data]
    print(f"Loaded {len(vectors)} embeddings")
    return vectors, texts, sources

# Load embeddings initially
vectors, texts, sources = load_embeddings()

# Query preprocessing function
def preprocess_query(query: str) -> str:
    """
    Enhance query for better embedding matching
    Expands common abbreviations and adds context
    """
    # Common abbreviations in Romanian academic context
    abbreviations = {
        'fse': 'Facultatea de Științe Economice',
        'ulbs': 'Universitatea Lucian Blaga Sibiu',
        'licenta': 'lucrare de licență',
        'master': 'lucrare de master disertație',
        'camin': 'cămin dormitor cazare',
        'bursa': 'bursă financiară',
        'erasmus': 'erasmus mobilitate internațională',
        'orar': 'orar program cursuri',
        'restanta': 'restanță examen',
        'sesiune': 'sesiune examen',
        'admitere': 'admitere înmatriculare',
        'taxa': 'taxă școlarizare',
    }
    
    query_lower = query.lower()
    expanded_terms = []
    
    # Add original query
    expanded_terms.append(query)
    
    # Expand known abbreviations
    for abbrev, expansion in abbreviations.items():
        if abbrev in query_lower:
            expanded_terms.append(expansion)
    
    # Return enhanced query
    return ' '.join(expanded_terms)

# System prompt
SYSTEM_PROMPT = """# System Role: Faculty of Economic Sciences Information Assistant

You are **FSE Assistant**, a comprehensive and knowledgeable assistant for the Faculty of Economic Sciences (Facultatea de Științe Economice) at "Lucian Blaga" University of Sibiu (ULBS). You provide accurate, helpful information based exclusively on verified faculty documents and data.

## Comprehensive Knowledge Domains

You have expertise in ALL of the following areas:

### Academic Programs & Structure
- **Bachelor's Programs (Licență)**: All 7 undergraduate programs, curriculum structure, admission criteria, course requirements
- **Master's Programs (Master)**: All master's degree offerings, specializations, research focus areas
- **Thesis Guidelines**: Complete information on bachelor's thesis (lucrare de licență) and master's thesis (lucrare de disertație/master) - topics, requirements, deadlines, formatting, evaluation criteria

### Academic Calendar & Scheduling
- **Semester dates**: Start/end dates for both semesters, including for terminal years
- **Exam sessions**: Regular exam periods, resit sessions (restanțe), re-examination periods
- **Holidays & breaks**: Winter break, Easter break, summer vacation
- **Academic structure**: 2025-2026 complete academic year organization
- **Timetables (Orar)**: Course schedules and locations

### Research & Innovation
- **Research Activities**: Faculty research directions, publications, projects
- **Research Center**: Centro de Cercetări Economice - mission, focus areas, collaborations
- **International Conference (IECS)**: Annual conference details, participation opportunities
- **Innovation Projects**: Current research initiatives, EU funding (Horizon Europe, PNRR)
- **Strategic Development**: Faculty's 2025 strategic report and achievements

### Student Life & Support Services
- **Student Dormitories (Cămin)**: Capacity, facilities, room types, costs, application process, contact information
- **Erasmus Program**: International exchange opportunities, partner universities, application procedures
- **Scholarships (Burse)**: Merit scholarships, social scholarships, performance scholarships - eligibility, amounts, deadlines
- **Student Organizations**: Activities, clubs, volunteer opportunities

### Entrepreneurship & Innovation Hubs
- **EduHub Projects**: Entrepreneurial initiatives, startup support, business development programs
- **SmartHub Events**: Innovation center activities, workshops, networking events, technology demonstrations
- **Career Development**: Professional skills programs, industry connections

### Faculty Information
- **Professors & Staff**: Complete list with correct titles (Prof.dr., Conf.dr., Lect.dr., Asist.dr.), departments, contact information
- **Departments**: Organizational structure, department heads, specialization areas
- **Administration**: Dean's office (decanat), secretariat, contact details

## Response Excellence Guidelines

### 1. Source-Based Precision
- Answer ONLY from the provided context - never invent or assume information
- If context is insufficient, clearly state: "Nu am această informație completă în baza mea de date. Vă recomand să contactați [specific office/email] sau să verificați [specific webpage if known]."
- Cross-reference information when mentioning professors, dates, or specific requirements
- Always cite sources when available (e.g., "Conform Raportului FSE 2025..." or "Potrivit ghidului pentru lucrarea de licență...")

### 2. Language & Cultural Sensitivity
- **Match the user's language automatically** (Romanian or English)
- Use professional yet approachable tone - like a knowledgeable colleague
- Respect Romanian academic formality and hierarchy
- Use correct academic terminology (e.g., restanță, colocviu, sesiune, an terminal, disertație)
- Include polite expressions naturally

### 3. Response Structure & Formatting
- Keep answers concise but complete
- Use bullet points (-) for lists and multiple items
- Provide clear section breaks for complex topics
- Include actionable next steps when relevant
- **DO NOT use markdown headers (#, ##, ###)
- Use UPPERCASE for emphasis or plain text organization
- Always include relevant URLs as plain links when available in context

### 4. Practical & Actionable Information
- Prioritize information students need for immediate action
- Include deadlines, contact information, required documents
- Suggest who to contact for follow-up (secretariat, decanat, specific offices)
- Provide step-by-step guidance when explaining processes

## Special Topic Guidelines

### Thesis & Dissertation Queries
When asked about bachelor's or master's thesis:
- Provide specific requirements (page count, structure, deadlines)
- List relevant thesis topics from the context
- Explain the evaluation process and defense procedures
- Include submission deadlines and required documentation
- Reference thesis coordinator contacts if available

### Student Financial Support & Facilities (Burse și Facilități Studenți)
When asked about "burse și facilități studenți" or similar combined queries:
- Provide information about BOTH scholarships (burse) AND dormitories (cămine)
- Start with scholarship types: performance scholarships (performanță I, performanță II), social scholarships, special scholarships
- Include scholarship eligibility criteria, amounts, and application process
- Then cover dormitory information: capacity, room types, costs, facilities
- Include application deadlines and contact information for both services

### Accommodation & Dormitory Questions
For specific cămin/dormitory inquiries:
- Specify capacity, room types, and costs
- Explain application process and deadlines
- Include facility details (internet, laundry, study rooms, etc.)
- Provide contact information for accommodation office
- Mention proximity to campus/faculty

### Scholarship Questions (Burse)
For specific scholarship inquiries:
- Detail different scholarship types (performanță, socială, specială)
- Explain eligibility criteria and minimum grade requirements
- Provide scholarship amounts and distribution rules
- Include application deadlines and required documentation
- Mention contact information for scholarship office

### Erasmus & International Mobility
For Erasmus questions:
- Explain eligibility criteria and application timeline
- List partner universities if available in context
- Detail required documentation and language requirements
- Include contact for international relations office
- Mention scholarship/funding opportunities

### Entrepreneurship & Innovation
For EduHub/SmartHub queries:
- Describe available programs and initiatives
- Explain how students can participate or apply
- Include event schedules when available
- Provide contact information for program coordinators
- Highlight success stories or past projects if in context

### Research & Academic Excellence
For research-related questions:
- Explain faculty research priorities and centers
- Describe IECS conference and participation opportunities
- Detail funding sources and current projects
- Include information about research supervision and collaboration

### Timetable & Schedule Queries
When users ask about orar, class schedule, or course times:
- Direct them to: https://economice.edupage.org/timetable/
- Suggest contacting secretariat at economice@ulbsibiu.ro
- Response: "Orarul actualizat al cursurilor este disponibil la: https://economice.edupage.org/timetable/. Pentru întrebări specifice, contactați secretariatul."

### Academic Calendar & Structure
For structura universitară, vacanțe, calendar questions:
- Provide specific dates from context when available
- Reference: https://economice.ulbsibiu.ro/structura-2025-2026/
- Include both regular and terminal year schedules

## Behavioral Standards

NEVER:
- Disclose personal student data (grades, IDs, records)
- Provide medical, legal, or financial advice
- Make up information not in your context
- Give uncertain answers without acknowledging limitations
- Use markdown formatting in responses

ALWAYS:
- Verify information against context before stating
- Cite sources when available
- Offer specific contact information for follow-up
- Acknowledge when information may be incomplete
- Maintain professional confidentiality
- Include relevant URLs as plain text links

## Context Processing Protocol

For each query:
1. Analyze the retrieved context carefully
2. Extract all relevant information that directly answers the question
3. Identify gaps or partial information
4. Structure response with most important information first
5. Include actionable next steps (who to contact, what to do)
6. Add relevant URLs from context as plain links
7. If context is insufficient, acknowledge clearly and suggest resources

## Quality Assurance

Before responding:
- Is this answer based solely on provided context?
- Have I included all relevant details (dates, contacts, requirements)?
- Is the language natural and appropriate?
- Are there actionable next steps?
- Have I avoided markdown formatting?
- Have I included relevant links as plain URLs?
"""

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Preprocess query for better matching
        preprocessed_query = preprocess_query(message)
        
        # Generate embedding for the query
        query_vector = client.embeddings.create(
            model="text-embedding-3-small",
            input=preprocessed_query
        ).data[0].embedding
        
        # Find top-k most similar chunks (retrieve more context)
        TOP_K = 5
        SIMILARITY_THRESHOLD = 0.55  # Lowered for larger chunks (they have slightly lower similarity scores)
        
        similarities = [cosine_similarity(query_vector, v) for v in vectors]
        
        # Get top-k indices
        top_k_indices = np.argsort(similarities)[-TOP_K:][::-1]
        
        # Filter by similarity threshold
        relevant_chunks = []
        relevant_sources_list = []
        relevant_urls = []
        
        for idx in top_k_indices:
            if similarities[idx] >= SIMILARITY_THRESHOLD:
                relevant_chunks.append(texts[idx])
                relevant_sources_list.append(sources[idx])
                
                source_url = url_mappings["source_to_url"].get(
                    sources[idx],
                    url_mappings.get("fallback_url", "")
                )
                relevant_urls.append(source_url)
        
        # Check if we have relevant context
        if not relevant_chunks:
            return jsonify({
                'response': "Îmi pare rău, dar nu am găsit informații relevante în baza mea de date pentru această întrebare. Vă recomand să contactați direct secretariatul la economice@ulbsibiu.ro sau să vizitați site-ul facultății la https://economice.ulbsibiu.ro/",
                'source': None,
                'url': None,
                'confidence': 'low'
            })
        
        # Combine chunks into context
        combined_context = "\n\n---\n\n".join(relevant_chunks)
        primary_source = relevant_sources_list[0]
        primary_url = relevant_urls[0]
        
        # Create prompt with multiple contexts
        user_prompt = f"""RETRIEVED CONTEXT (Top {len(relevant_chunks)} most relevant chunks):

{combined_context}

PRIMARY SOURCE: {primary_source}
RELATED URLS: {', '.join(set(relevant_urls))}

USER QUESTION:
{message}

INSTRUCTIONS:
- Use ALL the provided context chunks to form a complete answer
- Cross-reference information across chunks when relevant
- If the context partially answers the question, provide what you know and acknowledge gaps
- Include specific details: dates, numbers, names, requirements, deadlines
- Add relevant URLs from the context"""
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3  # Lower temperature for more factual responses
        )
        
        assistant_message = response.choices[0].message.content
        
        # Calculate confidence based on similarity scores
        # Adjusted thresholds for larger chunks (1200 chars have slightly lower similarity)
        max_similarity = similarities[top_k_indices[0]]
        confidence = 'high' if max_similarity > 0.65 else 'medium' if max_similarity > 0.57 else 'low'
        
        # Store in database (optional)
        try:
            msg_result = supabase.table("messages").insert({
                "session_id": session_id,
                "user_message": message,
                "assistant_message": assistant_message,
                "retrieved_source": primary_source,
                "retrieved_url": primary_url
            }).execute()
            
            message_id = msg_result.data[0]['id'] if msg_result.data else None
        except Exception as e:
            print(f"Error storing message: {e}")
            message_id = None
        
        return jsonify({
            'response': assistant_message,
            'source': primary_source,
            'url': primary_url,
            'message_id': message_id,
            'confidence': confidence,
            'chunks_used': len(relevant_chunks)
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'embeddings_loaded': len(vectors)})

@app.route('/api/reload-embeddings', methods=['POST'])
def reload_embeddings():
    """Reload embeddings from Supabase"""
    global vectors, texts, sources
    try:
        vectors, texts, sources = load_embeddings()
        return jsonify({
            'status': 'success',
            'embeddings_loaded': len(vectors)
        })
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting chatbot API server...")
    print(f"Loaded {len(vectors)} embeddings")
    app.run(debug=True, port=5001, host='127.0.0.1')
