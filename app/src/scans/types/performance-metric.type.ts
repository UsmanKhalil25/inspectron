import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class PerformanceMetric {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => Int)
  performanceScore: number;

  @Field(() => Float)
  lcp: number;

  @Field(() => Float)
  fcp: number;

  @Field(() => Float)
  cls: number;

  @Field(() => Float)
  inp: number;

  @Field(() => Float)
  ttfb: number;

  @Field(() => Float)
  speedIndex: number;

  @Field(() => Float)
  totalBlockingTime: number;

  @Field(() => Float)
  domContentLoaded: number;

  @Field(() => Float)
  onLoad: number;

  @Field(() => Int)
  totalTransferSize: number;

  @Field(() => Int)
  resourceCount: number;

  @Field(() => String, { nullable: true })
  resources: string | null;

  @Field(() => String, { nullable: true })
  opportunities: string | null;

  @Field(() => String, { nullable: true })
  diagnostics: string | null;

  @Field()
  scanId: string;
}
