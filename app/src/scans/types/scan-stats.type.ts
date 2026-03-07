import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ScanStatusStats {
  @Field(() => Int)
  draft: number;

  @Field(() => Int)
  queued: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  failed: number;
}

@ObjectType()
export class ScanStats {
  @Field(() => Int)
  totalScans: number;

  @Field(() => ScanStatusStats)
  scansByStatus: ScanStatusStats;
}
