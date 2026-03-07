import { z } from "zod";

import { CommunicationChannel } from "@/__generated__/graphql";

const emailSchema = z.email("Invalid email");
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9()\-\s]{6,20}$/, "Invalid phone number");

const contactChannelSchema = z
  .object({
    type: z.enum(CommunicationChannel),
    value: z.string().trim().min(1, "Value is required"),
  })
  .refine(
    (data) => {
      if (data.type === CommunicationChannel.Email) {
        return emailSchema.safeParse(data.value).success;
      }
      if (data.type === CommunicationChannel.Sms) {
        return phoneSchema.safeParse(data.value).success;
      }
      return true;
    },
    {
      message: "Invalid format for the selected contact type",
      path: ["value"],
    },
  );
export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  contactChannels: z
    .array(contactChannelSchema)
    .min(1, "At least one contact channel is required")
    .refine(
      (channels) => {
        const types = channels.map((channel) => channel.type);
        return new Set(types).size === types.length;
      },
      {
        message: "Duplicate contact types are not allowed",
        path: ["contactChannels"],
      },
    ),
});
