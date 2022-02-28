import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import {ApiStack}  from '../lib/ApiStack';
import { AuthStack } from '../lib/AuthStack';
import { DataStack } from '../lib/DataStack';
import { NetworkStack } from '../lib/NetworkStack';

test('Empty Stack', () => {
  const app = new cdk.App()
  const env = {
    region: app.node.tryGetContext('region'),
    account: app.node.tryGetContext('accountID'),
  }
  const networkStack = new NetworkStack(app, 'NetworkStack', {
    env,
  })
  const authStack = new AuthStack(app, 'AuthStack', {
    env,
  })
  const dataStack = new DataStack(app, 'DataStack', {
    env,
    vpc: networkStack.vpc,
    privateSg: networkStack.privateSg,
    subnetGroup: networkStack.subnetGroup,
  })
  const stack = new ApiStack(app, 'ApiStack', {
    env,
    vpc: networkStack.vpc,
    privateSg: networkStack.privateSg,
    dbCluster: dataStack.dbCluster,
    userPool: authStack.userPool,
  })
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {
      "Resources": {
        "ApiApiLogsRole90293F72": {
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "appsync.amazonaws.com"
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "ManagedPolicyArns": [
              {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs"
                  ]
                ]
              }
            ]
          }
        },
        "ApiF70053CD": {
          "Type": "AWS::AppSync::GraphQLApi",
          "Properties": {
            "AuthenticationType": "API_KEY",
            "Name": "cdk-blog-appsync-api",
            "AdditionalAuthenticationProviders": [
              {
                "AuthenticationType": "AMAZON_COGNITO_USER_POOLS",
                "UserPoolConfig": {
                  "AwsRegion": {
                    "Ref": "AWS::Region"
                  },
                  "UserPoolId": {
                    "Fn::ImportValue": "AuthStack:ExportsOutputRefcdkproductsuserpool204A7D7F85CD1EF2"
                  }
                }
              }
            ],
            "LogConfig": {
              "CloudWatchLogsRoleArn": {
                "Fn::GetAtt": [
                  "ApiApiLogsRole90293F72",
                  "Arn"
                ]
              },
              "FieldLogLevel": "ALL"
            }
          }
        },
        "ApiSchema510EECD7": {
          "Type": "AWS::AppSync::GraphQLSchema",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "Definition": "type Post @aws_api_key @aws_cognito_user_pools {\n  id: String!\n  title: String!\n  content: String!\n}\n\ninput CreatePostInput {\n  id: String\n  title: String!\n  content: String!\n}\n\ninput UpdatePostInput {\n  id: String!\n  title: String\n  content: String\n}\n\ntype Query {\n  listPosts: [Post] @aws_api_key @aws_cognito_user_pools\n  getPostById(postId: String!): Post @aws_api_key @aws_cognito_user_pools\n}\n\ntype Mutation {\n  createPost(post: CreatePostInput!): Post @aws_cognito_user_pools(cognito_groups: [\"Admin\"])\n  deletePost(postId: String!): Post @aws_cognito_user_pools(cognito_groups: [\"Admin\"])\n  updatePost(post: UpdatePostInput!): Post @aws_cognito_user_pools(cognito_groups: [\"Admin\"])\n}\n\ntype Subscription {\n  onCreatePost: Post @aws_subscribe(mutations: [\"createPost\"])\n  onUpdatePost: Post @aws_subscribe(mutations: [\"updatePost\"])\n  onDeletePost: Post @aws_subscribe(mutations: [\"deletePost\"])\n}\n"
          }
        },
        "ApiDefaultApiKeyF991C37B": {
          "Type": "AWS::AppSync::ApiKey",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "Expires": 1677549790
          },
          "DependsOn": [
            "ApiSchema510EECD7"
          ]
        },
        "ApilambdaDatasourceServiceRole2CA75790": {
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "appsync.amazonaws.com"
                  }
                }
              ],
              "Version": "2012-10-17"
            }
          }
        },
        "ApilambdaDatasourceServiceRoleDefaultPolicy3A97E34D": {
          "Type": "AWS::IAM::Policy",
          "Properties": {
            "PolicyDocument": {
              "Statement": [
                {
                  "Action": "lambda:InvokeFunction",
                  "Effect": "Allow",
                  "Resource": {
                    "Fn::GetAtt": [
                      "MyFunction3BAA72D1",
                      "Arn"
                    ]
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "PolicyName": "ApilambdaDatasourceServiceRoleDefaultPolicy3A97E34D",
            "Roles": [
              {
                "Ref": "ApilambdaDatasourceServiceRole2CA75790"
              }
            ]
          }
        },
        "ApilambdaDatasource2C776EE2": {
          "Type": "AWS::AppSync::DataSource",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "Name": "lambdaDatasource",
            "Type": "AWS_LAMBDA",
            "LambdaConfig": {
              "LambdaFunctionArn": {
                "Fn::GetAtt": [
                  "MyFunction3BAA72D1",
                  "Arn"
                ]
              }
            },
            "ServiceRoleArn": {
              "Fn::GetAtt": [
                "ApilambdaDatasourceServiceRole2CA75790",
                "Arn"
              ]
            }
          }
        },
        "ApilambdaDatasourceQuerylistPostsResolver98BAE20F": {
          "Type": "AWS::AppSync::Resolver",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "FieldName": "listPosts",
            "TypeName": "Query",
            "DataSourceName": "lambdaDatasource",
            "Kind": "UNIT"
          },
          "DependsOn": [
            "ApilambdaDatasource2C776EE2",
            "ApiSchema510EECD7"
          ]
        },
        "ApilambdaDatasourceQuerygetPostByIdResolverB41F790A": {
          "Type": "AWS::AppSync::Resolver",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "FieldName": "getPostById",
            "TypeName": "Query",
            "DataSourceName": "lambdaDatasource",
            "Kind": "UNIT"
          },
          "DependsOn": [
            "ApilambdaDatasource2C776EE2",
            "ApiSchema510EECD7"
          ]
        },
        "ApilambdaDatasourceMutationcreatePostResolverAF0B5A16": {
          "Type": "AWS::AppSync::Resolver",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "FieldName": "createPost",
            "TypeName": "Mutation",
            "DataSourceName": "lambdaDatasource",
            "Kind": "UNIT"
          },
          "DependsOn": [
            "ApilambdaDatasource2C776EE2",
            "ApiSchema510EECD7"
          ]
        },
        "ApilambdaDatasourceMutationupdatePostResolverA3342FFC": {
          "Type": "AWS::AppSync::Resolver",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "FieldName": "updatePost",
            "TypeName": "Mutation",
            "DataSourceName": "lambdaDatasource",
            "Kind": "UNIT"
          },
          "DependsOn": [
            "ApilambdaDatasource2C776EE2",
            "ApiSchema510EECD7"
          ]
        },
        "ApilambdaDatasourceMutationdeletePostResolver32B9BD8C": {
          "Type": "AWS::AppSync::Resolver",
          "Properties": {
            "ApiId": {
              "Fn::GetAtt": [
                "ApiF70053CD",
                "ApiId"
              ]
            },
            "FieldName": "deletePost",
            "TypeName": "Mutation",
            "DataSourceName": "lambdaDatasource",
            "Kind": "UNIT"
          },
          "DependsOn": [
            "ApilambdaDatasource2C776EE2",
            "ApiSchema510EECD7"
          ]
        },
        "MyFunctionServiceRole3C357FF2": {
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "lambda.amazonaws.com"
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "ManagedPolicyArns": [
              {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
                  ]
                ]
              },
              {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
                  ]
                ]
              }
            ]
          }
        },
        "MyFunctionServiceRoleDefaultPolicyB705ABD4": {
          "Type": "AWS::IAM::Policy",
          "Properties": {
            "PolicyDocument": {
              "Statement": [
                {
                  "Action": "secretsmanager:GetSecretValue",
                  "Effect": "Allow",
                  "Resource": {
                    "Fn::ImportValue": "DataStack:ExportsOutputRefAuroraBlogClusterSecretAttachmentF62C1EEAB82D9B27"
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "PolicyName": "MyFunctionServiceRoleDefaultPolicyB705ABD4",
            "Roles": [
              {
                "Ref": "MyFunctionServiceRole3C357FF2"
              }
            ]
          }
        },
        "MyFunction3BAA72D1": {
          "Type": "AWS::Lambda::Function",
          "Properties": {
            "Code": {
              "S3Bucket": {
                "Ref": "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62S3BucketF76B6EC5"
              },
              "S3Key": {
                "Fn::Join": [
                  "",
                  [
                    {
                      "Fn::Select": [
                        0,
                        {
                          "Fn::Split": [
                            "||",
                            {
                              "Ref": "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62S3VersionKeyF233F7B0"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "Fn::Select": [
                        1,
                        {
                          "Fn::Split": [
                            "||",
                            {
                              "Ref": "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62S3VersionKeyF233F7B0"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                ]
              }
            },
            "Role": {
              "Fn::GetAtt": [
                "MyFunctionServiceRole3C357FF2",
                "Arn"
              ]
            },
            "Environment": {
              "Variables": {
                "SECRET_ID": {
                  "Fn::ImportValue": "DataStack:ExportsOutputRefAuroraBlogClusterSecretAttachmentF62C1EEAB82D9B27"
                },
                "AWS_NODEJS_CONNECTION_REUSE_ENABLED": "1"
              }
            },
            "Handler": "index.handler",
            "MemorySize": 1024,
            "Runtime": "nodejs14.x",
            "Timeout": 10,
            "VpcConfig": {
              "SecurityGroupIds": [
                {
                  "Fn::ImportValue": "NetworkStack:ExportsOutputFnGetAttprivatesg836C4F1DGroupId3B269013"
                }
              ],
              "SubnetIds": [
                {
                  "Fn::ImportValue": "NetworkStack:ExportsOutputRefBlogAppVPCprivateSubnet1SubnetFD13D0C3341CEFFD"
                },
                {
                  "Fn::ImportValue": "NetworkStack:ExportsOutputRefBlogAppVPCprivateSubnet2Subnet793491F88E9E1E96"
                }
              ]
            }
          },
          "DependsOn": [
            "MyFunctionServiceRoleDefaultPolicyB705ABD4",
            "MyFunctionServiceRole3C357FF2"
          ]
        }
      },
      "Parameters": {
        "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62S3BucketF76B6EC5": {
          "Type": "String",
          "Description": "S3 bucket for asset \"e7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62\""
        },
        "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62S3VersionKeyF233F7B0": {
          "Type": "String",
          "Description": "S3 key for asset version \"e7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62\""
        },
        "AssetParameterse7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62ArtifactHashB0510B23": {
          "Type": "String",
          "Description": "Artifact hash for asset \"e7a7abf3fa21401f0c35c7f9752aadf3877557dff2cac8e9a6b18d062382ec62\""
        }
      },
      "Outputs": {
        "AppSyncAPIURL": {
          "Value": {
            "Fn::GetAtt": [
              "ApiF70053CD",
              "GraphQLUrl"
            ]
          }
        },
        "AppSyncAPIKey": {
          "Value": {
            "Fn::GetAtt": [
              "ApiDefaultApiKeyF991C37B",
              "ApiKey"
            ]
          }
        }
      }
    }
  }, MatchStyle.NO_REPLACES))
});
