<p align="center">
  <a href="https://github.com/thibaultdelor/aws-secrets-manager-read-action/actions"><img alt="typescript-action status" src="https://github.com/thibaultdelor/aws-secrets-manager-read-action/workflows/build-test/badge.svg"></a>
</p>

# AWS Secrets Manager Reader

Use this action to read a secret value from AWS Secret Manager.

This action assume that:

 - The credentials are in place (see [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials))
 - The AWS client has the permission required to get the secret


## Usage

Assuming we have define in AWS Secret Manager a secret `foo/bar` with the following content:
```json
{
  "MY_SECRET": "123456"
}
```

```yaml
- uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-region: us-east-1
- name: Retrieve Secrets
  id: secrets
  uses: thibaultdelor/aws-secrets-manager-read-action@v0.0.1
  with:
    secret-id: foo/bar
    is-json: true
- name: Use Secret
  # Will actually display '***' as secret will be masked in output
  run: echo "${{ fromJSON(steps.secrets.outputs.secret).MY_SECRET }}"
```

## Inputs

| Name               | Type     | Description                       |
|--------------------|----------|-----------------------------------|
| `secret-id`        | String   | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
| `version-id`       | String   | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
| `version-stage`    | String   | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
| `is-json`          | Boolean  | Whether the credentials is a key/value json. Used for masking the values instead of the whole string/ |

## Outputs

| Name               | Type    | Description                       |
|--------------------|---------|-----------------------------------|
| `secret`           | String  | SecretString as return by [AWS API](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |