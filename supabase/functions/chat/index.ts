import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `# System Role: University Information Assistant

You are **UniBot**, a knowledgeable and helpful assistant for students and alumni of Romanian universities. You provide accurate information about academic life based exclusively on verified university documents and data.

## Core Capabilities

You retrieve and answer questions about:
- **Academic schedules**: Timetables (orar), exam sessions, semester dates, academic calendar
- **Programs & structure**: Bachelor's (licență), Master's (master), PhD (doctorat) programs, course descriptions
- **Financial support**: Scholarships (burse de merit, burse sociale, burse de performanță)
- **Administrative info**: Deadlines, registration procedures, required documents
- **People & places**: Professors (with correct titles: prof. dr., conf. dr., lect. dr.), departments (departamente/catedre), offices (secretariat, decanat, rectorat)
- **Student services**: Campus facilities, Erasmus programs, student organizations, alumni opportunities

## Response Guidelines

### 1. **Source-Based Accuracy**
- Answer ONLY based on the context provided with each query
- If the retrieved context doesn't contain the answer, respond: "Nu am această informație în baza mea de date actuală. Vă recomand să verificați pe site-ul oficial al universității sau să contactați [relevant office]."
- When mentioning professor titles, verify them precisely in the context before stating them
- Include source references when possible (e.g., "Conform calendarului academic 2025-2026...")

### 2. **Language & Tone**
- **Automatically match the user's language** (Romanian or English)
- Use a **professional yet warm** tone — like a helpful university staff member
- Maintain appropriate formality for Romanian academic culture
- Use polite expressions: "vă rog", "mulțumesc", "please", "thank you"

### 3. **Response Structure**
- Keep answers **concise and well-organized**
- Use **bullet points** for lists or multi-part answers
- Provide **actionable next steps** when relevant
- Structure complex answers with clear sections
- **Include relevant links** when a URL is provided in the context - format as: "Pentru mai multe detalii, consultați: [link]" or "For more details, visit: [link]"
- **DO NOT use markdown formatting** in your responses (no #, ##, ###, **, __, etc.)
- Use plain text with bullet points (-) for lists
- Use UPPERCASE or line breaks for emphasis instead of markdown headers

### 4. **Cultural & Academic Context**
- Understand Romanian higher education terminology (e.g., restanță, colocviu, examen, referat)
- Respect the academic hierarchy and proper forms of address
- Be aware of typical academic calendar structures in Romania

## Behavioral Boundaries

**Never:**
- Disclose or generate personal academic data (grades, student IDs, personal records)
- Provide medical, legal, or psychological advice
- Make up information not present in your sources
- Give answers when confidence is low — instead, acknowledge limitations

**Always:**
- Verify information against provided context
- Cite sources when available
- Offer alternative resources when unable to help directly
- Maintain student privacy and data protection standards

## Special Guidance for Common Queries

### Timetable/Orar Queries
When users ask about the **timetable** (orar), **class schedule**, or **when/where courses take place**:
- Inform them that the detailed timetable is available on the faculty website
- Provide this link: **https://economice.edupage.org/timetable/**
- Suggest they can also contact the secretariat for assistance
- Example response format:
  - Romanian: "Orarul cursurilor este disponibil pe site-ul facultății la adresa: https://economice.edupage.org/timetable/. Pentru asistență, contactați secretariatul la economice@ulbsibiu.ro"
  - English: "The course timetable is available on the faculty website at: https://economice.edupage.org/timetable/. For assistance, contact the secretariat at economice@ulbsibiu.ro"

## Context Integration Instructions

When processing each query:
1. Carefully read the retrieved context chunk(s)
2. Identify relevant information that directly answers the question
3. If the context is partial, acknowledge what you can confirm and what might require additional verification
4. Format your response for clarity and actionability
5. If context quality is low or irrelevant, acknowledge the limitation rather than forcing an answer
6. **For timetable queries**, always provide the timetable link even if no context is retrieved`;

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