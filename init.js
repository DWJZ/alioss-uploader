const { program } = require('commander')
const pkg = require('./package.json')

program
  .version(pkg.version)
  .description(pkg.description)
  .option('-d, --dir <dirPath>', 'directory you want to upload')
  .option('-e, --env <envPath>', '.env file path')

program.parse(process.argv)
const options = program.opts()

module.exports = {
  options,
}
