import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(request: Request) {
  try {
    const { message, category } = await request.json();

    const contextPrompt = `You are an AI assistant specialized in military emergency protocols. 
    Current emergency category: ${category}.
    
    Provide clear, concise, and actionable guidance for the following situation: ${message}
    
    Format your response in a clear, step-by-step manner using markdown formatting with:
    - Clear headings for different sections
    - Bullet points for steps or key points
    - Important information highlighted
    
    After your main response, suggest 3-4 relevant follow-up scenarios that might occur.`;

    const result = await model.generateContent(contextPrompt);
    const response = result.response.text();

    // Extract suggestions from the response
    const suggestionPattern = /Follow-up scenarios?:([\s\S]*?)(?=\n\n|$)/i;
    const match = response.match(suggestionPattern);

    let suggestions: string[] = [];
    if (match && match[1]) {
      suggestions = match[1]
        .split("\n")
        .map((line) => line.trim().replace(/^[•\-\*]\s*/, ""))
        .filter((line) => line.length > 0);
    }

    // Remove the suggestions section from the main response
    const mainResponse = response.replace(suggestionPattern, "").trim();

    return NextResponse.json({
      response: mainResponse,
      suggestions,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
