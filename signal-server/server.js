const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(socket.id);
        console.log(`Client ${socket.id} joined room ${roomId}`);
        notifyPeersInRoom(socket, roomId, 'newPeerJoined', socket.id);
    });

    socket.on('offer', (data) => {
      console.log(`Offer: ${JSON.stringify(data)}`);
        socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      console.log(`Answer: ${JSON.stringify(data)}`);
        socket.to(data.roomId).emit('answer', data);
    });

    socket.on('candidate', (data) => {
      console.log(`Candidate: ${JSON.stringify(data)}`);
        socket.to(data.roomId).emit('candidate', data);
    });

    socket.on('disconnect', () => {
        removePeerFromRooms(socket.id);
        console.log('Client disconnected');
    });
});

function notifyPeersInRoom(socket, roomId, event, data) {
    const peersInRoom = rooms[roomId] || [];
    console.log(`Notifying peers`);
    for (const peerId of peersInRoom) {
      console.log(`PeerId ${peerId}, SocketId: ${socket.id}`);
        if (peerId !== socket.id) {
            io.to(peerId).emit(event, data);
        }
    }
}

function removePeerFromRooms(peerId) {
    for (const roomId in rooms) {
        if (rooms[roomId].includes(peerId)) {
            rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
