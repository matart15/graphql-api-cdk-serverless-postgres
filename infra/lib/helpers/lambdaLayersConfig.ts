import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

export const lambdaLayersConfig = {
  createPrismaClient: {
    assetPath: '../build/create_prisma_client',
    description: 'creates prisma client',
  },
  prismaLibrary: {
    prepare: async () => {
      fs.removeSync('build/lambda-layers-prisma-client');
      fs.copySync(
        '../database/node_modules/.prisma/client',
        'build/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client',
        { dereference: true },
      );
      fs.copySync(
        '../database/node_modules/@prisma',
        'build/lambda-layers-prisma-client/nodejs/node_modules/@prisma',
        { dereference: true },
      );
      glob
        .sync('../database/node_modules/.prisma/client/libquery_engine-rhel-*')
        .forEach(async (file) => {
          const filename = path.basename(file);
          fs.copySync(file, '/tmp/' + filename);
        });
      glob
        .sync(
          'build/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client/libquery_engine-*',
        )
        .forEach(async (file) => {
          fs.removeSync(file);
        });
      glob
        .sync(
          'build/lambda-layers-prisma-client/nodejs/node_modules/prisma/libquery_engine-*',
        )
        .forEach(async (file) => {
          fs.removeSync(file);
        });

      fs.removeSync(
        'build/lambda-layers-prisma-client/nodejs/node_modules/@prisma/engines',
      );
      glob.sync('/tmp/libquery_engine-rhel-*').forEach(async (file) => {
        const filename = path.basename(file);
        fs.copySync(
          file,
          'build/lambda-layers-prisma-client/nodejs/node_modules/.prisma/client/' +
            filename,
        );
      });
    },
    assetPath: 'build/lambda-layers-prisma-client',
    // destroy: async () => {},
    description: '3rd party prisma client',
  },
  externalLibraries: {
    assetPath: '../build/external_libraries',
    description: '3rd party shared external libraires',
  },
};
