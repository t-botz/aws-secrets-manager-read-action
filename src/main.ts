import * as core from '@actions/core'
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import {promises as fs} from 'fs'

function getOptionalInput(input: string): string | undefined {
  const result = core.getInput(input, {required: false, trimWhitespace: true})
  if (!result) {
    return undefined
  }
  return result
}

async function processJson(
  secret: string,
  maskJsonValues: boolean,
  keysAsEnvVars: boolean,
  keysAsOutputs: boolean,
  envFilePath?: string
): Promise<void> {
  if (!maskJsonValues && !keysAsEnvVars && !keysAsOutputs) {
    core.debug('No JSON processing needed')
    return
  }

  core.debug('Parsing JSON')
  const secretObj = JSON.parse(secret, (_, value) => {
    if (maskJsonValues) core.setSecret(value)
    return value
  })

  if (typeof secretObj !== 'object') {
    throw new Error('Secret was JSON but not an object 🤔')
  }

  exportKeys(secretObj, keysAsEnvVars, keysAsOutputs)
  writeEnvFile(secretObj, envFilePath)
}

async function writeEnvFile(
  secretObj: Object,
  envFilePath?: string
): Promise<void> {
  if (!envFilePath) {
    core.debug('No need to export env file')
    return
  }
  await fs.appendFile(
    envFilePath,
    `

#### Loaded via t-botz/aws-secrets-manager-read-action
${Object.entries(secretObj)
  .map(e => `${e[0]}=${e[1]}`)
  .join('\n')}
`
  )
}

function exportKeys(
  secretObj: Object,
  keysAsEnvVars: boolean,
  keysAsOutputs: boolean
): void {
  if (!keysAsEnvVars && !keysAsOutputs) {
    core.debug('No JSON keys export needed')
    return
  }
  for (const [key, value] of Object.entries(secretObj)) {
    const valueAsString =
      typeof value === 'string' ? value : JSON.stringify(value)
    if (keysAsEnvVars) {
      core.debug(`Exporting Env variable ${key}`)
      core.exportVariable(key, valueAsString)
    }
    if (keysAsOutputs) {
      core.debug(`Setting output ${key}`)
      core.setOutput(key, valueAsString)
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

    const maskValue = core.getBooleanInput('mask-value')
    const maskJsonValues = core.getBooleanInput('mask-json-values')
    const keysAsEnvVars = core.getBooleanInput('keys-as-env-vars')
    const keysAsOutputs = core.getBooleanInput('keys-as-outputs')
    const envFilePath = getOptionalInput('append-to-env-file')

    // Used mainly for unit test to use localstack
    const awsEndpoint = process.env['AWS_SECRETS_MANAGER_ENDPOINT_URL']

    core.debug('Initialising SecretsManagerClient')
    core.debug(`AWS endpoint override: ${awsEndpoint}`)
    const client = new SecretsManagerClient({
      endpoint: awsEndpoint
    })
    const command = new GetSecretValueCommand({
      SecretId: secretId,
      VersionId: versionId,
      VersionStage: versionStage
    })

    core.debug('Getting secret')
    const response = await client.send(command)

    if (response.SecretString) {
      if (maskValue) core.setSecret(response.SecretString)
      await processJson(
        response.SecretString,
        maskJsonValues,
        keysAsEnvVars,
        keysAsOutputs,
        envFilePath
      )
    } else {
      core.debug('SecretString is undefined')
    }
    core.setOutput('secret', response.SecretString)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error)
    else core.setFailed(`Unexpected error: ${error}`)
  }
}

run()
