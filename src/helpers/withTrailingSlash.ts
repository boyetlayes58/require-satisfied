import woTrailingSlash from './woTrailingSlash'


export default function withTrailingSlash(dir: string, sep: string) {
  return woTrailingSlash(dir) + sep
}
