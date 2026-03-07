import * as path from 'path';

import { Request, Response } from 'express';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactChannelModule } from './contact-channel/contact-channel.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthTokenMiddleware } from './commom/middlewares/auth-token.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        synchronize: configService.get<boolean>('database.synchronization'),
        autoLoadEntities: true,
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
        include: [
          AuthModule,
          UsersModule,
          CampaignsModule,
          ContactsModule,
          ContactChannelModule,
        ],
        cors: {
          origin: configService.get<string>('app.corsOrigin'),
          credentials: true,
        },
        context: ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
        }),
      }),
    }),
    AuthModule,
    UsersModule,
    CampaignsModule,
    ContactsModule,
    ContactChannelModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthTokenMiddleware).forRoutes('*');
  }
}
