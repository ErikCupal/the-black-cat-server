const gulp = require('gulp')
const { readFileSync, mkdirSync, writeFileSync, createReadStream, createWriteStream, rmdirSync } = require('fs')
const rimraf = require('rimraf')
const exec = require('child_process').exec
const archiver = require('archiver')

const createZip = () => archiver('zip', { zlib: { level: 9 } })
const command = command => new Promise((resolve, reject) => {
  exec(command, (err, stdout, stderr) => {
    if (err) reject(err)
    if (stderr) reject(stdout + stderr)
    resolve(stdout)
  })
})
const removeDir = path => new Promise((resolve, reject) => rimraf(path, err => err ? reject() : resolve()))
const copyFile = (source, destination) => {
  const file = readFileSync(source)
  writeFileSync(destination, file)
}
const removeDistBuild = () => removeDir('./build-distribution')
const removeDistTemp = () => removeDir('./server')
const removeDistFolder = () => removeDir('./dist')
const createDistTemp = () => mkdirSync('./server')
const createDistFolder = () => mkdirSync('./dist')
const getPackageJsonObject = () => JSON.parse(readFileSync('package.json'))
const getNewPackageJsonObject = () => {
  const package = getPackageJsonObject()
  const {
    name,
    version,
    description,
    author,
    repository,
    license,
    dependencies,
  } = package

  const newPackage = {
    name,
    version,
    description,
    main: './index.js',
    scripts: {
      launch: 'node ./index.js'
    },
    author,
    repository,
    license,
    dependencies,
  }

  return newPackage
}
const writePackageJsonToTemp = (packageJsonObject) => {
  const packageJsonString = JSON.stringify(packageJsonObject, undefined, 2)
  writeFileSync('./server/package.json', packageJsonString)
}
const copyLicenseToTemp = () => copyFile('LICENSE.txt', './server/LICENSE.txt')
const copyReadmeToTemp = () => copyFile('README.md', './server/README.md')
const copyBuildToTemp = () => copyFile('build-distribution/index.js', './server/index.js')
const createDistZip = () => {
  createDistFolder()
  const archive = createZip()
  archive.directory('server')
  var output = createWriteStream(__dirname + '/dist/server.zip');
  archive.pipe(output)
  archive.finalize()

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve())
    archive.on('error', err => reject(err))
  })
}

gulp.task('dist', async () => {
  await removeDistFolder()
  await removeDistTemp()
  createDistTemp()
  const newPackageJsonObject = getNewPackageJsonObject()
  writePackageJsonToTemp(newPackageJsonObject)
  copyLicenseToTemp()
  copyReadmeToTemp()
  const buildLog = await command('npm run build-distribution')
  console.log(buildLog)
  copyBuildToTemp()
  await createDistZip()
  await removeDistBuild()
  await removeDistTemp()
})