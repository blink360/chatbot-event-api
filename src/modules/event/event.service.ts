import { prisma } from "../../lib/db/prisma/index";
import { Prisma } from "@prisma/client";
import { EventState } from "../../lib/services/ai/ai.service";

export const createEventFromState = async (
  userId: string,
  state: EventState,
  conversationId: string
) => {
  if (
    !state.eventName ||
    !state.timezone ||
    !state.startDate ||
    !state.endDate
  ) {
    throw new Error("Missing required event fields");
  }

  return prisma.event.create({
    data: {
      name: state.eventName,
      subheading: state.subheading ?? null,
      description: state.description ?? null,
      timezone: state.timezone,
      startDate: new Date(state.startDate),
      endDate: new Date(state.endDate),
      vanishDate: state.vanishDate ? new Date(state.vanishDate) : null,
      roles: state.roles ?? [],
      bannerImageUrl: state.bannerImage ?? null,
      userId,
      status: "DRAFT",
      conversationId,
    },
  });
};

export const getEvents = async (userId: string) => {
  return prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const updateEvent = async (
  userId: string,
  eventId: string,
  data: Prisma.EventUpdateInput,
) => {
  return prisma.event.updateMany({
    where: {
      id: eventId,
      userId,
    },
    data,
  });
};

export const publishEvent = async (userId: string, eventId: string) => {
  return prisma.event.updateMany({
    where: {
      id: eventId,
      userId,
    },
    data: {
      status: "PUBLISHED",
    },
  });
};

export const deleteEvent = async (userId: string, eventId: string) => {
  return prisma.event.deleteMany({
    where: {
      id: eventId,
      userId,
    },
  });
};
