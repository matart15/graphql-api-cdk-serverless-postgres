import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ProjectModule } from './project/project.module';
import { GraphqlResolverModule } from './graphql-resolver/graphql-resolver.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    ProjectModule,
    GraphqlResolverModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
