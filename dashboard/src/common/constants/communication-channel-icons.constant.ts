import { Mail, MessageSquare, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export enum CommunicationChannel {
  Email = "EMAIL",
  Sms = "SMS",
  Phone = "PHONE",
}

export const COMMUNICATION_CHANNEL_ICONS: Record<
  CommunicationChannel,
  LucideIcon
> = {
  [CommunicationChannel.Email]: Mail,
  [CommunicationChannel.Sms]: MessageSquare,
  [CommunicationChannel.Phone]: Phone,
};
