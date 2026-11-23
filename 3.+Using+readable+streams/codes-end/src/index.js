import fs from "fs";

const readStream = fs.createReadStream("./the-universe.mp4");

readStream.on("data", (chunk) => {
  console.log("size of chunk: \n", chunk.length);
});

readStream.on("end", () => {
  console.log("stream ended.");
});

readStream.on("error", (error) => {
  console.error(error);
});

readStream.pause();

process.stdin.on("data", (chunk) => {
  if (chunk.toString().trim() === "end") {
    readStream.resume();
  }
  readStream.read();
});
