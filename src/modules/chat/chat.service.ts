import { Prisma } from "@prisma/client";

import { prisma } from "src/lib/db/prisma/index.js";

import aiService from "../../lib/services/ai/ai.service.js";

import {
  ChatResponse,
  ConversationState,
  ChatSuggestion,
} from "./chat.types.js";

import { createEventFromConversation } from "../event/event.service.js";

const REQUIRED_FIELDS = [
  "eventName",
  "description",
  "timezone",
  "startDate",
  "endDate",
] as const;

const OPTIONAL_FIELDS = ["bannerImageUrl", "vanishDate", "roles"] as const;

const TIMEZONE_SUGGESTIONS = [
  "UTC",
  "IST",
  "CET",
  "US/Eastern",
  "Asia/Kathmandu",
];

const ROLE_SUGGESTIONS = [
  "Speaker",
  "Moderator",
  "Organizer",
  "Volunteer",
  "Sponsor",
  "VIP",
];

const getSuggestions = (
  missingFields: string[],
): ChatSuggestion | undefined => {
  if (missingFields.includes("timezone")) {
    return {
      type: "timezone",
      options: TIMEZONE_SUGGESTIONS,
    };
  }

  if (missingFields.includes("roles")) {
    return {
      type: "roles",
      options: ROLE_SUGGESTIONS,
    };
  }

  return undefined;
};

export const processMessage = async (
  userId: string,
  message: string,
  conversationId?: string,
): Promise<ChatResponse> => {
  let resolvedId = conversationId;

  let conversation = resolvedId
    ? await prisma.conversation.findUnique({
        where: { id: resolvedId },
      })
    : await prisma.conversation.create({
        data: {
          userId,
          context: {},
          status: "active",
        },
      });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.status === "completed") {
    return {
      reply:
        "This conversation has already been finalized. Please check your events page.",
      conversationId: conversation.id,
      conversationState:
        conversation.context &&
        typeof conversation.context === "object" &&
        !Array.isArray(conversation.context)
          ? (conversation.context as ConversationState)
          : {},
      missingFields: [],
      completed: true,
    };
  }

  resolvedId = conversation.id;

  await prisma.message.create({
    data: {
      conversationId: resolvedId,
      sender: "user",
      content: message,
    },
  });

  const dbState: ConversationState =
    conversation.context &&
    typeof conversation.context === "object" &&
    !Array.isArray(conversation.context)
      ? (conversation.context as ConversationState)
      : {};

  const extracted = await aiService.extractEventEntities(message, dbState);

  const updatedState: ConversationState = {
    ...dbState,
    ...extracted,
  };

  await prisma.conversation.update({
    where: { id: resolvedId },
    data: {
      context: updatedState as Prisma.InputJsonValue,
    },
  });

  const missingFields = REQUIRED_FIELDS.filter((field) => {
    const value = updatedState[field];

    if (value === undefined || value === null || value === "") {
      return true;
    }

    return false;
  });

  const hasOptionalFieldsRemaining = OPTIONAL_FIELDS.some((field) => {
    const value = updatedState[field];

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return !value;
  });

  const isCompleted = missingFields.length === 0;

  const suggestions = getSuggestions([
    ...missingFields,
    ...(hasOptionalFieldsRemaining ? OPTIONAL_FIELDS : []),
  ]);

  let reply: string;

  if (!isCompleted) {
    reply = await aiService.generateFollowUpQuestion(
      missingFields,
      updatedState,
    );
  } else if (
    isCompleted &&
    hasOptionalFieldsRemaining &&
    !updatedState.userConfirmedFinalization
  ) {
    reply =
      "Your event details are complete. Would you like to add a banner image, vanish date, or participant roles before finalizing?";
  } else if (isCompleted && updatedState.userConfirmedFinalization) {
    const existingEvent = await prisma.event.findFirst({
      where: {
        conversationId: resolvedId,
      },
    });

    if (!existingEvent) {
      await createEventFromConversation(userId, resolvedId, updatedState);
    }

    await prisma.conversation.update({
      where: { id: resolvedId },
      data: {
        status: "completed",
      },
    });

    reply =
      "Your event has been created successfully. Please check the events page for details.";
  } else {
    reply = await aiService.generateEventSummary(updatedState);
  }

  await prisma.message.create({
    data: {
      conversationId: resolvedId,
      sender: "assistant",
      content: reply,
      metadata: {
        completed:
          conversation.status === "completed" ||
          updatedState.userConfirmedFinalization,
      },
    },
  });

  return {
    reply,
    conversationId: resolvedId,
    conversationState: updatedState,
    missingFields,
    completed:
      conversation.status === "completed" ||
      updatedState.userConfirmedFinalization === true,
    suggestions,
  };
};
