import { gql } from "@apollo/client";

export const SEND_AGENT_MESSAGE = gql`
  mutation SendAgentMessage($input: SendMessageInput!) {
    sendAgentMessage(input: $input)
  }
`;
