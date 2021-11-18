import fs from 'fs-extra';

export const lambdaLayersConfig = {
  'lambda-layer-libs': {
    assetPath: 'build/lambda-layers-libs',
    description: 'shared codes for lambda',
  },
  'lambda-layers-prisma-client': {
    prepare: async () => {
      await fs.remove('lambda-layers-prisma-client');
      await fs.copy(
        'node_modules/.prisma/client',
        'lambda-layers-prisma-client/nodejs/node_modules/.prisma/client',
        { dereference: true },
      );
      await fs.copy(
        'node_modules/@prisma',
        'lambda-layers-prisma-client/nodejs/node_modules/@prisma',
        { dereference: true },
      );
    },
    assetPath: 'lambda-layers-prisma-client',
    destroy: async () => {},
    description: 'shared prisma client',
  },
};
