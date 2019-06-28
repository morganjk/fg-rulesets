const { resolve, basename } = require('path')
const { getDirectories, tryUnlink, zip } = require('./helpers')

;(async () => {
  const srcDir = resolve(__dirname, '../rulesets')
  const installDir = resolve(process.env.appdata, 'Fantasy Grounds/rulesets')

  const rulesets = await getDirectories(srcDir)

  for (const ruleset of rulesets) {
    const rulesetName = basename(ruleset)
    const dst = resolve(installDir, rulesetName)
    console.log(`Installing ${rulesetName}`)

    await tryUnlink(dst)
    await tryUnlink(`${dst}.pak`)

    await zip(ruleset, `${dst}.pak`)
  }
})().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
