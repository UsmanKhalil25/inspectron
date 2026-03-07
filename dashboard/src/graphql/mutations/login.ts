import { gql } from "@/__generated__";

export const LOGIN_MUTATION = gql(`
  mutation Login($input: LoginUserInput!) {
    login(input: $input) {
      message
      user {
        id
        email
        name
      }
    }
  }
`);
