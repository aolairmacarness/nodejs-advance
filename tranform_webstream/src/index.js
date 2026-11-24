import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "node:stream/web";
import { setInterval } from "node:timers/promises";

const readable = new ReadableStream({
  async start(controller) {
    let counter = 0;
    for await (const i of setInterval(300)) {
      controller.enqueue(`Messages #${counter}`);

      counter++;
    }
  },
});

const writable = new WritableStream({
  write(chunk) {
    console.log(`chunk: ${chunk}`);
  },
});

const transform = new TransformStream({
  transform(chunk, controller) {
    const newChunk = `${chunk} 😊`;
    controller.enqueue(newChunk);
  },
});

readable.pipeThrough(transform).pipeTo(writable);
