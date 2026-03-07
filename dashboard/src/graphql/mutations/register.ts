import { gql } from "@/__generated__";

export const REGISTER_MUTATION = gql(`
  mutation Register($input: RegisterUserInput!) {
    register(input: $input) {
      message
      data {
        id
        email
        name
      }
    }
  }`);
