import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ScanTrendStats {
  @Field()
  date: string;

  @Field()
  scans: number;

  @Field()
  vulnerabilities: number;
}
