import net from "node:net";

const server = net.createServer((socket) => {
  socket.pipe(socket);
});

server.listen(3000, () => console.log("Server is listening on 3000"));
