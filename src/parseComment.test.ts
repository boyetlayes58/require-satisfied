import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import CommentParser from './CommentParser'
import assert from 'node:assert'
import parseComment, { RSComment } from './parseComment'
import { pythonFormat } from './patterns'


test('"REQUIRE" and "SATISFIED" are parsed correctly from JS', async () => {
  const src = await readFile(path.join(__dirname, '../samples/sample.js'))
  const parser = new CommentParser(src.toString())
  const comments = [ ...parser.parse() ]
  const parseRes = comments.map(com => [ ...parseComment(com) ])
  assert.deepStrictEqual(parseRes, [
    [ {
      type: 'require',
      param: undefined,
      id: 'foo',
      startLine: 1,
      startCol: 12,
      endLine: 1,
      endCol: 15
    } ],
    [],
    [],
    [],
    [ {
      type: 'require',
      param: undefined,
      id: 'hell yeah yes yes foo bar',
      startLine: 6,
      startCol: 12,
      endLine: 9,
      endCol: 6
    } ],
    [ {
      type: 'satisfied',
      param: undefined,
      id: 'foo',
      startLine: 14,
      startCol: 43,
      endLine: 14,
      endCol: 54
    } ],
    [ {
      type: 'satisfied',
      param: undefined,
      id: 'hell yeah yes yes foo bar',
      startLine: 14,
      startCol: 91,
      endLine: 14,
      endCol: 116
    } ],
    [ {
      type: 'require',
      param: '(extern)',
      id: 'qwerty',
      startLine: 15,
      startCol: 22,
      endLine: 15,
      endCol: 28
    } ]
  ] as RSComment[][])
})

test('"REQUIRE" and "SATISFIED" are parsed correctly from Python', async () => {
  const src = await readFile(path.join(__dirname, '../samples/sample.py'))
  const parser = new CommentParser(src.toString(), pythonFormat)
  const comments = [ ...parser.parse() ]
  const parseRes = comments.map(com => [ ...parseComment(com) ])
  assert.deepStrictEqual(parseRes, [
    [],
    [],
    [],
    [ {
      type: 'require',
      param: undefined,
      id: 'foo bar',
      startLine: 7,
      startCol: 13,
      endLine: 8,
      endCol: 7
    } ],
    [ {
      type: 'satisfied',
      param: undefined,
      id: 'foo bar',
      startLine: 13,
      startCol: 17,
      endLine: 13,
      endCol: 24
    } ],
    [ {
      type: 'require',
      param: undefined,
      id: 'yes yes',
      startLine: 15,
      startCol: 16,
      endLine: 15,
      endCol: 23
    } ],
    [ {
      type: 'satisfied',
      param: undefined,
      id: 'yes yes',
      startLine: 16,
      startCol: 18,
      endLine: 16,
      endCol: 25
    } ],
    [ {
      type: 'satisfied',
      param: '(extern)',
      id: 'qwerty',
      startLine: 18,
      startCol: 25,
      endLine: 18,
      endCol: 31
    } ]
  ] as RSComment[][])
})
