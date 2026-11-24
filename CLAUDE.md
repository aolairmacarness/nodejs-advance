# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Example code from a Node.js streams course. Every top-level directory is its own small npm project with its own `package.json` and `package-lock.json`. They all use the same template (`"name": "advanced-nodejs"`, `"type": "module"`, so ESM `import` syntax), and none of them has a build, lint or test setup. The only `npm test` script is the default placeholder that exits with an error.

The numbered directories (`2.+Readable+streams`, `4.+Writable+streams`, …) follow the course lessons and hold `code-start` / `code-end` (or `codes-start` / `codes-end`) pairs. A `-start` folder is the starting point of a lesson and can be incomplete or broken on purpose. For example, `2.+Readable+streams/codes-start` uses `ArrayStream` before the class is declared. Don't "fix" a `-start` folder unless asked. The un-numbered directories (`buffer_stream`, `duplex`, `transform`, `range_request`, `uploadstream`) are standalone topic examples.

## Running an example

```bash
cd <project> && npm install      # only log-update (and multiparty in uploadstream) are dependencies
cd src && node index.js          # most examples
```

The scripts open their media with paths relative to the current directory (`./the-universe.mp4`, `./copy.mp4`). Run them from the directory that holds `the-universe.mp4`:
- Most projects keep it in `src/`, so run `cd src && node index.js`.
- `duplex/` keeps it at the project root, so run `cd duplex && node src/index.js`.
- `buffer_stream/` has several entry points: `buffer-transfer.js` (`fs.readFile`, the whole file in memory) and `stream-transfer.js` (`createReadStream().pipe(res)`). They are a side-by-side comparison. `explainer.js` is only a comment.

The HTTP examples (`9.+Streaming+to+the+browser`, `range_request`, `uploadstream`, `buffer_stream`) all listen on port 3000, so only one can run at a time. `transform/` reads stdin (`echo hi | node src/index.js`). `3.+Using+readable+streams/codes-end` waits for typed input on stdin.

`.mp4` files are committed to git. Scripts write `copy.mp4` / upload files next to themselves.

## How the examples build on each other

The examples move through one idea in steps. When editing one, keep it consistent with the lesson it belongs to:
1. Custom `Readable` (`_read` / `push(null)`), then flowing vs paused mode (`pause`/`resume`/`read`).
2. A manual `data` → `write` copy (`4`), then the same copy with backpressure handling: check the `write()` return value, `pause()`, and `resume()` on `drain` (`5`).
3. `Duplex` (a `Throttle` that delays the write callback) and `PassThrough` for reporting progress; `Transform` with `_transform` / `_flush`.
4. HTTP: piping the whole file (`9`), then `Range` header → `206` partial content (`range_request`), then `uploadstream`, which combines range streaming at `/video` with a multipart upload form served at `/` and accepted by `POST`.

## Known issues in the end-state code

- `uploadstream/src/index.js` doesn't run as written: `import {multiparty}` should be a default import, `'./${part.filename}'` uses quotes instead of backticks, and `req` is also piped to `res` and to `test-upload.file`, which conflicts with the multiparty parser.
- The range examples send `Accept-Range` (the correct header is `Accept-Ranges`) and don't validate the range bounds.
