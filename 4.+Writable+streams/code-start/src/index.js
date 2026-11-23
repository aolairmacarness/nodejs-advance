import { createReadStream } from "fs";

const readStream = createReadStream("./the-universe.mp4");

readStream.on("data", (chunk) => {
  console.log("size of chunk: \n", chunk.length);
});

readStream.on("error", (error) => {
  console.error(error);
});

readStream.on("end", () => {
  console.log("stream ended.");
});
