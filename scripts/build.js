const pug = require('pug')
const globAsync = require('glob')
const { resolve, normalize, dirname } = require('path')
const { writeFile, mkdir, copyFile } = require('fs').promises
const { getDirectories } = require('./helpers')

function compile (file) {
  return pug.compileFile(file, { pretty: true })()
}

async function glob (pattern, options) {
  return new Promise((resolve, reject) => {
    globAsync(pattern, options, (err, matches) => {
      if (err) {
        return reject(err)
      }
      resolve(matches)
    })
  })
}

;(async () => {
  const dist = resolve(__dirname, '../dist')
  const src = resolve(__dirname, '../rulesets')

  const rulesets = await getDirectories(src)
  for (const ruleset of rulesets) {
    const pugFiles = await glob(`${ruleset}/**/*.pug`)
    for (const pugFile of pugFiles) {
      const output = compile(pugFile)
      const outputFile = normalize(pugFile).replace(src, dist).replace(/\.pug$/, '.xml')
      await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 })
      await writeFile(outputFile, output, { encoding: 'utf-8' })
    }
    const otherFiles = await glob(`${ruleset}/**/*.!(pug)`)
    for (const otherFile of otherFiles) {
      const outputFile = normalize(otherFile).replace(src, dist)
      await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 })
      await copyFile(otherFile, outputFile)
    }
  }
})().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
