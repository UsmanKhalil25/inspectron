/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation BulkCreateContacts($input: BulkCreateContactInput!) {\n    bulkCreateContact(input: $input) {\n      created {\n        id\n        name\n        contactChannels {\n          id\n          type\n          value\n        }\n      }\n      errors {\n        index\n        error\n      }\n      summary {\n        total\n        successful\n        failed\n      }\n    }\n  }\n": typeof types.BulkCreateContactsDocument,
    "\nmutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n    title\n    description\n    channelType\n    status\n    createdAt\n    updatedAt\n    contacts {\n      id\n      name\n    }\n  }\n}": typeof types.CreateCampaignDocument,
    "\nmutation CreateContact($input: CreateContactInput!) {\n  createContact(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n    contactChannels {\n      id\n      type\n      value\n      createdAt\n      updatedAt\n    }\n  }\n}": typeof types.CreateContactDocument,
    "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }": typeof types.RegisterDocument,
    "\n  query CampaignStats {\n    campaignStats {\n      totalCampaigns\n      campaignsByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n      campaignsByChannel {\n        email\n        sms\n      }\n    }\n  }\n": typeof types.CampaignStatsDocument,
    "\n  query GetCampaigns($filters: CampaignFiltersInput, $limit: Int, $page: Int) {\n    campaigns(filters: $filters, limit: $limit, page: $page) {\n      campaigns {\n        id\n        title\n        status\n        channelType\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": typeof types.GetCampaignsDocument,
    "\n  query GetContacts($filters: ContactFilterInput, $limit: Int, $page: Int) {\n    contacts(filters: $filters, limit: $limit, page: $page) {\n      contacts {\n        id\n        name\n        createdAt\n        updatedAt\n        contactChannels {\n          id\n          type\n          value\n          createdAt\n          updatedAt\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": typeof types.GetContactsDocument,
    "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n": typeof types.CurrentUserDocument,
};
const documents: Documents = {
    "\n  mutation BulkCreateContacts($input: BulkCreateContactInput!) {\n    bulkCreateContact(input: $input) {\n      created {\n        id\n        name\n        contactChannels {\n          id\n          type\n          value\n        }\n      }\n      errors {\n        index\n        error\n      }\n      summary {\n        total\n        successful\n        failed\n      }\n    }\n  }\n": types.BulkCreateContactsDocument,
    "\nmutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n    title\n    description\n    channelType\n    status\n    createdAt\n    updatedAt\n    contacts {\n      id\n      name\n    }\n  }\n}": types.CreateCampaignDocument,
    "\nmutation CreateContact($input: CreateContactInput!) {\n  createContact(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n    contactChannels {\n      id\n      type\n      value\n      createdAt\n      updatedAt\n    }\n  }\n}": types.CreateContactDocument,
    "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }": types.RegisterDocument,
    "\n  query CampaignStats {\n    campaignStats {\n      totalCampaigns\n      campaignsByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n      campaignsByChannel {\n        email\n        sms\n      }\n    }\n  }\n": types.CampaignStatsDocument,
    "\n  query GetCampaigns($filters: CampaignFiltersInput, $limit: Int, $page: Int) {\n    campaigns(filters: $filters, limit: $limit, page: $page) {\n      campaigns {\n        id\n        title\n        status\n        channelType\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": types.GetCampaignsDocument,
    "\n  query GetContacts($filters: ContactFilterInput, $limit: Int, $page: Int) {\n    contacts(filters: $filters, limit: $limit, page: $page) {\n      contacts {\n        id\n        name\n        createdAt\n        updatedAt\n        contactChannels {\n          id\n          type\n          value\n          createdAt\n          updatedAt\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n": types.GetContactsDocument,
    "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n": types.CurrentUserDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation BulkCreateContacts($input: BulkCreateContactInput!) {\n    bulkCreateContact(input: $input) {\n      created {\n        id\n        name\n        contactChannels {\n          id\n          type\n          value\n        }\n      }\n      errors {\n        index\n        error\n      }\n      summary {\n        total\n        successful\n        failed\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation BulkCreateContacts($input: BulkCreateContactInput!) {\n    bulkCreateContact(input: $input) {\n      created {\n        id\n        name\n        contactChannels {\n          id\n          type\n          value\n        }\n      }\n      errors {\n        index\n        error\n      }\n      summary {\n        total\n        successful\n        failed\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n    title\n    description\n    channelType\n    status\n    createdAt\n    updatedAt\n    contacts {\n      id\n      name\n    }\n  }\n}"): (typeof documents)["\nmutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n    title\n    description\n    channelType\n    status\n    createdAt\n    updatedAt\n    contacts {\n      id\n      name\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation CreateContact($input: CreateContactInput!) {\n  createContact(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n    contactChannels {\n      id\n      type\n      value\n      createdAt\n      updatedAt\n    }\n  }\n}"): (typeof documents)["\nmutation CreateContact($input: CreateContactInput!) {\n  createContact(input: $input) {\n    id\n    name\n    createdAt\n    updatedAt\n    contactChannels {\n      id\n      type\n      value\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginUserInput!) {\n    login(input: $input) {\n      message\n      user {\n        id\n        email\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }"): (typeof documents)["\n  mutation Register($input: RegisterUserInput!) {\n    register(input: $input) {\n      message\n      data {\n        id\n        email\n        name\n      }\n    }\n  }"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CampaignStats {\n    campaignStats {\n      totalCampaigns\n      campaignsByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n      campaignsByChannel {\n        email\n        sms\n      }\n    }\n  }\n"): (typeof documents)["\n  query CampaignStats {\n    campaignStats {\n      totalCampaigns\n      campaignsByStatus {\n        draft\n        queued\n        active\n        completed\n        failed\n      }\n      campaignsByChannel {\n        email\n        sms\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCampaigns($filters: CampaignFiltersInput, $limit: Int, $page: Int) {\n    campaigns(filters: $filters, limit: $limit, page: $page) {\n      campaigns {\n        id\n        title\n        status\n        channelType\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCampaigns($filters: CampaignFiltersInput, $limit: Int, $page: Int) {\n    campaigns(filters: $filters, limit: $limit, page: $page) {\n      campaigns {\n        id\n        title\n        status\n        channelType\n        createdAt\n        updatedAt\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetContacts($filters: ContactFilterInput, $limit: Int, $page: Int) {\n    contacts(filters: $filters, limit: $limit, page: $page) {\n      contacts {\n        id\n        name\n        createdAt\n        updatedAt\n        contactChannels {\n          id\n          type\n          value\n          createdAt\n          updatedAt\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetContacts($filters: ContactFilterInput, $limit: Int, $page: Int) {\n    contacts(filters: $filters, limit: $limit, page: $page) {\n      contacts {\n        id\n        name\n        createdAt\n        updatedAt\n        contactChannels {\n          id\n          type\n          value\n          createdAt\n          updatedAt\n        }\n      }\n      pagination {\n        total\n        page\n        totalPages\n        limit\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n"): (typeof documents)["\n  query CurrentUser {\n    currentUser {\n      id\n      email\n      name\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;