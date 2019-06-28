const { readFile } = require('fs').promises
const { resolve, basename } = require('path')
const xmllint = require('xmllint')
const chalk = require('chalk')
const { getDirectories } = require('./helpers')

async function validate (dir) {
  const result = xmllint.validateXML({
    xml: await readFile(resolve(dir, 'base.xml')),
    schema: await readFile(resolve(__dirname, 'schemas/base.xsd'))
  })

  if (result.errors) {
    for (const error of result.errors) {
      console.error(chalk.red(error))
    }
    throw new Error('Errors occured while validating XML document')
  }
}

;(async () => {
  const dirs = await getDirectories(resolve(__dirname, '../rulesets'))
  for (const dir of dirs) {
    console.log(basename(dir))
    await validate(dir)
  }
})().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
