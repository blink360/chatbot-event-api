import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { ConversationStateSchema } from "../../../lib/zod/schema/aiResponseSchema";

import { ConversationContext } from "./ai.types";

const ENTITY_EXTRACTION_PROMPT = `
You are an AI assistant that extracts structured event data.

Extract:
- eventName
- subheading
- description
- timezone
- startDate
- endDate
- vanishDate
- roles

Rules:
- return ONLY JSON
- no markdown
- no extra text
- preserve existing values if missing
- dates must be ISO strings
`;

const FOLLOW_UP_PROMPT = `
You are a friendly event assistant.

Missing fields:
{{missingFields}}

Current state:
{{state}}

Ask ONE short natural question.
Do NOT behave like a form.
`;

const EVENT_SUMMARY_PROMPT = `
You are an event assistant.

Create a clean summary of this event:

{{state}}

End by asking if user wants to finalize.
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const safeParseAIOutput = (text: string) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return ConversationStateSchema.parse(parsed);
  } catch (err) {
    return {};
  }
};

const extractEventEntities = async (
  message: string,
  existingState: ConversationContext,
): Promise<Partial<ConversationContext>> => {
  try {
    const prompt = `
${ENTITY_EXTRACTION_PROMPT}

Existing state:
${JSON.stringify(existingState)}

User message:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return safeParseAIOutput(response);
  } catch {
    return {};
  }
};

const generateFollowUpQuestion = async (
  missingFields: string[],
  state: ConversationContext,
): Promise<string> => {
  try {
    const prompt = FOLLOW_UP_PROMPT.replace(
      "{{missingFields}}",
      missingFields.join(", "),
    ).replace("{{state}}", JSON.stringify(state));

    const result = await model.generateContent(prompt);

    return result.response.text().trim();
  } catch {
    return "What else should I know about your event?";
  }
};

const generateEventSummary = async (
  state: ConversationContext,
): Promise<string> => {
  try {
    const prompt = EVENT_SUMMARY_PROMPT.replace(
      "{{state}}",
      JSON.stringify(state),
    );

    const result = await model.generateContent(prompt);

    return result.response.text().trim();
  } catch {
    return "Your event is ready. Do you want to finalize it?";
  }
};

export default {
  extractEventEntities,
  generateFollowUpQuestion,
  generateEventSummary,
};
