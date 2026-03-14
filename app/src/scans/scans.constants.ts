import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';

export const SCAN_STATUS_CHANGED = 'scanStatusChanged';

export const createPubSub = (): PubSub => new PubSub();
