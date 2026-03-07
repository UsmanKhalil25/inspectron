import { gql } from "@/__generated__";

export const BULK_CREATE_CONTACT = gql(`
  mutation BulkCreateContacts($input: BulkCreateContactInput!) {
    bulkCreateContact(input: $input) {
      created {
        id
        name
        contactChannels {
          id
          type
          value
        }
      }
      errors {
        index
        error
      }
      summary {
        total
        successful
        failed
      }
    }
  }
`);
