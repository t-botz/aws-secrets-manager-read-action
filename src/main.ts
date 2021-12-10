import * as core from '@actions/core'
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

function getOptionalInput(input: string): string | undefined {
  const result = core.getInput(input, {required: false, trimWhitespace: true})
  if (!result) {
    return undefined
  }
  return result
}

async function run(): Promise<void> {
  try {
    const secretId: string = core.getInput('secret-id', {
      required: true,
      trimWhitespace: true
    })
    const versionId = getOptionalInput('version-id')
    const versionStage = getOptionalInput('version-stage')

    core.debug('Initialising SecretsManagerClient')
    const client = new SecretsManagerClient({})
    const command = new GetSecretValueCommand({
      SecretId: secretId,
      VersionId: versionId,
      VersionStage: versionStage
    })

    core.debug('Getting secret')
    const response = await client.send(command)
    if (response.SecretString) core.setSecret(response.SecretString)
    core.setOutput('secret', response.SecretString)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed('Unknow Error ?!')
  }
}

run()
