import cmpRSComment from '../helpers/cmpRSComment'
import type { ExternScope } from './checkFile'
import { mkErrMissingAnother, mkWarnDup } from './issues'
import { Issue, RSCommentWithFile } from './types'


export default function checkFiles(files: {
  externScope: ExternScope
}[]) {
  const warns: Issue[] = []
  const globalScope = new Map<string, {
    require?: RSCommentWithFile
    satisfied?: RSCommentWithFile
  }>()
  function updateRecord(com: RSCommentWithFile) {
    const { type, id } = com
    const existingRecord = globalScope.get(id) ?? {}
    const existing = existingRecord[type]
    if (existing) {
      warns.push(mkWarnDup(com, existing))
      return
    }
    existingRecord[type] = com
    globalScope.set(id, existingRecord)
  }
  for (const {
    externScope: { require: req, satisfied: sat }
  } of files) {
    for (const com of req.values()) updateRecord(com)
    for (const com of sat.values()) updateRecord(com)
  }
  const errs: Issue[] = []
  for (const { require: req, satisfied: sat } of globalScope.values()) {
    if (req && !sat) {
      errs.push(mkErrMissingAnother(req, 'satisfied'))
    } else if (!req && sat) {
      errs.push(mkErrMissingAnother(sat, 'require'))
    }
  }
  return {
    warns,
    errs: errs.sort((a, b) => cmpRSComment(a.comments[0], b.comments[0])),
    globalScope
  }
}
