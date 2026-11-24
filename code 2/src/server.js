import net from "node:net";
import { randomUUID } from "node:crypto";
const users = new Map();

const server = net.createServer((socket) => {
  socket.pipe(socket);
});

server.listen(3000, () => console.log("Server is listening on 3000"));

server.on("connection", (socket) => {
  socket.id = randomUUID();
  console.log(`A new connection with Id ${socket.id}`);
  users.set(socket.id, socket);
  socket.write(
    JSON.stringify({
      id: socket.id.slice(0, 5),
    })
  );

  socket.on("close", () => {
    console.log(`Connection ${socket.id} disconnected`);
    users.delete(socket.id);
  });
});
