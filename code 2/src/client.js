import net from "node:net";

process.stdin.pipe(net.connect(3000)).pipe(process.stdout);
