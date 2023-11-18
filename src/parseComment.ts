import { Comment } from './CommentParser'


const lineRequireRegex = /\bREQUIRE(?<param>\(\w+\))?:(?<id>[\s\S]*)$/
const lineSatisfiedRegex = /\bSATISFIED(?<param>\(\w+\))?:(?<id>[\s\S]*)$/
const requireStartRegex = /\bREQUIRE(?<param>\(\w+\))?:/
const satisfiedStartRegex = /\bSATISFIED(?<param>\(\w+\))?:/

function isBlankBlockComment(line: string) {
  return !/\w/.test(line)
}

export type RSCommentType = 'require' | 'satisfied'

export interface RSComment {
  type: RSCommentType
  param?: string
  id: string
  startLine: number
  startCol: number
  endLine: number
  endCol: number
}

class BlockParser {
  protected startedMark?: RSCommentType
  protected startedParam?: string
  protected startLine = 0
  protected startCol = 0
  protected lastLineCol = 0
  protected idBuffer: string[] = []
  protected buffer: RSComment[] = []
  public constructor(
    public comment: Comment,
    public lineTransform: (line: string) => string
  ) {}

  public *parse() {
    const { comment: { comment, startLine } } = this
    let ln = startLine - 1
    for (const line of comment) {
      ln++
      if (isBlankBlockComment(line)) {
        if (this.startedMark) this.commitBlock(ln)
        yield *this.buffer
        this.buffer = []
        continue
      }
      let match = RegExp(requireStartRegex).exec(line)
      if (match) {
        this.onStart(ln, line, 'require', match)
        yield *this.buffer
        this.buffer = []
        continue
      }
      match = RegExp(satisfiedStartRegex).exec(line)
      if (match) {
        this.onStart(ln, line, 'satisfied', match)
        yield *this.buffer
        this.buffer = []
        continue
      }
      this.onNone(line)
      yield *this.buffer
      this.buffer = []
    }
    this.commitBlock(++ln)
    yield *this.buffer
    this.buffer = []
  }

  protected onStart(
    ln: number,
    line: string,
    type: RSCommentType,
    match: RegExpMatchArray
  ) {
    const { comment } = this
    this.commitBlock(ln)
    this.startedMark = type
    this.startedParam = match.groups!.param
    this.startLine = ln
    const startColIndex = match.index! + match[0].length
    this.startCol = startColIndex + 1
    this.lastLineCol = match.input!.length
    if (ln === comment.startLine) {
      this.startCol += comment.startCol - 1
      this.lastLineCol += comment.startCol - 1
    }
    const tail = line.substring(startColIndex)
    this.idBuffer = [ this.lineTransform(tail) ]
  }

  protected commitBlock(ln: number) {
    const {
      startedMark,
      startedParam,
      idBuffer,
      startLine, startCol,
      lastLineCol,
      buffer,
    } = this
    if (!startedMark) return
    buffer.push({
      type: startedMark,
      param: startedParam,
      id: idBuffer.join(' '),
      startLine,
      startCol,
      endLine: ln - 1,
      endCol: lastLineCol
    })
    this.startedMark = undefined
    this.startedParam = undefined
    this.startLine = 0
    this.startCol = 0
    this.lastLineCol = 0
    this.idBuffer = []
  }

  protected onNone(line: string) {
    if (!this.startedMark) return
    this.idBuffer.push(this.lineTransform(line))
    this.lastLineCol = line.length
  }
}

const prettyLineRegex = /^\**([\s\S]*)$/
export function defaultLineTransform(line: string) {
  return RegExp(prettyLineRegex).exec(line.trim())![1].trim()
}

export default function *parseComment(
  com: Comment,
  lineTransform: (line: string) => string = defaultLineTransform
) {
  const { type, comment, ...pos } = com
  if (type === 'line') {
    let match = RegExp(lineRequireRegex).exec(comment[0])
    if (match) {
      const rawId = match.groups!.id
      const startCol = pos.startCol +
        match.index + match[0].length - rawId.length
      yield {
        type: 'require',
        ...pos,
        startCol,
        param: match.groups!.param,
        id: lineTransform(rawId)
      } as RSComment
      return
    }
    match = RegExp(lineSatisfiedRegex).exec(comment[0])
    if (match) {
      const rawId = match.groups!.id
      const startCol = pos.startCol +
        match.index + match[0].length - rawId.length
      yield {
        type: 'satisfied',
        ...pos,
        startCol,
        param: match.groups!.param,
        id: lineTransform(rawId)
      } as RSComment
      return
    }
    return
  }
  const parser = new BlockParser(com, lineTransform)
  yield *parser.parse()
}
