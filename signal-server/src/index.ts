import express, { Express } from "express";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./signals";
import { createServer } from "http";

const app: Express = express();
app.use(express.json());
app.options(
  "*",
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms: { [roomId: string]: string[] } = {};

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinRoom", (roomId, auth0Id) => {
    if (!roomId) {
      return;
    }
    socket.join(roomId);
    console.log(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(auth0Id);
    console.log(
      `Client ${socket.id} with Auth0Id: ${auth0Id} joined room ${roomId}`
    );
    Object.values(rooms[roomId]).forEach((r) => console.log);
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

  socket.on("disconnect", (auth0Id: string) => {
    console.log("Client disconnected", socket.id, auth0Id);
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

const SOCKET_IO_PORT = process.env.PORT || 3000;
httpServer.listen(SOCKET_IO_PORT, () =>
  console.log(`Socket IO Server running on port ${SOCKET_IO_PORT}`)
);
