import { z } from "zod";
import { CommunicationChannel, CampaignStatus } from "@/__generated__/types";

export const createCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),

  channelType: z.enum(
    Object.values(CommunicationChannel) as [
      CommunicationChannel,
      ...CommunicationChannel[],
    ],
    {
      error: (iss) =>
        iss.input === undefined ? "Channel type is required" : "Invalid input",
    },
  ),

  status: z
    .enum(
      Object.values(CampaignStatus) as [CampaignStatus, ...CampaignStatus[]],
    )
    .nullable()
    .optional(),
});
