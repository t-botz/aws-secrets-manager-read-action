<p align="center">
  <a href="https://github.com/t-botz/aws-secrets-manager-read-action/actions"><img alt="typescript-action status" src="https://github.com/t-botz/aws-secrets-manager-read-action/workflows/build-test/badge.svg"></a>
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
  uses: t-botz/aws-secrets-manager-read-action@v2
  with:
    secret-id: foo/bar
    mask-json-values: true
    keys-as-env-vars: true
    keys-as-outputs: true
    append-to-env-file: ./my.env
- name: Use Secret
  run: |
    # Will actually display '***' as secret will be masked in output
    echo "${{ fromJSON(steps.secrets.outputs.secret).MY_SECRET }}"
    # Same result thanks to `keys-as-outputs: true`
    echo "${{ steps.secrets.outputs.MY_SECRET }}"
    # Same result thanks to `keys-as-env-vars: true`
    echo "$MY_SECRET"
    # Show secret from env file
    cat ./my.env
```

## Inputs

| Name                 | Type    | Description                                                                                                                                                          |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret-id`          | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html)                                                   |
| `version-id`         | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html)                                                   |
| `version-stage`      | String  | Refer to [AWS Documention](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html)                                                   |
| `mask-value`         | Boolean | (Default `true`) Mask the whole secret value return by AWS.                                                                                                          |
| `mask-json-values`   | Boolean | (Default `false`) Assume the secret is JSON and mask all JSON object values, even the nested ones                                                                    |
| `keys-as-env-vars`   | Boolean | (Default `false`) Assume the secret is a JSON object and export the keys as env variables. Can then be accessed with `${{ env.MY_SECRET }}`.                         |
| `keys-as-outputs`    | Boolean | (Default `false`) Assume the secret is a JSON object and export the keys as env variables. Can then be accessed with `${{ steps.<id_of_steps>.outputs.MY_SECRET }}`. |
| `keys-as-outputs`    | Boolean | (Default `false`) Assume the secret is a JSON object and export the keys as env variables. Can then be accessed with `${{ steps.<id_of_steps>.outputs.MY_SECRET }}`. |
| `append-to-env-file` | Boolean | (Default `''`) 'Assume the secret is a JSON object and append the key values in an env file. The value is the path to the file.                                      |

## Outputs

| Name     | Type   | Description                                                                                                                   |
| -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `secret` | String | SecretString as returned by [AWS API](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) |
