import * as  fs from 'fs-extra';
import { 
  DocumentNode, 
  visit,
  parse,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLNonNull,
  GraphQLFieldConfigArgumentMap,
  GraphQLBoolean,
} from 'graphql'
import { 
  collectFields,
  addTypes, 
  printSchemaWithDirectives,
  appendObjectFields,
  modifyObjectFields,
} from "@graphql-tools/utils"
import { loadSchema } from "@graphql-tools/load";
import { mergeGraphQLNodes } from "@graphql-tools/merge";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { constants } from 'buffer';

const queries = []
function removeFields(query: any): DocumentNode {
  return visit(query, {
    // tslint:disable-next-line:function-name
    FieldDefinition: {
      enter(node: any, key, parent, path, ancestors) {
        if(ancestors.find(
          (a: any) =>
            a.name?.value === 'Query'
            // a.name?.value === 'Mutation' ||
            // a.name?.value === 'Subscription'
        )){
          queries.push(node)
        }
        return  undefined
      },
    },
  })
}
export const addResolverToGraphql = async ({type, name}: {type: "mutation" | "query" | "subscription", name: string}) => {
  const graphqlString: string = fs.readFileSync('./api/graphql/schema.graphql',
            {encoding:'utf8', flag:'r'});

  const graphqlCode = parse(graphqlString)
  const graphqlSchema = await loadSchema('./api/graphql/schema.graphql', {
    loaders: [new GraphQLFileLoader()]
  })

  const schema1 = await loadSchema('type A { foo: String }', {loaders: []})
  // console.log("🚀 ~ file: graphql.ts ~ line 36 ~ addResolverToGraphql ~ schema1", schema1)

  const QueryType: any = graphqlSchema.getQueryType();
  // console.log("query type",  QueryType);
  const queryConfig = QueryType?.toConfig() ;

  // const nestedQuery = new GraphQLObjectType({
  //   ...queryConfig,
  //   name: "someTypeName",
  // });

  // let newSchema = addTypes(graphqlSchema, [QueryType]);
  const args: GraphQLFieldConfigArgumentMap = {
    id: {
      description: "id",
      type: GraphQLBoolean,
    }
  }
  const newRootFieldConfigMap: GraphQLFieldConfigMap<any, any> = {
    ["someFieldName"]: {
      type: new GraphQLNonNull(QueryType),
      args,
      resolve: (parent, args, context, info) => {
        // if (this.resolver != null) {
        //   return this.resolver(parent, args, context, info);
        // }
        console.log("this is resolver", parent, args, context, info)

        return {};
      },
    },
  };

  const schema2 = appendObjectFields(graphqlSchema, "newTypeName", {})
  const  [modified2] =  modifyObjectFields(schema2, "newTypeName", () => true, newRootFieldConfigMap);

  // const schema = appendObjectFields(graphqlSchema, "Query", {})
  const  [modified] =  modifyObjectFields(graphqlSchema, "Query", () => false, newRootFieldConfigMap);
  console.log(`aaaaaaaaaaaaaaaaaaaaaaaaaa`,)
  // console.log(printSchemaWithDirectives(newSchema))
  console.log(`aaaaaaaaaaaaaaaaaaaaaaaaaa`,)
  console.log(printSchemaWithDirectives(modified))
  // console.log(collectFields(graphqlCode))

  // try {
    const queryLessPrismadDefs = removeFields(graphqlCode)
  //   console.log("🚀 ~ file: graphql.ts ~ line 33 ~ addResolverToGraphql ~ queryLessPrismadDefs", queryLessPrismadDefs)
    // console.log("🚀 ~ file: graphql.ts ~ line 5 ~ queries", JSON.stringify(queries, null, 2))
  // } catch (error) {
  //   console.log("🚀 ~ file: graphql.ts ~ line 5 ~ error", error)
  // }
}