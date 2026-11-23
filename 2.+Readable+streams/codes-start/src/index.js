import { Readable } from "stream";
const rivers = [
  "Amazon",
  "Nile",
  "Yangtze",
  "Mississippi",
  "Ganges",
  "Danube",
  "Mekong",
];

const riverStream  = new ArrayStream(rivers);
class ArrayStream extends Readable {
  constructor(array) {
    super();
    this.array = array;
    this.index = 0;
  }
  _read() {
    if (this.index < this.array.length) {
      this.push(this.array[this.index++]);
    } else {
      this.push(null);
    }
  }
}
riverStream.on("data", (chunk) => {console.log(chunk);})
riverStream.on("end", () => {console.log("stream ended.");})