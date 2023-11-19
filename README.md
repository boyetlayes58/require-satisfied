# require-satisfied

A package that helps developers to track assumptions that are manually managed
or cannot be verified with static or runtime assertion.

## Usages and Examples

### Same-File Require-Satisfied

```TypeScript
// ...
function doHighComplexityWork() {
  // ...
  return {
    // REQUIRE: when `status` is 1, the caller must do something
    status: 1
    // ...
  }
}

function main() {
  // ...
  const { status } = doHighComplexityWork()
  if (status === 1) {
    // SATISFIED: when `status` is 1, the caller must do something
    // ...
  }
}
```

### Require-Satisfied in Block Comment

```TypeScript
// ...
function doHighComplexityWork() {
  // ...
  return {
    /*
    REQUIRE: when `status` is 2,
    the caller must do something

    Multiline is only supported in block comments
    Use a blank line to indicate the end of the REQUIRE/SATISFIED
    */
    status: 2
    // ...
  }
}

function main() {
  // ...
  const { status } = doHighComplexityWork()
  if (status === 2) {
    // SATISFIED: when `status` is 2, the caller must do something
    // ...
  }
}
```

### Cross-File Require-Satisfied

```TypeScript
// File: a.ts
// ...
function doHighComplexityWork() {
  // ...
  return {
    /*
    REQUIRE(extern): when `status` is 3,
    the caller must do something
    */
    status: 3
    // ...
  }
}
```

```Python
# File: b.py
def main():
  '''
  REQUIRE: block comment also supported

  SATISFIED: block comment also supported
  '''
  # ...
  status = grpc.doHighComplexityWork().status
  if status == 3:
    # SATISFIED(extern): when `status` is 3, the caller must do something
    # ...
```

## CLI Usage

### Script: `check`

```bash
npm run check -- \
  --include "some/glob/**/*" \
  --include "another/glob/**/*" \
  --exclude "**/*.bad" \
  --exclude "**/*.so.bad"
```

If no warning or error is found, the script exits with code `0`, and the
console output looks like:

```
16 file(s) scanned
0 warnings
0 errors
```

If there is any warning or error found, the console output looks like:

```
ERROR: Missing corresponding SATISFIED for REQUIRE(extern): id 100 at
  /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:6:20

ERROR: Missing corresponding REQUIRE for SATISFIED(extern): id 101 at
  /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:7:22

WARN: Duplicated SATISFIED: id 001 at
  /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:9:34
  First defined at /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:5:37

WARN: Duplicated REQUIRE(extern): id 100 at
  /home/foo/nodejs/require-satisfied/samples/project/sample.js:6:20
  First defined at /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:6:20

WARN: Duplicated SATISFIED(extern): id 101 at
  /home/foo/nodejs/require-satisfied/samples/project/sample.js:7:22
  First defined at /home/foo/nodejs/require-satisfied/samples/project/sample.dup.js:7:22

ERROR: Missing corresponding SATISFIED for REQUIRE(extern): qwerty at
  /home/foo/nodejs/require-satisfied/samples/sample.js:15:22

3 file(s) scanned
3 warning(s)
3 error(s)
```

The exit status, however, will only be `1` if there is at least one error.

*Try playing with README and samples:*

* `npm run check -- -i README.md`
* `npm run check -- -i "src/**/*"`
* `npm run check -- -i "samples/project/**/*"`
* `npm run check -- -i "samples/project/**/*" -x "**/*.dup.js"`
* `npm run check -- -i "samples/**/*" -x "**/*.py"` (the one produced the
  output above)

### Bin: `require-satisfied-check`, `rs-check`

Alias of [script `check`](#script-check).
