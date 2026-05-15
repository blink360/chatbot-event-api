import { prisma } from "../src/lib/db/prisma/index";

const userId = "6711a03f-7d10-41f5-ada2-57259f53cc05";

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const events = [
  {
    name: "Engineering Sync Meetup",
    subheading: "Weekly team alignment",
    description:
      "A sync meeting for engineers to discuss progress and blockers.",
    timezone: "Asia/Kathmandu",
    startDate: addDays(7),
    endDate: addDays(7),
    roles: ["ENGINEER"],
    conversationId: "c2f1a9b2-3d4e-4a5f-9c1d-8b7e6f5a4c3d",
  },
  {
    name: "Product Planning Session",
    subheading: "Sprint planning",
    description: "Planning upcoming sprint tasks with the product team.",
    timezone: "Asia/Kathmandu",
    startDate: addDays(10),
    endDate: addDays(10),
    roles: ["PRODUCT_MANAGER", "ENGINEER"],
    conversationId: "9a8b7c6d-5e4f-4a3b-8c2d-1f2e3d4c5b6a",
  },
  {
    name: "Startup Networking Night",
    subheading: "Meet founders & builders",
    description: "Networking event for startup founders and developers.",
    timezone: "Asia/Kathmandu",
    startDate: addDays(14),
    endDate: addDays(14),
    roles: ["FOUNDER", "ENGINEER"],
    conversationId: "f1e2d3c4-b5a6-4c7d-8e9f-0a1b2c3d4e5f",
  },
];

async function seed() {
  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        userId,
        status: "PUBLISHED",
      },
    });
  }
}

seed().finally(async () => {
  await prisma.$disconnect();
});
