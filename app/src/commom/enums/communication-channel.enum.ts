import { registerEnumType } from '@nestjs/graphql';

export enum CommunicationChannel {
  EMAIL = 'email',
  SMS = 'sms',
}

registerEnumType(CommunicationChannel, {
  name: 'CommunicationChannel',
});
