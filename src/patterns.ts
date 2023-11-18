import { CommentMarks, defaultCommentMarks } from './CommentParser'


export const defaultFormat = defaultCommentMarks

export const pythonFormat: CommentMarks = {
  line: /#/g,
  block: [ /'''|"""/g, /'''|"""/g ]
}

export const bashFormat: CommentMarks = {
  line: /#/g
}

export const batchFormat: CommentMarks = {
  line: /(^::)|(&\s*::)|REM/g
}

export const anyFormat: CommentMarks = {
  line: /\/\/|#|(^::)|(&\s*::)|REM/g,
  block: [
    /\/\*|'''|"""/g,
    /\*\/|'''|"""/g
  ]
}

export default {
  C: { ext: '.c', format: defaultFormat },
  'C++': { ext: [ '.cpp', '.cc' ], format: defaultFormat },
  'C/C++': { ext: [ '.c', '.cpp', '.cc' ], format: defaultFormat },
  JavaScript: { ext: [ '.js', '.mjs', '.cjs' ], format: defaultFormat },
  TypeScript: { ext: '.ts', format: defaultFormat },
  Java: { ext: '.java', format: defaultFormat },
  Kotlin: { ext: '.kt', format: defaultFormat },
  Python: { ext: '.py', format: pythonFormat },
  Bash: { ext: '.sh', format: bashFormat },
  Shell: { ext: '.sh', format: bashFormat },
  Batch: { ext: '.bat', format: batchFormat },
  Any: { ext: '', format: anyFormat }
}
