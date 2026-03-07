import { z } from "zod";
import { createContactSchema } from "./create-contact.schema";

export const bulkCreateContactSchema = z
  .array(createContactSchema)
  .min(1, "At least one contact is required")
  .refine(
    (contacts) => {
      const allValues = contacts.flatMap((c) =>
        c.contactChannels.map((ch) => `${ch.type}:${ch.value.toLowerCase()}`),
      );
      return new Set(allValues).size === allValues.length;
    },
    {
      message: "Duplicate contact channels found across contacts",
      path: [],
    },
  );
