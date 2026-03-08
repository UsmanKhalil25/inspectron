import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const uri = `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`;

const client = new ApolloClient({
  link: createHttpLink({
    uri,
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export default client;
