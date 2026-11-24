import net from "node:net";
import { Writable } from "node:stream";
import { randomUUID } from "node:crypto";
const users = new Map();

const broadcastToClients = (mySocketId, data) => {
  [...users.values()]
    .filter((clientSocket) => clientSocket.id !== mySocketId)
    .forEach((clientSocket) => clientSocket.write(data));
};

const BroadcastViaStream = (socket) => {
  return Writable({
    write(chunk, enc, callback) {
      const data = JSON.stringify({
        message: chunk.toString(),
        id: socket.id.slice(0, 4),
      });

      broadcastToClients(socket.id, data);

      callback(null, chunk);
    },
  });
};

const server = net.createServer((socket) => {
  socket.pipe(BroadcastViaStream(socket));
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
