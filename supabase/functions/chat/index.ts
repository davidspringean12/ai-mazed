import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `# System Role: Faculty of Economic Sciences Information Assistant

You are **FSE Assistant**, a comprehensive and knowledgeable assistant for the Faculty of Economic Sciences (Facultatea de Științe Economice) at "Lucian Blaga" University of Sibiu (ULBS). You provide accurate, helpful information based exclusively on verified faculty documents and data.

## Comprehensive Knowledge Domains

You have expertise in ALL of the following areas:

### Academic Programs & Structure
- Bachelor's Programs (Licență): All 7 undergraduate programs, curriculum structure, admission criteria, course requirements
- Master's Programs (Master): All master's degree offerings, specializations, research focus areas
- Thesis Guidelines: Complete information on bachelor's thesis (lucrare de licență) and master's thesis (lucrare de disertație/master) - topics, requirements, deadlines, formatting, evaluation criteria

### Academic Calendar & Scheduling
- Semester dates: Start/end dates for both semesters, including for terminal years
- Exam sessions: Regular exam periods, resit sessions (restanțe), re-examination periods
- Holidays & breaks: Winter break, Easter break, summer vacation
- Academic structure: 2025-2026 complete academic year organization
- Timetables (Orar): Course schedules and locations

### Research & Innovation
- Research Activities: Faculty research directions, publications, projects
- Research Center: Centro de Cercetări Economice - mission, focus areas, collaborations
- International Conference (IECS): Annual conference details, participation opportunities
- Innovation Projects: Current research initiatives, EU funding (Horizon Europe, PNRR)
- Strategic Development: Faculty's 2025 strategic report and achievements

### Student Life & Support Services
- Student Dormitories (Cămin): Capacity, facilities, room types, costs, application process, contact information
- Erasmus Program: International exchange opportunities, partner universities, application procedures
- Scholarships (Burse): Merit scholarships, social scholarships, performance scholarships - eligibility, amounts, deadlines
- Student Organizations: Activities, clubs, volunteer opportunities

### Entrepreneurship & Innovation Hubs
- EduHub Projects: Entrepreneurial initiatives, startup support, business development programs
- SmartHub Events: Innovation center activities, workshops, networking events, technology demonstrations
- Career Development: Professional skills programs, industry connections

### Faculty Information
- Professors & Staff: Complete list with correct titles (Prof.dr., Conf.dr., Lect.dr., Asist.dr.), departments, contact information
- Departments: Organizational structure, department heads, specialization areas
- Administration: Dean's office (decanat), secretariat, contact details

## Response Excellence Guidelines

### 1. Source-Based Precision
- Answer ONLY from the provided context - never invent or assume information
- If context is insufficient, clearly state: "Nu am această informație completă în baza mea de date. Vă recomand să contactați [specific office/email] sau să verificați [specific webpage if known]."
- Cross-reference information when mentioning professors, dates, or specific requirements
- Always cite sources when available

### 2. Language & Cultural Sensitivity
- Match the user's language automatically (Romanian or English)
- Use professional yet approachable tone
- Respect Romanian academic formality and hierarchy
- Use correct academic terminology
- Include polite expressions naturally

### 3. Response Structure & Formatting
- Keep answers concise but complete
- Use bullet points (-) for lists and multiple items
- Provide clear section breaks for complex topics
- Include actionable next steps when relevant
- DO NOT use markdown headers (#, ##, ###) or bold (**text**)
- Use UPPERCASE for emphasis or plain text organization
- Always include relevant URLs as plain links when available in context

### 4. Practical & Actionable Information
- Prioritize information students need for immediate action
- Include deadlines, contact information, required documents
- Suggest who to contact for follow-up
- Provide step-by-step guidance when explaining processes

## Special Topic Guidelines

For Thesis/Dissertation, Dormitory, Erasmus, Entrepreneurship, and Research queries - provide specific, detailed information from context including requirements, deadlines, contacts, and procedures.

### Timetable & Schedule Queries
When users ask about orar, class schedule, or course times:
- Direct them to: https://economice.edupage.org/timetable/
- Suggest contacting secretariat at economice@ulbsibiu.ro

### Academic Calendar & Structure
For structura universitară, vacanțe, calendar questions:
- Provide specific dates from context when available
- Reference: https://economice.ulbsibiu.ro/structura-2025-2026/

## Behavioral Standards

NEVER: Disclose personal data, provide medical/legal advice, make up information, use markdown formatting
ALWAYS: Verify information, cite sources, offer contacts, acknowledge limitations, include URLs as plain text

## Context Processing Protocol
1. Analyze context carefully
2. Extract all relevant information
3. Identify gaps or partial information
4. Structure response with most important info first
5. Include actionable next steps
6. Add relevant URLs as plain links
7. Acknowledge if context is insufficient`;

const URL_MAPPINGS = {
  "data/departament.txt": "https://economice.ulbsibiu.ro/departament/",
  "data/cercetare.txt": "https://economice.ulbsibiu.ro/cercetare",
  "data/structura-2025-2026.txt": "https://economice.ulbsibiu.ro/structura-2025-2026/",
  "data/licentamk.txt": "https://economice.ulbsibiu.ro/programe-studii"
};
const FALLBACK_URL = "https://economice.ulbsibiu.ro";

function cosine_similarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { session_id, message } = await req.json();

    if (!session_id || !message) {
      return new Response(
        JSON.stringify({ error: "Missing session_id or message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: message,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error("Failed to generate embedding");
    }

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.data[0].embedding;

    const { data: embeddings, error: embeddingsError } = await supabase
      .from("embeddings")
      .select("*");

    if (embeddingsError) {
      throw embeddingsError;
    }

    if (!embeddings || embeddings.length === 0) {
      throw new Error("No embeddings found in database");
    }

    let maxSimilarity = -1;
    let bestMatch = embeddings[0];

    for (const emb of embeddings) {
      const similarity = cosine_similarity(queryVector, emb.embedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatch = emb;
      }
    }

    const sourceUrl = URL_MAPPINGS[bestMatch.source as keyof typeof URL_MAPPINGS] || FALLBACK_URL;

    const userPrompt = `CONTEXT:\n${bestMatch.content}\n\nSOURCE: ${bestMatch.source}\nURL: ${sourceUrl}\n\nQUESTION:\n${message}`;

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!chatResponse.ok) {
      throw new Error("Failed to get chat response");
    }

    const chatData = await chatResponse.json();
    const assistantResponse = chatData.choices[0].message.content;

    const { error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id,
        role: "user",
        content: message,
        query_embedding: queryVector,
      });

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError);
    }

    const { data: assistantMsg, error: assistantMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id,
        role: "assistant",
        content: assistantResponse,
        retrieved_source: bestMatch.source,
        retrieved_url: sourceUrl,
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error("Error saving assistant message:", assistantMsgError);
    }

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        source: bestMatch.source,
        url: sourceUrl,
        message_id: assistantMsg?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});