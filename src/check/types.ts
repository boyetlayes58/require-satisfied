import { RSComment } from '../parseComment'


export interface RSCommentWithFile extends RSComment {
  file: string
}

export interface Issue {
  type: string
  msg: string
  details?: string[]
  /**
   * The first comment will be used to anchor the warning/error
   */
  comments: RSCommentWithFile[]
}
