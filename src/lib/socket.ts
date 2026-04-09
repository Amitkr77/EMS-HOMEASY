import { Server } from "socket.io";

const io = new Server(3001, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (userId) => {
    socket.join(userId); // join personal room
  });

  socket.on("send-message", (data) => {
    const { receiverId } = data;

    io.to(receiverId).emit("receive-message", data);
  });
});

export default io;