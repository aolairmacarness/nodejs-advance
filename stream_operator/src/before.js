import { pipeline } from "node:stream/promises";
import { setTimeout } from "node:timers/promises";
import {Readable} from "node:stream";
async function* myReadable(ac) {
  yield Buffer.from("I am ");
  if (ac.signal.aborted) return;
   await setTimeout(150, { signal: ac.signal });
  yield Buffer.from("Codelicks.");
}

async function* myTransform(stream) {
  for await (const chunk of stream) {
    yield chunk.toString().toUpperCase();
  }
}

async function* myDuplex(stream) {
  let bytes = 0;
  const finalMessage = [];
  for await (const chunk of stream) {
    console.log("duplex: ", chunk);
    bytes += chunk.length;
    finalMessage.push(chunk);
  }

  yield `The final message is: ${finalMessage.join()}`;
  yield `Total bytes: ${bytes}`;
}

async function* myWritable(stream) {
  for await (const chunk of stream) {
    console.log("writable: ", chunk);
  }
}

const abortController = new AbortController();
setTimeout(() => abortController.abort(), 1000);
await pipeline(Readable.from(myReadable()), myTransform, myDuplex, myWritable, {
  signal: abortController.signal,
});
