import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlResolverResolver } from './graphql-resolver.resolver';

describe('GraphqlResolverResolver', () => {
  let resolver: GraphqlResolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlResolverResolver],
    }).compile();

    resolver = module.get<GraphqlResolverResolver>(GraphqlResolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
