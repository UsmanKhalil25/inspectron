import { Mail, MessageSquare } from "lucide-react";
import { CommunicationChannel } from "@/__generated__/graphql";

export const COMMUNICATION_CHANNEL_ICONS: Record<
  CommunicationChannel,
  React.ComponentType<{ className?: string }>
> = {
  [CommunicationChannel.Email]: Mail,
  [CommunicationChannel.Sms]: MessageSquare,
};
