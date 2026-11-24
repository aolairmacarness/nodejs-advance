import net from "node:net";
import { randomUUID } from "node:crypto";
const users = new Map();

const server = net.createServer((socket) => {
  socket.pipe(socket);
});

server.listen(3000, () => console.log("server is running at 3000"));

server.on("connection", (socket) => {
  socket.id = randomUUID();
  console.log("new connection!", socket.id);
  users.set(socket.id, socket);
  socket.write(
    JSON.stringify({
      id: socket.id.slice(0, 4),
    })
  );

  socket.on("close", () => {
    console.log("disconnected!", socket.id);
    users.delete(socket.id);
  });
});
