import {
  getInput,
  debug,
  setSecret,
  exportVariable,
  setOutput,
  getBooleanInput,
  setFailed
} from '@actions/core'
import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import {promises as fs} from 'fs'

function getOptionalInput(input: string): string | undefined {
  const result = getInput(input, {required: false, trimWhitespace: true})
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
    debug('No JSON processing needed')
    return
  }

  debug('Parsing JSON')
  const secretObj = JSON.parse(secret, (_, value) => {
    if (maskJsonValues) setSecret(value)
    return value
  })

  if (typeof secretObj !== 'object') {
    throw new Error('Secret was JSON but not an object 🤔')
  }

  exportKeys(secretObj, keysAsEnvVars, keysAsOutputs)
  writeEnvFile(secretObj, envFilePath)
}

async function writeEnvFile(
  secretObj: object,
  envFilePath?: string
): Promise<void> {
  if (!envFilePath) {
    debug('No need to export env file')
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
  secretObj: object,
  keysAsEnvVars: boolean,
  keysAsOutputs: boolean
): void {
  if (!keysAsEnvVars && !keysAsOutputs) {
    debug('No JSON keys export needed')
    return
  }
  for (const [key, value] of Object.entries(secretObj)) {
    const valueAsString =
      typeof value === 'string' ? value : JSON.stringify(value)
    if (keysAsEnvVars) {
      debug(`Exporting Env variable ${key}`)
      exportVariable(key, valueAsString)
    }
    if (keysAsOutputs) {
      debug(`Setting output ${key}`)
      setOutput(key, valueAsString)
    }
  }
}

async function run(): Promise<void> {
  try {
    const secretId: string = getInput('secret-id', {
      required: true,
      trimWhitespace: true
    })
    const versionId = getOptionalInput('version-id')
    const versionStage = getOptionalInput('version-stage')

    const maskValue = getBooleanInput('mask-value')
    const maskJsonValues = getBooleanInput('mask-json-values')
    const keysAsEnvVars = getBooleanInput('keys-as-env-vars')
    const keysAsOutputs = getBooleanInput('keys-as-outputs')
    const envFilePath = getOptionalInput('append-to-env-file')

    // Used mainly for unit test to use localstack
    const awsEndpoint = process.env['AWS_SECRETS_MANAGER_ENDPOINT_URL']

    debug('Initialising SecretsManagerClient')
    debug(`AWS endpoint override: ${awsEndpoint}`)
    const client = new SecretsManagerClient({
      endpoint: awsEndpoint
    })
    const command = new GetSecretValueCommand({
      SecretId: secretId,
      VersionId: versionId,
      VersionStage: versionStage
    })

    debug('Getting secret')
    const response = await client.send(command)

    if (response.SecretString) {
      if (maskValue) setSecret(response.SecretString)
      await processJson(
        response.SecretString,
        maskJsonValues,
        keysAsEnvVars,
        keysAsOutputs,
        envFilePath
      )
    } else {
      debug('SecretString is undefined')
    }
    setOutput('secret', response.SecretString)
  } catch (error) {
    if (error instanceof Error) setFailed(error)
    else setFailed(`Unexpected error: ${error}`)
  }
}

run()
