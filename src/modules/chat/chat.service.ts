import { prisma } from "../../lib/db/prisma";
import {
  buildEventState,
  generateAssistantMessage,
} from "../../lib/services/ai/ai.service";
import { createEventFromState } from "../event/event.service";

export const processMessage = async (
  userId: string,
  message: string,
  conversationId?: string,
) => {
  const conversation = conversationId
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

  const messages = conversation.messages
    .map((m) => ({
      role: m.sender,
      content: m.content,
    }))
    .concat({ role: "user", content: message });

  const state = await buildEventState(messages);

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { context: state },
  });

  const isReady = Boolean(
    state.eventName &&
    state.timezone &&
    state.startDate &&
    state.endDate &&
    state.confidence > 0.75,
  );

  const normalized = message.toLowerCase();
  const confirmed = ["confirm", "create it", "yes", "looks good"].some((k) =>
    normalized.includes(k),
  );

  if (isReady && confirmed) {
    const event = await createEventFromState(userId, state, conversationId!);

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: "completed" },
    });

    const reply = `Event "${event.name}" created successfully.\nYou can now view it in your dashboard.`;

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
      completed: true,
      event,
    };
  }

  let reply = await generateAssistantMessage(state);

  if (isReady) {
    reply += "\n\nReply with 'confirm' to create this event.";
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
    completed: false,
  };
};
