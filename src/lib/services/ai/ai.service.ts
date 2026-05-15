import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

export type EventState = {
  eventName: string | null;
  subheading: string | null;
  description: string | null;
  timezone: string | null;
  startDate: string | null;
  endDate: string | null;
  vanishDate: string | null;
  roles: string[];
  bannerImage: string | null;
  confidence: number;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL as string,
});

const EVENT_BUILDER_PROMPT = `
You are an AI event planning assistant.

Your job is to understand the FULL conversation and reconstruct the best possible event.

Rules:
- Only infer values if they are explicitly implied in the user's message
- DO NOT invent any field values
- For the date fields infer from the day and time in the sentence and store it as YYYY-MM-DD hh:mm format in the json.
- If not explicitly mentioned or strongly implied, set field to null
- NEVER generate marketing content or event descriptions

Output schema:
{
  eventName: string | null,
  subheading: string | null,
  description: string | null,
  timezone: string | null,
  startDate: string | null,
  endDate: string | null,
  vanishDate: string | null,
  roles: string[],
  bannerImage: string | null,
}
`;

const FOLLOW_UP_PROMPT = `
You are a conversational event assistant.

Given the current event state, generate a natural human-like message.

Rules:
- Do NOT be robotic
- If any values are null or missing ask about it to the user
- Ask only ONE natural question OR suggest improvement
- If event is complete, ask for confirmation

Event state:
{{state}}
`;

export const buildEventState = async (messages: any[]): Promise<EventState> => {
  const prompt = `
${EVENT_BUILDER_PROMPT}

Conversation:
${JSON.stringify(messages)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(text);
};

export const generateAssistantMessage = async (
  state: EventState,
): Promise<string> => {
  const prompt = FOLLOW_UP_PROMPT.replace("{{state}}", JSON.stringify(state));

  const result = await model.generateContent(prompt);

  return result.response.text().trim();
};
