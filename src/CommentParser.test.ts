import { test } from 'node:test'
import CommentParser, { Comment } from './CommentParser'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert'
import { pythonFormat } from './patterns'


test('JS comments are extracted correctly', async () => {
  const src = await readFile(path.join(__dirname, '../samples/sample.js'))
  const parser = new CommentParser(src.toString())
  const res = [ ...parser.parse() ]
  assert.deepStrictEqual(res, [ {
    type: 'line',
    startLine: 1,
    startCol: 3,
    endLine: 1,
    endCol: 15,
    comment: [ ' REQUIRE: foo' ]
  }, {
    type: 'block',
    startLine: 3,
    startCol: 23,
    endLine: 3,
    endCol: 55,
    comment: [ '  ** * * * * *a block comment    ' ]
  }, {
    type: 'block',
    startLine: 3,
    startCol: 81,
    endLine: 3,
    endCol: 88,
    comment: [ '  block ' ]
  }, {
    type: 'line',
    startLine: 3,
    startCol: 113,
    endLine: 3,
    endCol: 117,
    comment: [ ' yeah' ]
  }, {
    type: 'block',
    startLine: 5,
    startCol: 3,
    endLine: 12,
    endCol: 1,
    comment: [
      '*',
      ' * REQUIRE: hell yeah',
      ' * yes yes',
      ' * foo',
      ' * bar',
      ' *',
      ' * Hail',
      ' '
    ]
  }, {
    type: 'block',
    startLine: 14,
    startCol: 23,
    endLine: 14,
    endCol: 54,
    comment: [ '* foo bar SATISFIED: foo        ' ]
  }, {
    type: 'line',
    startLine: 14,
    startCol: 80,
    endLine: 14,
    endCol: 116,
    comment: [ ' SATISFIED: hell yeah yes yes foo bar' ]
  }, {
    type: 'line',
    startLine: 15,
    startCol: 5,
    endLine: 15,
    endCol: 28,
    comment: [ ' REQUIRE(extern): qwerty' ]
  } ] as Comment[])
})

test('Python comments are extracted correctly', async () => {
  const src = await readFile(path.join(__dirname, '../samples/sample.py'))
  const parser = new CommentParser(src.toString(), pythonFormat)
  const res = [ ...parser.parse() ]
  assert.deepStrictEqual(res, [ {
    type: 'line',
    startLine: 1,
    startCol: 2,
    endLine: 1,
    endCol: 10,
    comment: [ ' Fooooooo' ]
  }, {
    type: 'line',
    startLine: 2,
    startCol: 2,
    endLine: 2,
    endCol: 11,
    comment: [ ' Barrrrrrr' ]
  }, {
    type: 'block',
    startLine: 3,
    startCol: 4,
    endLine: 4,
    endCol: 0,
    comment: [ 'Hell yeah', '' ]
  }, {
    type: 'block',
    startLine: 6,
    startCol: 8,
    endLine: 11,
    endCol: 4,
    comment: [
      '',
      '    REQUIRE: foo',
      '    bar',
      '',
      '    Nope',
      '    '
    ]
  }, {
    type: 'line',
    startLine: 13,
    startCol: 6,
    endLine: 13,
    endCol: 24,
    comment: [ ' SATISFIED: foo bar' ]
  }, {
    type: 'block',
    startLine: 15,
    startCol: 8,
    endLine: 15,
    endCol: 23,
    comment: [ 'REQUIRE: yes yes' ]
  }, {
    type: 'block',
    startLine: 16,
    startCol: 8,
    endLine: 16,
    endCol: 25,
    comment: [ 'SATISFIED: yes yes' ]
  }, {
    type: 'line',
    startLine: 18,
    startCol: 6,
    endLine: 18,
    endCol: 31,
    comment: [ ' SATISFIED(extern): qwerty' ]
  } ] as Comment[])
})
