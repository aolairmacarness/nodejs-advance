# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Example code from a Node.js streams course. Most top-level directories are their own small npm project with their own `package.json`. They all use the same template (`"name": "advanced-nodejs"`, `"type": "module"`, so ESM `import` syntax), and none of them has a build, lint or test setup. The only `npm test` script is the default placeholder that exits with an error.

The numbered directories (`2.+Readable+streams`, `4.+Writable+streams`, …) follow the course lessons and hold `code-start` / `code-end` (or `codes-start` / `codes-end`) pairs. A `-start` folder is the starting point of a lesson and can be incomplete or broken on purpose. For example, `2.+Readable+streams/codes-start` uses `ArrayStream` before the class is declared. Don't "fix" a `-start` folder unless asked. The un-numbered directories are standalone topic examples. Some names are misspelled (`bordcastiing`, `tranform_webstream`), and `code 2` has a space in it. Quote the paths and don't rename the folders.

Some directories have only a `src/` folder and no `package.json`: `netserver`, `code 2`, `bordcastiing`, `customwritable`, `readable_writeable`, `convert_to_webstream`, `tranform_webstream`. They import only `node:` built-ins, so you run them with `node` directly and don't need `npm install`. Their `import` syntax still works because Node ≥ 20.19 / 22.12 detects ES modules automatically, and it was verified on Node 20.20. On an older Node, add `"type": "module"` or rename the file to `.mjs`.

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

The TCP examples (`netserver`, `code 2`, `customwritable`, `bordcastiing`) have a `server.js` and a `client.js`. Run the server, then one or more clients in other terminals: `node "code 2/src/server.js"` / `node "code 2/src/client.js"`. They also use port 3000, so they can't run alongside the HTTP examples.

The SQLite examples (`stream_data`, `stream_operator`) open `./data/db` relative to the current directory, so run them from the project root with `npm install && npm start`. `npm run init` seeds 100 fake users with `@faker-js/faker`. `init.js` uses `CREATE TABLE` without `IF NOT EXISTS`, so it fails if the table already exists. It also needs the `data/` folder to exist already, and `stream_operator/` has no `data/` folder or lockfile committed. `stream_operator` writes NDJSON to `./data/output.json`. `sqlite3` is a native addon, so `npm install` may compile it.

## How the examples build on each other

The examples move through one idea in steps. When editing one, keep it consistent with the lesson it belongs to:
1. Custom `Readable` (`_read` / `push(null)`), then flowing vs paused mode (`pause`/`resume`/`read`).
2. A manual `data` → `write` copy (`4`), then the same copy with backpressure handling: check the `write()` return value, `pause()`, and `resume()` on `drain` (`5`).
3. `Duplex` (a `Throttle` that delays the write callback) and `PassThrough` for reporting progress; `Transform` with `_transform` / `_flush`.
4. HTTP: piping the whole file (`9`), then `Range` header → `206` partial content (`range_request`), then `uploadstream`, which combines range streaming at `/video` with a multipart upload form served at `/` and accepted by `POST`.
5. TCP with `node:net`, where `netserver` → `code 2` → `customwritable` → `bordcastiing` are successive versions of one chat app: an echo server (`socket.pipe(socket)`), then giving each connection a `randomUUID` id kept in a `users` Map, then a client that parses JSON messages with a custom `Writable`, then a server that pipes each socket into a `Writable` that broadcasts to every other socket. The wire format is a JSON string `{id, message?}` with no framing, so a message without `message` is the server's welcome message giving the client its id.
6. WHATWG web streams (`node:stream/web`): `readable_writeable` (`ReadableStream` → `pipeTo` → `WritableStream`), then `tranform_webstream` (adds a `TransformStream` with `pipeThrough`), then `convert_to_webstream` (`Readable.toWeb(Readable.from(asyncGenerator))` to bridge Node streams to web streams). The `setInterval` sources never end, so these run until you press Ctrl-C.
7. `stream/promises` `pipeline` over async generator functions (`stream/src/index.js`). Each stage is `async function*(source)` that iterates `for await` over the stage before it. `stream_data` and `stream_operator` each keep this version as `src/before.js`, so `before.js` is the previous lesson's code rather than a broken starting point. `stream_operator/src/before.js` adds `AbortController` cancellation.
8. Streaming from a database: an async generator that pages through SQLite and is wrapped in `Readable.from()` (`stream_data`), then the same with stream operators `.filter()` / `.map()` piped into a file (`stream_operator`).

## Known issues in the end-state code

- `uploadstream/src/index.js` doesn't run as written: `import {multiparty}` should be a default import, `'./${part.filename}'` uses quotes instead of backticks, and `req` is also piped to `res` and to `test-upload.file`, which conflicts with the multiparty parser.
- The range examples send `Accept-Range` (the correct header is `Accept-Ranges`) and don't validate the range bounds.
- `stream_data/src/index.js` uses keyset pagination (`WHERE id > ?`). The committed `stream_data/data/db` has an `id INTEGER PRIMARY KEY` column, but `init.js` creates `users (name, age)` with no `id`, so if you re-seed with `npm run init`, `index.js` fails with "no such column: id". `stream_operator` uses `LIMIT/OFFSET` and works with either schema.
- `stream_operator/src/before.js` calls `myReadable()` without the `AbortController` it expects (`ac.signal` throws). It also passes a callback to the promise-based `setTimeout` from `node:timers/promises`, so the abort never fires.
- `stream/package.json`'s `dev`/`seed` scripts point at `src/db-example/…`, which doesn't exist. Run `node src/index.js` instead.
- In `customwritable`, the server still echoes raw input (`socket.pipe(socket)`), so the JSON-parsing client throws on the first line typed. The broadcast server in `bordcastiing` is what makes that client work. Even there, messages have no delimiter, so two JSON objects arriving in one chunk break `JSON.parse`.
- The top-level `data/` directory is empty and untracked, and nothing uses it.
