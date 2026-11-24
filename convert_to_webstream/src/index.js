import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "node:stream/web";
import { setInterval, setTimeout } from "node:timers/promises";
import { Readable } from "node:stream";

async function* myReadable() {
  yield Buffer.from("first msg");
  await setTimeout(300);
  yield Buffer.from("last msg");
}

const readable = Readable.toWeb(Readable.from(myReadable()));

// const readable = new ReadableStream({
//   async start(ctrl) {
//     let counter = 0;
//     for await (const i of setInterval(300)) {
//       ctrl.enqueue(`Message # ${counter}`);
//       counter++;
//     }
//   },
// });

const transform = new TransformStream({
  transform(chunk, ctrl) {
    const newChunk = `${chunk} 🤩`;
    ctrl.enqueue(newChunk);
  },
});

const writable = new WritableStream({
  write(chunk) {
    console.log(`chunk: ${chunk}`);
  },
});

//readable -> .pipeThrough -> .pipeTo

readable.pipeThrough(transform).pipeTo(writable);
