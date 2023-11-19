import { RSCommentType } from '../parseComment'
import { ppRSComment, ppRSCommentLoc } from './prettyPrint'
import { Issue, RSCommentWithFile } from './types'


export function mkWarnDup(
  comment: RSCommentWithFile,
  existing: RSCommentWithFile
) {
  const { type } = comment
  return {
    type: `duplicated-${type}`,
    msg: `Duplicated ${ppRSComment(comment)}`,
    details: [ `First defined at ${ppRSCommentLoc(existing)}` ],
    comments: [ comment, existing ]
  } as Issue
}

export function mkErrMissingAnother(
  comment: RSCommentWithFile,
  anotherType: RSCommentType
) {
  return {
    type: `missing-${anotherType}`,
    msg: `Missing corresponding ${anotherType.toUpperCase()} for ` +
      `${ppRSComment(comment)}`,
    comments: [ comment ]
  } as Issue
}
