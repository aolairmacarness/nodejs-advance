import { ReadableStream, WritableStream } from "node:stream/web";
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

readable.pipeTo(writable);
