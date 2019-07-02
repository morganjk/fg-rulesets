const { symlink } = require('fs').promises
const { resolve, basename } = require('path')
const { getDirectories, readStdin, tryUnlink } = require('./helpers')

;(async () => {
  const srcDir = resolve(__dirname, '../dist')
  const installDir = resolve(process.env.appdata, 'Fantasy Grounds/rulesets')

  const rulesets = await getDirectories(srcDir)

  for (const ruleset of rulesets) {
    const rulesetName = basename(ruleset)
    const dst = resolve(installDir, rulesetName)
    console.log(`Installing ${rulesetName}`)
    try {
      await symlink(ruleset, dst, 'junction')
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e
      }
      const answer = await readStdin(`${rulesetName} already exist, would you like to reinstall it ? [y/N] `)
      if (answer.toLowerCase() === 'y') {
        await tryUnlink(dst)
        await symlink(ruleset, dst, 'junction')
      }
    }
    tryUnlink(`${dst}.pak`)
  }
})().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
