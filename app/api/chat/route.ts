import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Initialize the Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(request: Request) {
  try {
    const { message, category } = await request.json();

    // Create a context-aware prompt
    const contextPrompt = `You are an AI assistant specialized in military emergency protocols. 
    Current emergency category: ${category}.
    Provide clear, concise, and actionable guidance for the following situation: ${message}
    Format the response in a clear, step-by-step manner if applicable.`;

    // Generate response from Gemini
    const result = await model.generateContent(contextPrompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
