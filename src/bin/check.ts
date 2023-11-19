import { readFile } from 'fs/promises'
import { globStream } from 'glob'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'
import checkFile from '../check/checkFile'
import checkFiles from '../check/checkFiles'
import { ppRSCommentLoc } from '../check/prettyPrint'
import { Issue, RSCommentWithFile } from '../check/types'
import patterns from '../patterns'


function countFileScope(fileScope: Map<string, {
  require?: RSCommentWithFile
  satisfied?: RSCommentWithFile
}>) {
  let nRequire = 0
  let nSatisfied = 0
  for (const { require: req, satisfied: sat } of fileScope.values()) {
    if (req) nRequire++
    if (sat) nSatisfied++
  }
  return {
    nRequire,
    nSatisfied
  }
}

async function main() {
  const chalk = (await import('chalk')).default
  const {
    lang,
    include = [], exclude = [],
    verbose
  } = await yargs(hideBin(process.argv))
    .option('lang', {
      alias: 'l',
      desc: 'Source code language (to determine comment format)',
      type: 'string',
      choices: Object.keys(patterns).concat([ 'auto' ]),
      default: 'auto'
    })
    .option('include', {
      alias: 'i',
      desc: 'Patterns to include',
      type: 'array',
      default: [ '**/*.*' ],
      demandOption: true
    })
    .option('exclude', {
      alias: 'x',
      desc: 'Patterns to exclude',
      type: 'array',
      default: [
        '**/node_modules/**',
        '**/__pycache__/**',
        '**/*.map'
      ],
      demandOption: false
    })
    .option('verbose', {
      alias: 'v',
      desc: 'Enable verbose output',
      type: 'boolean',
      default: false
    })
    .help()
    .argv
  if (verbose) {
    console.log(chalk.blackBright(`lang=${lang}`))
    console.log(chalk.blackBright(`include=${include.join(', ')}`))
    console.log(chalk.blackBright(`exclude=${exclude.join(', ')}`))
  }
  const files = globStream(
    include.map(inc => inc.toString()),
    {
      ignore: exclude.map(exc => exc.toString()),
      withFileTypes: true
    }
  )
  const tasks: Promise<ReturnType<typeof checkFile>>[] = []
  for await (const file of files) {
    if (!file.isFile()) continue
    tasks.push((async () => {
      const fullPath = file.fullpath()
      const src = (await readFile(fullPath)).toString()
      return checkFile(src, fullPath, lang)
    })())
  }
  const fileResults = await Promise.all(tasks)
  fileResults.sort((a, b) => a.file < b.file ? -1 : 1)
  const filesRes = checkFiles(fileResults)
  const issues = new Map<string, { warns: Issue[], errs: Issue[] }>()
  fileResults.forEach(({ file, warns, errs, fileScope, externScope }) => {
    issues.set(file, { warns, errs })
    if (verbose) {
      const { nRequire, nSatisfied } = countFileScope(fileScope)
      const local = `${nSatisfied}/${nRequire}`
      const extSat = externScope.satisfied
      const extReq = externScope.require
      const extern = `${extSat.size}/${extReq.size}`
      console.log(
        chalk.blackBright(file),
        (nSatisfied || nRequire)
          ? chalk.cyanBright(local)
          : chalk.blackBright(local),
        (extSat.size || extReq.size)
          ? chalk.cyanBright(extern)
          : chalk.blackBright(extern)
      )
    }
  })
  filesRes.warns.forEach(warn => {
    const { file } = warn.comments[0]
    const existing = issues.get(file)
      ?? { warns: [], errs: [] }
    existing.warns.push(warn)
    issues.set(file, existing)
  })
  filesRes.errs.forEach(err => {
    const { file } = err.comments[0]
    const existing = issues.get(file)
      ?? { warns: [], errs: [] }
    existing.errs.push(err)
    issues.set(file, existing)
  })
  const sortedIssues = [ ...issues ].sort((a, b) => a[0] < b[0] ? -1 : 1)
  let nWarns = 0
  let nErrs = 0
  for (const [ file, { warns, errs } ] of sortedIssues) {
    if (verbose) {
      console.log(chalk.blackBright(`${file}: ` +
        `${warns.length} warning(s), ${errs.length} error(s)`))
    }
    nWarns += warns.length
    nErrs += errs.length
    for (const { msg, details, comments } of errs) {
      console.log(`${chalk.bgRed('ERROR')}: ${chalk.red(msg)} at`)
      console.log(`  ${chalk.red(ppRSCommentLoc(comments[0]))}`)
      if (details) {
        details.forEach(line => console.log('  ' + line))
      }
      console.log()
    }
    for (const { msg, details, comments } of warns) {
      console.log(`${chalk.bgYellowBright('WARN')}: ` +
        `${chalk.yellowBright(msg)} at`)
      console.log(`  ${chalk.yellowBright(ppRSCommentLoc(comments[0]))}`)
      if (details) {
        details.forEach(line => console.log('  ' + line))
      }
      console.log()
    }
  }
  console.log(`${chalk.blueBright(tasks.length)} file(s) scanned`)
  console.log(nWarns
    ? chalk.yellowBright(`${nWarns} warning(s)`)
    : '0 warnings'
  )
  console.log(nErrs
    ? chalk.redBright(`${nErrs} error(s)`)
    : '0 errors'
  )
}

main()
