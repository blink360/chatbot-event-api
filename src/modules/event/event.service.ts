import { prisma } from "../../lib/db/prisma/index";
import { ConversationState } from "../chat/chat.types";

export const createEventFromConversation = async (
  userId: string,
  conversationId: string,
  state: ConversationState,
) => {
  const event = await prisma.event.create({
    data: {
      name: state.eventName!,
      subheading: state.subheading,
      description: state.description!,
      timezone: state.timezone!,
      startDate: new Date(state.startDate!),
      endDate: new Date(state.endDate!),
      vanishDate: state.vanishDate ? new Date(state.vanishDate) : null,
      roles: state.roles ?? [] as any,
      userId,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: "completed",
    },
  });

  return event;
};

export const getEvents = async (userId: string) => {
  return prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
