import path from 'path'
import CommentParser, { CommentMarks } from '../CommentParser'
import cmpRSComment from '../helpers/cmpRSComment'
import parseComment from '../parseComment'
import patterns, { extPatterns } from '../patterns'
import { mkErrMissingAnother, mkWarnDup } from './issues'
import { Issue, RSCommentWithFile } from './types'


export interface ExternScope {
  require: Map<string, RSCommentWithFile>
  satisfied: Map<string, RSCommentWithFile>
}

export default function checkFile(src: string, file: string, lang: string) {
  let pattern: CommentMarks
  switch (lang) {
    case 'auto': {
      const ext = path.extname(src).toLowerCase()
      pattern = extPatterns.get(ext) ?? extPatterns.get('')!
      break
    }
    case 'Any': {
      pattern = extPatterns.get('')!
      break
    }
    default: {
      pattern = patterns[lang as keyof (typeof patterns)]?.format
        ?? extPatterns.get('')!
      break
    }
  }
  const comParser = new CommentParser(src, pattern)
  const comments = [ ...comParser.parse() ]
  const parseRes = comments.flatMap(com => [ ...parseComment(com) ])
  const fileScope = new Map<string, {
    require?: RSCommentWithFile
    satisfied?: RSCommentWithFile
  }>()
  const externScope: ExternScope = {
    require: new Map<string, RSCommentWithFile>(),
    satisfied: new Map<string, RSCommentWithFile>()
  }
  const warns: Issue[] = []
  for (const com of parseRes) {
    const { type, param, id } = com
    const _com: RSCommentWithFile = { ...com, file }
    if (param === '(extern)') {
      const existing = externScope[type].get(id)
      if (existing) {
        warns.push(mkWarnDup(_com, existing))
        continue
      }
      externScope[type].set(id, _com)
      continue
    }
    const record = fileScope.get(id) ?? {}
    const existing = record[type]
    if (existing) {
      warns.push(mkWarnDup(_com, existing))
      continue
    }
    record[type] = _com
    fileScope.set(id, record)
  }
  const errs: Issue[] = []
  for (const { require: req, satisfied: sat } of fileScope.values()) {
    if (req && !sat) {
      errs.push(mkErrMissingAnother(req, 'satisfied'))
    } else if (!req && sat) {
      errs.push(mkErrMissingAnother(sat, 'require'))
    }
  }
  return {
    file,
    warns,
    errs: errs.sort((a, b) => cmpRSComment(a.comments[0], b.comments[0])),
    fileScope,
    externScope
  }
}
