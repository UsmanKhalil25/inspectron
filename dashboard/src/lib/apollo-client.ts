import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export default client;
