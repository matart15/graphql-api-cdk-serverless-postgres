import * as cdk from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'

export class AuthStack extends cdk.Stack {
  public readonly userPoolClient: cognito.UserPoolClient
  public readonly userPool: cognito.UserPool
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.userPool = new cognito.UserPool(this, 'cdk-products-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    })

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
    })
  }
}
