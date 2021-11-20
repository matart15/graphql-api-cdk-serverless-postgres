import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

export const lambdaLayersConfig = {
  createPrismaClient: {
    assetPath: 'build/create_prisma_client',
    description: 'creates prisma client',
  },
  prismaLibrary: {
    prepare: async () => {
      fs.removeSync('database/lambda-layers-prisma-client');
      fs.copySync(
        'database/node_modules/.prisma/client',
        'database/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client',
        { dereference: true },
      );
      fs.copySync(
        'database/node_modules/@prisma',
        'database/lambda-layers-prisma-client/nodejs/node_modules/@prisma',
        { dereference: true },
      );
      glob
        .sync('database/node_modules/.prisma/client/libquery_engine-rhel-*')
        .forEach(async (file) => {
          const filename = path.basename(file);
          fs.copySync(file, '/tmp/' + filename);
        });
      glob
        .sync(
          'database/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client/libquery_engine-*',
        )
        .forEach(async (file) => {
          fs.removeSync(file);
        });
      glob
        .sync(
          'database/lambda-layers-prisma-client/nodejs/node_modules/prisma/libquery_engine-*',
        )
        .forEach(async (file) => {
          fs.removeSync(file);
        });

      fs.removeSync(
        'database/lambda-layers-prisma-client/nodejs/node_modules/@prisma/engines',
      );
      glob.sync('/tmp/libquery_engine-rhel-*').forEach(async (file) => {
        const filename = path.basename(file);
        fs.copySync(
          file,
          'database/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client/' +
            filename,
        );
      });
    },
    assetPath: 'database/lambda-layers-prisma-client',
    // destroy: async () => {},
    description: '3rd party prisma client',
  },
  externalLibraries: {
    assetPath: 'external_libraries',
    description: '3rd party shared external libraires',
  },
};
