// import sqlite3 from "sqlite3";
// import { promisify } from "node:util";
// import { Readable } from "node:stream";

// const connection = sqlite3.verbose();
// const db = new connection.Database("./data/db");
// const promisifiedSerialize = promisify(db.serialize.bind(db));
// const promisifiedRun = promisify(db.run.bind(db));
// const promisifiedAll = promisify(db.all.bind(db));

// await promisifiedSerialize();

// async function* findAllStream() {
//   let pageLimit = 10;
//   let skip = 0;
//   while (true) {
//     const data = await promisifiedAll(
//       `SELECT * FROM users LIMIT ${pageLimit} OFFSET ${skip}`
//     );
//     skip += pageLimit;
//     if (!data.length) break;
//     for (const item of data) yield item;
//   }
// }

// const stream = Readable.from(findAllStream());

// stream.forEach((item) => console.log(item));
import sqlite3 from "sqlite3";
import { promisify } from "node:util";
import { Readable } from "node:stream";

const db = new (sqlite3.verbose().Database)("./data/db");
const all = promisify(db.all.bind(db));
const close = promisify(db.close.bind(db));

async function* findAllStream(pageSize = 10) {
  let lastId = 0;
  while (true) {
    const rows = await all(
      "SELECT * FROM users WHERE id > ? ORDER BY id LIMIT ?",
      [lastId, pageSize]
    );
    for (const row of rows) yield row;
    if (rows.length < pageSize) break;      // last page, so skip the extra query
    lastId = rows.at(-1).id;
  }
}

try {
  await Readable.from(findAllStream()).forEach((user) => console.log(user));
} catch (err) {
  console.error("Stream failed:", err);
} finally {
  await close();
}