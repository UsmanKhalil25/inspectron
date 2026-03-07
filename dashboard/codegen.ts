import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:3001/graphql",
  documents: ["src/**/*.ts", "src/**/*.tsx"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
    },
    "./src/__generated__/types.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
