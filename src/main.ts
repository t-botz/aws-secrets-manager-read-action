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

function mask(secret: string, isJson: boolean): void {
  core.setSecret(secret)
  if (isJson) {
    try {
      JSON.parse(secret, (_, value) => {
        core.setSecret(value)
      })
    } catch (error) {
      core.warning('Secret wasnt json')
      if (error instanceof Error) core.warning(error.message)
    }
  }
}

async function run(): Promise<void> {
  try {
    const secretId: string = core.getInput('secret-id', {
      required: true,
      trimWhitespace: true
    })
    const versionId = getOptionalInput('version-id')
    const versionStage = getOptionalInput('version-stage')
    const isJson = core.getBooleanInput('is-json')

    core.debug('Initialising SecretsManagerClient')
    const client = new SecretsManagerClient({})
    const command = new GetSecretValueCommand({
      SecretId: secretId,
      VersionId: versionId,
      VersionStage: versionStage
    })

    core.debug('Getting secret')
    const response = await client.send(command)

    if (response.SecretString) {
      mask(response.SecretString, isJson)
    } else {
      core.debug('SecretString is undefined')
    }
    core.setOutput('secret', response.SecretString)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed('Unknow Error ?!')
  }
}

run()
