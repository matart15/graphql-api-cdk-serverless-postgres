## CLI

```
Usage: cli [options] [command]

Options:
  -h, --help         display help for command

Commands:
  version [options]  displays version
  help [command]     display help for command
```


TODO :

```
Commands
  project
    init      <name>
    upgrade-deps
  docs  
    add       [name]
    update    [name]
  front
    add       [name]
    deploy    [name]
  api
    rest
      add     [name]
    graphql
      add     [name] --type=query/mutation
      remove  [name]
  service
    serverless
      add     [name]
      remove  [name]
    servers
      add     [name]
      remove  [name]
    workers
      add     [name] --interval=cronstring --type=serverless/server
      remove  [name]
  database
    prisma
    migrate
  infra
    init
    cdk
    doctor
    deploy
    list
    synth
```


```