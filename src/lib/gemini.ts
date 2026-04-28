import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ScientificAnalysis {
  authenticity: {
    score: number;
    findings: string[];
    derivationChecks: string[];
  };
  plagiarism: {
    score: number;
    detectedSources: string[];
  };
  bias: {
    score: number;
    types: string[];
  };
  suggestions: string[];
  faultyRegions: {
    text: string;
    explanation: string;
  }[];
}

export async function analyzeScientificPaper(content: string): Promise<ScientificAnalysis> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are an expert scientific reviewer and auditor. Analyze the following scientific paper content for:
    1. Scientific Authenticity: Verify mathematical derivations, scientific calculations, and the general logic of the modeling.
    2. Plagiarism: Estimate the likelihood of plagiarism and identify potential conceptual overlaps (as you are an AI, provide an estimation based on your training data).
    3. Bias: Identify potential biases in methodology, data selection, or conclusions.
    4. Logical Explanations: Provide explanations to back or enhance the paper.
    5. Faulty Regions: Identify specific text segments that are mathematically or scientifically incorrect and explain why.

    Return the result strictly in the following JSON format:
    {
      "authenticity": {
        "score": number (0-100),
        "findings": string[],
        "derivationChecks": string[]
      },
      "plagiarism": {
        "score": number (0-100),
        "detectedSources": string[]
      },
      "bias": {
        "score": number (0-100),
        "types": string[]
      },
      "suggestions": string[],
      "faultyRegions": [
        { "text": string, "explanation": string }
      ]
    }

    Paper Content:
    ${content.substring(0, 30000)} // Limit content to 30k chars for stability
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          authenticity: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              findings: { type: Type.ARRAY, items: { type: Type.STRING } },
              derivationChecks: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "findings", "derivationChecks"]
          },
          plagiarism: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              detectedSources: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "detectedSources"]
          },
          bias: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              types: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "types"]
          },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          faultyRegions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["text", "explanation"]
            }
          }
        },
        required: ["authenticity", "plagiarism", "bias", "suggestions", "faultyRegions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text);
}
