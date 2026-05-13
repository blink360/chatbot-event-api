import { prisma } from "../../lib/db/prisma";
import { buildEventState, generateAssistantMessage } from "../../lib/services/ai/ai.service";

export const processMessage = async (
  userId: string,
  message: string,
  conversationId?: string
) => {
  let conversation = conversationId
    ? await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      })
    : await prisma.conversation.create({
        data: {
          userId,
          status: "active",
          context: {},
        },
        include: { messages: true },
      });

  if (!conversation) throw new Error("Conversation not found");

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "user",
      content: message,
    },
  });

  const messages = [
    ...conversation.messages.map((m) => ({
      role: m.sender,
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  const state = await buildEventState(messages);

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      context: state,
    },
  });

  const isReady =
    state.eventName &&
    state.timezone &&
    state.startDate &&
    state.endDate &&
    state.confidence > 0.75;

  let reply: string;

  if (isReady) {
    reply = await generateAssistantMessage({
      ...state,
      confidence: state.confidence,
    });

    reply += "\n\n👉 Confirm to create this event.";
  } else {
    reply = await generateAssistantMessage(state);
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      sender: "assistant",
      content: reply,
    },
  });

  return {
    reply,
    conversationId: conversation.id,
    conversationState: state,
    completed: isReady,
  };
};