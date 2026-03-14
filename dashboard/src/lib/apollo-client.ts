import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpUri = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/graphql`;
const wsUri = `${process.env.NEXT_PUBLIC_API_WS_URL || "ws://localhost:8080"}/graphql`;

console.log("[Apollo] HTTP URL:", httpUri);
console.log("[Apollo] WebSocket URL:", wsUri);

const httpLink = createHttpLink({
  uri: httpUri,
  credentials: "include",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    retryAttempts: 5,
    shouldRetry: () => true,
    connectionParams: () => {
      return {};
    },
    on: {
      connected: () => {
        console.log("[WebSocket] Connected successfully");
      },
      closed: (event) => {
        console.log("[WebSocket] Connection closed:", event);
      },
      error: (error) => {
        console.error("[WebSocket] Error:", error);
      },
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
});

export default client;
