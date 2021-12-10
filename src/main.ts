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
    const secret_id: string = core.getInput('secret_id', {
      required: true,
      trimWhitespace: true
    })
    const version_id = getOptionalInput('version_id')
    const version_stage = getOptionalInput('version_stage')

    core.debug('Initialising SecretsManagerClient')
    const client = new SecretsManagerClient({})
    const command = new GetSecretValueCommand({
      SecretId: secret_id,
      VersionId: version_id,
      VersionStage: version_stage
    })

    core.debug('Getting secret')
    const response = await client.send(command)

    core.setOutput('secret', response.SecretString)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed('Unknow Error ?!')
  }
}

run()
