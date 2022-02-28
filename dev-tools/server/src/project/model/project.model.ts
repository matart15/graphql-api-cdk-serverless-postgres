import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphqlJSON from 'graphql-type-json';

@ObjectType({ description: 'Project' })
export class Project {
  @Field((_type) => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  creationDate: Date;

  @Field((_type) => [String])
  ingredients: string[];

  @Field((_type) => GraphqlJSON)
  dirTree: any;
}
