## Structure

1. /docs                # docs are located here
2. /front               # frontend projects
   1. /user_web
   2. /admin
   3. /mobile
3. /api                 # api definitions
   1. /rest             # open api
   2. /graphql          # graphql definitions
4. /service
   1. /serverless       # serverless coes
   2. /servers          # codes that require servers
   3. /workers          # cronjobs
5. /database            # database migrations and clients
   1. /prisma
6. /infra               # infra codes. ( cdk )
   1. /bin
   2. /lib
7. /tools               # project tools
8. cli.ts               # main controller
