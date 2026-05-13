import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConversationContext } from "./ai.types";
import "dotenv/config";
import { ConversationStateSchema } from "../../../lib/zod/schema/aiResponseSchema";

const ENTITY_EXTRACTION_PROMPT = `
You are an AI assistant that extracts structured event data.

Extract the following fields if present:
- eventName
- subheading
- description
- timezone
- startDate
- endDate
- vanishDate
- roles

Rules:
- Return ONLY valid JSON
- Do not include markdown
- Preserve existing values if new values are absent
- Dates must be ISO strings
`;

const FOLLOW_UP_PROMPT = `
You are an AI-powered conversational event assistant.

The following fields are still missing:
{{missingFields}}

Current state:
{{state}}

Ask a short natural follow-up question.
`;

const EVENT_SUMMARY_PROMPT = `
You are an AI event assistant.

Generate a concise confirmation summary for this event:

{{state}}

End with asking the user if they want to finalize the event.
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const safeParseAIOutput = (text: string) => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return ConversationStateSchema.parse(parsed);
};

const extractEventEntities = async (
  message: string,
  existingState: ConversationContext,
): Promise<Partial<ConversationContext>> => {
  const prompt = `
${ENTITY_EXTRACTION_PROMPT}

Existing event state:
${JSON.stringify(existingState)}

User message:
${message}
`;

  const result = await model.generateContent(prompt);

  const response = result.response.text();

  return JSON.parse(response);
};

const generateFollowUpQuestion = async (
  missingFields: string[],
  state: ConversationContext,
): Promise<string> => {
  const prompt = FOLLOW_UP_PROMPT.replace(
    "{{missingFields}}",
    missingFields.join(", "),
  ).replace("{{state}}", JSON.stringify(state));

  const result = await model.generateContent(prompt);

  return result.response.text().trim();
};

const generateEventSummary = async (
  state: ConversationContext,
): Promise<string> => {
  const prompt = EVENT_SUMMARY_PROMPT.replace(
    "{{state}}",
    JSON.stringify(state),
  );

  const result = await model.generateContent(prompt);

  return result.response.text().trim();
};

export default {
  extractEventEntities,
  generateFollowUpQuestion,
  generateEventSummary,
};
