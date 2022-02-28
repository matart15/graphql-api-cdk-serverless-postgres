import { Module } from '@nestjs/common';
import { GraphqlResolverResolver } from './graphql-resolver.resolver';

@Module({
  providers: [GraphqlResolverResolver],
})
export class GraphqlResolverModule {}
