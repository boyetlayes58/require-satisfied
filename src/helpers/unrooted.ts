import path from 'path'


export default function unrooted(name: string) {
  return (name.startsWith(path.win32.sep) || name.startsWith(path.posix.sep))
    ? name.substring(1)
    : name
}
