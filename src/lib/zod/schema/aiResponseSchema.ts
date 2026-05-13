import { z } from "zod";

export const ConversationStateSchema = z.object({
  eventName: z.string().optional(),
  subheading: z.string().optional(),
  description: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  timezone: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  vanishDate: z.string().optional(),
  roles: z.array(z.string()).optional(),
  userConfirmedFinalization: z.boolean().optional(),
});

export type ValidatedConversationState = z.infer<
  typeof ConversationStateSchema
>;