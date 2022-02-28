import { NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Project } from './model/project.model';
import * as dirTree from 'directory-tree';
import * as fs from 'fs-extra';
import { parse, printSchema, print, printType } from 'graphql';
import { loadSchema, filterKind, loadTypedefsSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

@Resolver((_of) => Project)
export class ProjectResolver {
  @Query((_returns) => Project)
  async project(@Args('id') id: string): Promise<Project> {
    const graphqlFilePath = '../../api/graphql/schema.graphql';
    const graphqlString: string = fs.readFileSync(graphqlFilePath, {
      encoding: 'utf8',
      flag: 'r',
    });

    const graphqlCode = parse(graphqlString);
    const graphqlSchema = await loadSchema(graphqlFilePath, {
      loaders: [new GraphQLFileLoader()],
    });
    const configs = graphqlSchema.getType('Post');
    console.log(
      '🚀 ~ file: project.resolver.ts ~ line 12 ~ ProjectResolver ~ project ~ dirTree',
      JSON.stringify(configs),
      printType(configs),
      configs,
      typeof configs,
    );
    const filteredTree = dirTree(process.cwd(), { exclude: /node_modules/ });
    const recipe: Project = {
      id: 'proj1',
      title: 'title',
      creationDate: new Date(),
      ingredients: [],
      dirTree: filteredTree,
    }; // await this.recipesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }
}
