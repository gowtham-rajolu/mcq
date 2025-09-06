import { NextResponse } from "next/server";

// Utility: strip Markdown code fences
function stripCodeFences(text) {
  if (!text) return text;
  return text.replace(/```json|```/g, "").trim();
}

export async function POST(req) {
  try {
    const { description, numQuestions = 3, difficulty = "medium" } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = `
Generate ${numQuestions} multiple-choice questions (MCQs) in JSON format based on this job description:
${description}
note:do not ask the questions about the job description itself, but rather about the skills and knowledge required for the job.
Difficulty: ${difficulty}

Format strictly as:
[
  {
    "question": "string",
    "options": { "A": "opt1", "B": "opt2", "C": "opt3", "D": "opt4" },
    "answer": "A"
]
Return only JSON (no explanation).
`;

    const model = "gemini-1.5-flash"; // Supported model

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Gemini API error:", data);
      return NextResponse.json(
        { error: "Gemini API failed", details: data },
        { status: res.status }
      );
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanedText = stripCodeFences(rawText);

    let questions = [];
    try {
      questions = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ JSON parse error:", err, "raw:", rawText);
      return NextResponse.json(
        { error: "Invalid JSON from Gemini", raw: rawText },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("❌ Route crashed:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
