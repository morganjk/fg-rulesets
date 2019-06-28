const { lstat, readdir, unlink } = require('fs').promises
const { resolve } = require('path')
const readline = require('readline')
const zipper = require('zip-local')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function readStdin (query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer))
  })
}

async function isDir (file) {
  const info = await lstat(file)
  return info.isDirectory()
}

async function getDirectories (base, exclude = []) {
  const files = await readdir(base)
  const shapedFiles = await Promise.all(files.map(async (name) => {
    const fullPath = resolve(base, name)
    return !exclude.includes(name) && (await isDir(fullPath)) ? fullPath : false
  }))

  return shapedFiles.filter(Boolean)
}

async function tryUnlink (path) {
  try {
    await unlink(path)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e
    }
  }
}

async function zip (src, dst) {
  return new Promise((resolve, reject) => {
    zipper.zip(src, (err, zipped) => {
      if (err) {
        return reject(err)
      }
      zipped.compress()
      zipped.save(dst, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  })
}

module.exports = {
  isDir,
  getDirectories,
  readStdin,
  tryUnlink,
  zip
}
