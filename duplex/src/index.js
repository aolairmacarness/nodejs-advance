import { Duplex, PassThrough } from "stream";
import { createReadStream, createWriteStream } from "fs";

const readStream = createReadStream("./the-universe.mp4");
const writeStream = createWriteStream("./copy.mp4");

class Throttle extends Duplex {
  constructor(ms) {
    super();
    this.delay = ms;
  }
  _write(chunk, encoding, callback) {
    this.push(chunk);
    setTimeout(callback, this.delay);
  }

  _read() {}

  _final() {
    this.push(null);
  }
}

const report = new PassThrough();
const throttle = new Throttle(20);

var size = 0;
report.on("data", (chunk) => {
  size += chunk.length;
  console.log("bytes of data : ", size);
});

readStream.pipe(throttle).pipe(report).pipe(writeStream);
