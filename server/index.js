const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { getTriviaQuestion } = require('./jservice')
const Pool = require('pg').Pool
require('dotenv').config()

/**
 * A room for whole server for now
 */
const rooms = new Map();

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
    socket.join(String(room.id));
    socket.roomId = room.id;
    console.log(socket.id, " Joined ", room.id);
}

/***
 * Disconnect a socket from a specified room
 * @param socket socket.io socket
 * @param room that represents a room from rooms
 */
 const leaveRoom = (socket, room) => {
    let i = room.sockets.indexOf(socket);
    room.sockets.splice(i, 1);
    socket.leave(String(room.id));
    socket.roomId = null;
    console.log(socket.id, " Left ", room.id);
}

let interval = setInterval(() => intervalTick(), 1000);

io.on("connection", (socket) => {
    //give each socket a random identifier
    socket.id = randomUUID();
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });

    // socket.on('ready', () => {
    //     console.log(socket.id, "is Ready");
    //     if(room.sockets.length == 10) {
    //         //tell players to start
    //         for(const client of room.sockets) {
    //             client.emit('initGame')
    //         }
    //     }
    // })

    /**
     * Listen when a user wants to create a room.
     * For now this will not be used.
     */
    socket.on('createRoom', (roomName, callback) => {
        const room = {
            id: randomUUID(),
            gameId: 0,
            name: roomName,
            questions: [],
            activeQuestionId: 0,
            sockets: []
        };
        rooms.set(room.id, room);

        for (let i = 0; i < 10; i++) {
            getTriviaQuestion((success, response) => {
                if (success) {
                    room.questions.push({ question: response.question, answer: response.answer });
                }
            });
        }
    
        joinRoom(socket, room)
        callback();
    });
    
    /**
     * Listen when a user wants the list of room names
     * Not using for now
     */
    socket.on('getRoomNames', (callback) => {
        let roomNames = [];
        rooms.forEach((v, k, m) => roomNames.push({name: v.name, id: v.id}));
        
        callback(roomNames);
    })
    
    /**
     * Listen when a user has joined a room
     */
    socket.on('joinGame', (roomId, callback) => {
        let room = rooms.get(roomId);
        if (room == null) {
            callback(false);
        } else {
            joinRoom(socket, room);
            callback(true);
        }
    })
    
    /**
     * Listen when a user has left a room
     */
    socket.on('leaveGame', (callback) => {
        let roomId = socket.roomId;
        let room = rooms.get(roomId);
        if (room == null) {
            callback(false);
        } else {
            leaveRoom(socket, room);
            callback(true);
        }
    })
});

const intervalTick = () => {
    io.sockets.sockets.forEach((v, k, i) => sendClientState(v));
    rooms.forEach((v, k, i) => sendRoomState(v));
};

const sendClientState = socket => {
    const response = {
        date: new Date(),
        username: socket.id,
        roomId: socket.roomId
    };

    // 

    // Emitting a new message. Will be consumed by the client
    socket.emit("clientState", response);
};

const sendRoomState = room => {

    let question = null;
    if (room.activeQuestionId < room.questions.length) {
        question = room.questions[room.activeQuestionId].question;
    }

    const response = {
        date: new Date(),
        name: room.name,
        players: room.sockets.map((o, i) => { return { id: o.id, name: String(o.id), score: 0, answeredQuestion: false }; }),
        question: question
    };

    // 

    // Emit state to all clients in room
    room.sockets.forEach((v, k, i) => v.emit("roomState", response));
};

const getDatabasePool = () => {
    return new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });
}

const getDatabaseGames = (callback) => {
    try {
        const pool = getDatabasePool();
        pool.query('CREATE TABLE IF NOT EXISTS users(ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, USERNAME VARCHAR(100) NOT NULL, PASSWORD VARCHAR(1024) NOT NULL);', (error, results) => {
                if (error) {
                    throw error;
                }

                console.log(results);
            });
    } catch (error) {
        console.error(error);
    }
}

const databaseLogin = (username, password, callback) => {
    if (!username || !password) {
        return new Error('Authorization failed, no user/pass has been provided!');
    }
    
    const pool = getDatabasePool();
    pool.query('SELECT * FROM users WHERE LOWER(USERNAME) = LOWER($1);', [username], (error, results) => {
        if (error) {
            throw error;
        }

        // create user if doesn't exist
        if (results.rowCount == 0) {
            pool.query('INSERT INTO users (USERNAME, PASSWORD) VALUES ($1, $2);', [username, password], (error, results) => {
                if (error) {
                    throw error;
                }

                callback({id: results.rows[0].id, username: results.rows[0].username, success: true });
            });
        }
        else if (results.rows[0].password == password) {
            callback({id: results.rows[0].id, username: results.rows[0].username, success: true });
        }
        else {
            callback({id: null, username: null, success: false });
        }
    });
}

const setupDatabase = () => {
    try {
        const pool = getDatabasePool();

        // create users table
        pool.query('CREATE TABLE IF NOT EXISTS users(ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, USERNAME VARCHAR(100) NOT NULL, PASSWORD VARCHAR(1024) NOT NULL);', (error, results) => {
                if (error) {
                    throw error;
                }
            });

        // create rooms table
        pool.query('CREATE TABLE IF NOT EXISTS games(ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, NAME VARCHAR(100) NOT NULL, CLOSED BOOLEAN NOT NULL);', (error, results) => {
                if (error) {
                    throw error;
                }
            });
    } catch (error) {
        console.error(error);
    }
};

//setupDatabase();
server.listen(4001, () => {
    console.log("SERVER IS RUNNING")
})
