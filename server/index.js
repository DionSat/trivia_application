const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");

/**
 * Instance Variables
 */
 const rooms = {};


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

/***
 * Connect a socket to a specified room
 * @param connected socket.io socket
 * @param object that represents a room from rooms
 */
const joinRoom = (socket, room) => {
    room.sockets.push(socket);
    socket.join(room.id, () => {
        socket.roomId = room.id;
        console.log(socket.id, " Joined ", room.id);
    })
}

let interval;

io.on("connection", (socket) => {
    //give each socket a random identifier
    socket.id = randomUUID();
    console.log("New client connected");

    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });

    //When all the clients send a ready event
    socket.on('ready', () => {
        console.log(socket.id, "is Ready");
        const room = rooms[socket.roomId];
        if(room.sockets.length == 3) {
            //tell players to start
            for(const client of room.sockets) {
                client.emit('initGame')
            }
        }
    })

    /**
     * Listen when a user wants to create a room
     */
    socket.on('createRoom', (roomName, callback) => {
        const room = {
            id: randomUUID(),
            name: roomName,
            sockets: []
        };
        rooms[room.id] = room;
    
        joinRoom(socket, room)
        callback();
    });
    
    /**
     * Listen when a user wants the list of room names
     */
    socket.on('getRoomNames', (data, callback) => {
        const roomNames = [];
        for (const id in rooms) {
            const {name} = rooms[id];
            const room = {name, id};
            roomNames.push(room);
        }
    
        callback(roomNames);
    })
    
    /**
     * Listen when a user has joined a room
     */
    socket.on('joinRoom', (roomId, callback) => {
        const room = rooms[roomId];
        joinRoom(socket, room);
        callback();
    })
});
  
const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

server.listen(4001, () => {
    console.log("SERVER IS RUNNING")
})