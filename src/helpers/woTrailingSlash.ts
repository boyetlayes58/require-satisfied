import path from 'path'


export default function woTrailingSlash(dir: string) {
  return (dir.endsWith(path.win32.sep) || dir.endsWith(path.posix.sep))
    ? dir.substring(0, dir.length - 1)
    : dir
}
