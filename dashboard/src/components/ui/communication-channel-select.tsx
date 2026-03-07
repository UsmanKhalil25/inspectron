import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { capitalize } from "@/common/utils/string.utils";
import { COMMUNICATION_CHANNEL_ICONS } from "@/common/constants/communication-channel-icons.constant";

import { CommunicationChannel } from "@/__generated__/graphql";

interface CommunicationChannelSelectProps {
  value?: CommunicationChannel;
  onValueChange: (value: CommunicationChannel) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CommunicationChannelSelect({
  value,
  onValueChange,
  placeholder = "Select a channel",
  disabled = false,
}: CommunicationChannelSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.values(CommunicationChannel).map((channel) => {
          const Icon = COMMUNICATION_CHANNEL_ICONS[channel];
          return (
            <SelectItem key={channel} value={channel}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{capitalize(channel.toLowerCase())}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
