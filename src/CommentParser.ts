import assert from 'assert'


export interface CommentMarks {
  line?: RegExp
  block?: [ RegExp, RegExp ]
}

export const defaultCommentMarks: CommentMarks = {
  line: /\/\//g,
  block: [ /\/\*/g, /\*\//g ]
}

function *matchMarks(line: string, regexp: RegExp, type: CommentMarkType) {
  for (const match of line.matchAll(regexp)) {
    yield { type, match }
  }
}

export enum CommentMarkType {
  Line = 'line',
  BlockStart = 'blockStart',
  BlockEnd = 'blockEnd'
}

export interface Comment {
  type: 'line' | 'block'
  startLine: number
  startCol: number
  endLine: number
  endCol: number
  comment: string[]
}

export default class CommentParser {
  protected blockStartLine = 0
  protected blockStartCol = 0
  protected blockBuffer: string[] = []
  protected buffer: Comment[] = []
  public constructor(
    public src: string,
    public marks: CommentMarks = defaultCommentMarks
  ) {
    assert(!!marks.line || !!marks.block,
      'At least one of line comment mark pattern or ' +
      'block comment marks pattern should be provided')
  }

  public *parse() {
    const { line, block } = this.marks
    let ln = 0
    this.blockStartLine = 0
    this.blockStartCol = 0
    this.blockBuffer = []
    for (const _line of this.src.split(/\r?\n/)) {
      ln++
      const matchLine = line
        ? [ ...matchMarks(_line, line, CommentMarkType.Line) ]
        : []
      const matchBlockStart = block
        ? [ ...matchMarks(_line, block[0], CommentMarkType.BlockStart) ]
        : []
      const matchBlockEnd = block
        ? [ ...matchMarks(_line, block[1], CommentMarkType.BlockEnd) ]
        : []
      const marks = matchLine.concat(matchBlockStart, matchBlockEnd)
        .sort((a, b) => a.match.index! - b.match.index!)
      if (!marks.length) {
        this.onNone(_line)
        continue
      }
      for (const { type, match } of marks) {
        switch (type) {
          case CommentMarkType.Line: {
            this.onLine(ln, _line, match)
            break
          }
          case CommentMarkType.BlockStart: {
            this.onBlockStart(ln, _line, match)
            break
          }
          case CommentMarkType.BlockEnd: {
            this.onBlockEnd(ln, _line, match)
            break
          }
        }
      }
      yield *this.buffer
      this.buffer = []
    }
  }

  protected onLine(ln: number, line: string, match: RegExpMatchArray) {
    if (this.blockStartLine) return
    const startColIndex = match.index! + match[0].length
    this.buffer.push({
      type: 'line',
      startLine: ln,
      startCol: startColIndex + 1,
      endLine: ln,
      endCol: line.length,
      comment: [ line.substring(startColIndex) ]
    })
  }

  protected onBlockStart(ln: number, line: string, match: RegExpMatchArray) {
    if (this.blockStartLine) return
    this.blockStartLine = ln
    const startColIndex = match.index! + match[0].length
    this.blockStartCol = startColIndex + 1
    const { blockBuffer } = this
    assert.strictEqual(blockBuffer.length, 0)
    /* REQUIRE: tail of the line is handled when the block comment
    ends at the same line */
    blockBuffer.push(line.substring(startColIndex))
  }

  protected onBlockEnd(ln: number, line: string, match: RegExpMatchArray) {
    const { blockBuffer, blockStartLine, blockStartCol, buffer } = this
    const eob = match.index!
    if (ln === blockStartLine) {
      if (match.index! + match[0].length + 1 === blockStartCol) {
        // Block end mark looks the same with block start mark, ignore
        return
      }
      // Same line
      /* SATISFIED: tail of the line is handled when the block comment
      ends at the same line */
      assert.strictEqual(blockBuffer.length, 1)
      blockBuffer[0] = line.substring(blockStartCol - 1, eob)
    } else {
      blockBuffer.push(line.substring(0, eob))
    }
    buffer.push({
      type: 'block',
      startLine: blockStartLine,
      startCol: blockStartCol,
      endLine: ln,
      endCol: eob,
      comment: blockBuffer
    })
    this.blockBuffer = []
    this.blockStartLine = 0
    this.blockStartCol = 0
  }

  protected onNone(line: string) {
    if (this.blockStartLine) {
      this.blockBuffer.push(line)
    }
  }
}
