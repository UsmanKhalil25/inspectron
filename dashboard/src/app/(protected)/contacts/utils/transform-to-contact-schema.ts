import type { CsvParsedRow } from "../types/csv-parsed-row.type";
import type { CreateContactInput } from "@/__generated__/graphql";
import { CommunicationChannel } from "@/__generated__/graphql";

const channelMapping: Record<string, CommunicationChannel> = {
  email: CommunicationChannel.Email,
  sms: CommunicationChannel.Sms,
};

export function transformToContactSchema(
  data: CsvParsedRow[],
): CreateContactInput[] {
  return data.map((row) => {
    const contactChannels = Object.entries(channelMapping)
      .map(([key, channelType]) => {
        const value = row[key];
        return value && value.trim()
          ? { type: channelType, value: value.trim() }
          : null;
      })
      .filter((c): c is { type: CommunicationChannel; value: string } =>
        Boolean(c),
      );

    return {
      name: row.name.trim(),
      contactChannels,
    };
  });
}
