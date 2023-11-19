import { RSCommentWithFile } from '../check/types'


export default function cmpRSComment(
  a: RSCommentWithFile,
  b: RSCommentWithFile
) {
  if (a.file === b.file) return a.startLine - b.startLine
  return a.file < b.file ? -1 : 1
}
