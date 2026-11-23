import { createReadStream, createWriteStream } from "fs";

const readStream = createReadStream("./the-universe.mp4");
const writeStream = createWriteStream("./copy.mp4", {
  //highWaterMark: 16292225,
});

readStream.on("data", (chunk) => {
  const res = writeStream.write(chunk);
  if (!res) {
    //backpressure
    console.log("backpressure");
    readStream.pause();
  }
});

readStream.on("error", (error) => {
  console.error(error);
});

readStream.on("end", () => {
  writeStream.end();
});

writeStream.on("drain", () => {
  console.log("drained");
  readStream.resume();
});

writeStream.on("close", () => {
  process.stdout.write("file copied.\n");
});
