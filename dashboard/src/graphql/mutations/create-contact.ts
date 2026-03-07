import { gql } from "@/__generated__";

export const CREATE_CONTACT = gql(`
mutation CreateContact($input: CreateContactInput!) {
  createContact(input: $input) {
    id
    name
    createdAt
    updatedAt
    contactChannels {
      id
      type
      value
      createdAt
      updatedAt
    }
  }
}`);
