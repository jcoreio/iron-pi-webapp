// @flow
/* eslint-disable no-console, flowtype/require-return-type, flowtype/require-parameter-type */

const path = require('path')
const glob = require('glob')
const {exec} = require('./promake')
const fs = require('fs-extra')
const {
  snakeCase,
  startCase,
} = require('lodash')

const homedir = path.normalize(require('os').homedir())

async function bootstrap(rule /* : {args: Array<string>} */) /* : Promise<any> */ {
  const dryRun = rule.args.indexOf('--dry-run') >= 0
  if (dryRun) console.error('Performing dry run.')
  const packageJson = require('../package.json')
  const [
    match, // eslint-disable-line no-unused-vars
    originalOrg, originalProject,
  ] = /github.com\/([^/.]+)\/([^/.]+)/.exec(packageJson.repository.url)

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  async function question(prompt, defaultValue) {
    if (defaultValue) prompt = `${prompt}[${defaultValue}] `
    return new Promise((resolve, reject) => {
      readline.question(prompt, (result) => {
        const finalResult = result || defaultValue
        if (finalResult) resolve(finalResult)
        else {
          console.error('No value provided, aborting setup')
          process.exit(1)
        }
      })
    })
  }

  const projectDir = path.resolve(__dirname, '..')
  const organizationDir = path.normalize(path.dirname(projectDir))

  const defaultOrganization = organizationDir !== homedir ? path.basename(organizationDir) : originalOrg

  const organization = await question('Organization name: ', defaultOrganization)
  const project = await question('Project name: ', path.basename(projectDir))
  const description = await question('Description: ')
  const packageName = await question('Package name: ', `@${organization}/${project}`)
  const gitRepo = await question('Git repo: ', `https://github.com/${organization}/${project}`)
  const appTitle = await question('App Title: ', startCase(project))
  const author = await question('Author: ', packageJson.author)
  const ready = await question('Everything look good? ', 'no')

  if (ready.toLowerCase()[0] !== 'y') process.exit(1)

  console.error('Renaming git remotes...')
  if (!dryRun) {
    await exec(`git remote rename origin skeleton`).catch(() => {})
    await exec(`git config branch.master.remote origin`).catch(() => {})
    await exec(`git remote add origin ${gitRepo}`).catch(() => {})
  }

  console.error('Updating package.json...')
  packageJson.name = packageName
  packageJson.description = description
  packageJson.author = author
  packageJson.repository.url = `git+${gitRepo}.git`
  packageJson.bugs.url = `${gitRepo}/issues`
  packageJson.homepage = `${gitRepo}#readme`
  const packageJsonOut = JSON.stringify(packageJson, null, 2)
  if (dryRun) console.error(packageJsonOut)
  else await fs.writeFile('package.json', packageJsonOut, 'utf8')

  const files = [
    'README.md',
    'Dockerfile',
    'docker-compose.yml',
    ...glob.sync('env/**/*'),
    ...glob.sync('src/**/*'),
    ...glob.sync('webpack/**/*'),
    ...glob.sync('scripts/**/*'),
    ...glob.sync('test/**/*'),
  ]

  await Promise.all(files.map(async file => {
    if ((await fs.stat(file)).isDirectory()) return
    const before = await fs.readFile(file, 'utf8')
    const after = before
      .replace(new RegExp(`${originalOrg}/${originalProject}`, 'g'), `${organization}/${project}`)
      .replace(new RegExp(`${originalProject}`, 'g'), project)
      .replace(new RegExp(`${snakeCase(originalProject)}`, 'g'), snakeCase(project))
      .replace(/<<APP_TITLE>>/g, appTitle)
    if (after !== before) {
      console.error(`Updating ${file}...`)
      if (dryRun) console.error(after)
      else await fs.writeFile(file, after, 'utf8')
    }
  }))

  if (!dryRun) {
    await exec(`git add .`)
    await exec(`git commit -n -m "feat: rename project"`)
  }
}

module.exports = bootstrap

