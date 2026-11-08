import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are "UHC Care AI", a warm, empathetic, and knowledgeable wellness, fitness, and cycle companion for the UHC Care couple routine application.

Your core capabilities:
1. Menstrual Cycle Support: Explain cycle phases (Menstrual, Follicular, Ovulation, Luteal), why energy or mood shifts happen, and how to honor the body's natural rhythms.
2. Diet & Nutrition: Suggest whole-food, hormone-supportive nutrition tailored to phases (e.g., iron & magnesium for menstruation, fresh proteins & fermented foods for follicular, healthy fats & complex carbs for luteal comfort).
3. Fitness & Movement: Give safe advice on exercise form, tailoring intensity to her cycle (e.g., restorative stretching and walks during menstruation; progressive strength and squats during follicular; high energy intervals during ovulation; pilates and core stability during luteal).
4. Partner Care & Routine: Suggest supportive habits for couple bonding, routine consistency, and mutual encouragement.

Tone & Formatting Guidelines:
- Warm, compassionate, concise, and uplifting.
- Use readable short paragraphs, bullet points, and clean formatting.
- Non-Medical Boundary: You are a wellness companion, not a medical professional. Never diagnose conditions (like endometriosis, PCOS, or infections). For severe pain or medical emergencies, warmly recommend speaking with a healthcare provider.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    // Build context-enhanced system prompt
    let contextHeader = SYSTEM_INSTRUCTION;
    if (userContext) {
      contextHeader += `\n\nCurrent User Context:\n- Active Phase: ${userContext.phase || "Not specified"}\n- Cycle Day: ${userContext.cycleDay || "Unknown"}\n- Partner Name: ${userContext.partnerName || "Partner"}`;
    }

    // Transform chat messages to Gemini contents format
    // Gemini roles: 'user' | 'model'
    const contents = (messages || []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }),
    );

    // Call Gemini API (with primary model and fallback)
    const modelsToTry = [
      "gemini-3.5-flash-lite",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];

    let lastError: unknown = null;
    let replyText = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: contextHeader }],
              },
              contents,
              generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          lastError = errData;
          continue;
        }

        const data = await response.json();
        replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (replyText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!replyText) {
      return NextResponse.json(
        {
          error:
            "Could not get response from AI. Please check API key permissions.",
          details: lastError,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

