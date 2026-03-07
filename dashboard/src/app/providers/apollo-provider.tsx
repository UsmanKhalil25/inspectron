"use client";

import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apollo-client";

function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export { Providers as ApolloProvider };
