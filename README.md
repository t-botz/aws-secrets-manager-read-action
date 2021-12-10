<p align="center">
  <a href="https://github.com/thibaultdelor/aws-secrets-manager-read-action/actions"><img alt="typescript-action status" src="https://github.com/thibaultdelor/aws-secrets-manager-read-action/workflows/build-test/badge.svg"></a>
</p>

# AWS Secrets Manager Reader

Use this action to read a secret value from AWS Secret Manager.

This action assume that:

 - The credentials are in place (see [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials))
 - The AWS client has the permission required to get the secret


## Usage

```yaml
# TODO
```

## Inputs

| Name               | Type    | Description                       |
|--------------------|---------|-----------------------------------|
| `secret-id`        | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
| `version-id`       | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
| `version-stage`    | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |

## Outputs

| Name               | Type    | Description                       |
|--------------------|---------|-----------------------------------|
| `secret`           | String  | SecretString as return by [AWS API](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |