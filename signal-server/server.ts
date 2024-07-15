import express, { application } from "express";
import swaggerUI from "swagger-ui-express";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./signals";
import { DatabaseSetup } from "./database/DatabaseSetup.js";
import { createServer } from "http2";
import { swaggerSpec } from "./swagger.js";

//const socketIo = require("socket.io");

const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
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

const SOCKET_IO_PORT = process.env.PORT || 3001;
const API_PORT = 8080;
httpServer.listen(SOCKET_IO_PORT, () =>
  console.log(`Socket IO Server running on port ${SOCKET_IO_PORT}`)
);
/**
 * @swagger
 * /api/resource:
 * get:
 *  summary: Get a resource
 *  description: Get a specific resource by ID.
 *  parameters:
 * — in: path
 * name: id
 * required: true
 * description: ID of the resource to retrieve.
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Successful response
 */
app.get(`/api/resource/:id`, (req, res) => {
  console.log(req);
});
app.listen(API_PORT, () => {
  console.log(`API Server is running on port ${API_PORT}`);
});
const d = new DatabaseSetup();
