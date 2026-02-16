
import { AgentResult, Flight } from "@/types/flight";

// AI Analysis Service using direct API call (Client-side for demo)
// Requires VITE_AI_API_KEY in .env

const API_KEY = import.meta.env.VITE_AI_API_KEY;

/**
 * Analyzes a specific aspect of a flight using an LLM
 * @param flight The flight data
 * @param agentType The type of agent (fuel, weather, etc.) to simulate specific expertise
 */
export async function analyzeFlightWithAI(flight: Flight, agentType: "fuel" | "weather" | "congestion" | "safety" | "fairness"): Promise<AgentResult> {

    if (!API_KEY) {
        console.warn("VITE_AI_API_KEY is missing. Using fallback mock analysis.");
        return mockAnalysis(flight, agentType);
    }

    try {
        console.log(`[AI] Calling Gemini API for ${agentType} analysis of ${flight.callsign}...`);

        const prompt = `
      You are an expert Air Traffic Control AI agent specialized in ${agentType}.
      Analyze the following flight for clearance safety:
      Flight: ${flight.callsign} (${flight.aircraft})
      Status: ${flight.status}
      Fuel: ${flight.fuel}%
      Risk Level: ${flight.riskLevel}
      
      Output ONLY valid JSON with no markdown:
      {
        "result": "safe" | "borderline" | "unsafe",
        "confidence": number (0-100),
        "reason": "concise explanation max 15 words"
      }
    `;

        // Supporting Google Gemini API format
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            console.error(`[AI] API Error: ${response.status} ${response.statusText}`);
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error(`[AI] No response text from API`);
            throw new Error("No response from AI");
        }

        console.log(`[AI] Raw response for ${flight.callsign}:`, text.substring(0, 100));

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const result = JSON.parse(cleanText);

        console.log(`[AI] ✓ ${agentType} analysis complete for ${flight.callsign}: ${result.result}`);

        return {
            agentId: agentType,
            name: agentType.charAt(0).toUpperCase() + agentType.slice(1) + " Agent",
            status: "complete",
            result: result.result,
            confidence: result.confidence,
            reason: result.reason,
            timestamp: new Date().toLocaleTimeString()
        };

    } catch (error) {
        console.error(`[AI] Analysis Failed for ${flight.callsign}:`, error);
        console.log(`[AI] Falling back to mock analysis for ${flight.callsign}`);
        return mockAnalysis(flight, agentType); // Fallback so app doesn't crash
    }
}

function mockAnalysis(flight: Flight, agentType: string): AgentResult {
    // Fallback logic if API fails or key is missing
    let risk = "safe";
    let reason = "Within operational limits.";
    let confidence = 85 + Math.floor(Math.random() * 10);

    if (agentType === "fuel" && flight.fuel < 30) {
        risk = "unsafe";
        reason = "Critical fuel levels detected.";
        confidence = 95;
    }

    return {
        agentId: agentType,
        name: agentType.charAt(0).toUpperCase() + agentType.slice(1) + " Agent",
        status: "complete",
        result: risk as "safe" | "unsafe" | "borderline",
        confidence,
        reason,
        timestamp: new Date().toLocaleTimeString()
    };
}
