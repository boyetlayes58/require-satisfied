import { RSComment } from '../parseComment'
import { RSCommentWithFile } from './types'


export function ppRSCommentLoc({
  startLine,
  startCol,
  file
}: RSCommentWithFile) {
  return `${file}:${startLine}:${startCol}`
}

export function ppRSComment({ type, param = '', id }: RSComment) {
  return `${type.toUpperCase()}${param}: ${id}`
}
