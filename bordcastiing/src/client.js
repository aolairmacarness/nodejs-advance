import net from "node:net";
import { Writable } from "node:stream";

function log(msg) {
  process.stdout.write(`\r${msg}`);
}

const output = Writable({
  write(chunk, enc, callback) {
    const data = JSON.parse(chunk);
    const id = data.id;
    const message = data.message;

    if (message) {
      log(`${id} says: ${message}`);
    } else {
      log(`Your ID: ${id}\n`);
    }

    log("Type something... ");
    callback(null, chunk);
  },
});

process.stdin.pipe(net.connect(3000)).pipe(output);
