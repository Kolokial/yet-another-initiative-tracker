import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./signals";

//const socketIo = require("socket.io");

const server = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms: { [roomId: string]: string[] } = {};

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (!roomId) {
      return;
    }
    socket.join(roomId);
    console.log(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    console.log(`Client ${socket.id} joined room ${roomId}`);
    //notifyPeersInRoom(socket, roomId, "newPeerJoined", socket.id);

    io.to(socket.id).emit("roomJoined", rooms[roomId]);
  });

  socket.on("offer", (data) => {
    //console.log(`Offer: ${JSON.stringify(data)}`);
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    //console.log(`Answer: ${JSON.stringify(data)}`);
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("candidate", (data) => {
    //console.log(`Candidate: ${JSON.stringify(data)}`);
    socket.to(data.roomId).emit("candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    removePeerFromRooms(socket.id);
  });
});

function notifyPeersInRoom(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  roomId: string
) {
  const peersInRoom = rooms[roomId] || [];
  console.log(`Notifying peers`);
  for (const peerId of peersInRoom) {
    if (peerId !== socket.id) {
      console.log(`PeerId ${peerId}, SocketId: ${socket.id}`);
      //io.to(peerId).emit(event, data);
    }
  }
}

function removePeerFromRooms(peerId: string) {
  for (const roomId in rooms) {
    if (rooms[roomId].includes(peerId)) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
