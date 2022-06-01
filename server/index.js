const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");
const { getTriviaQuestion } = require('./jservice')
const Pool = require('pg').Pool
var pbkdf2 = require('pbkdf2')
var crypto = require('crypto');
require('dotenv').config()
const db = require('./Database/queries');

const questionDurationMs = 20 * 1000;

/**
 * A room for whole server for now
 */
const rooms = new Map();

const port = process.env.PORT || 4001;

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

app.get('/leaderboard', db.getLeaderboard);

app.get('/leaderboard/accuracy', db.getLeaderboardByAccuracy);

app.get('/leaderboard/total', db.getLeaderboardByTotal);

/***
 * Connect a socket to a specified room
 * @param connected socket.io socket
 * @param object that represents a room from rooms
 */
const joinRoom = (socket, room) => {
    if(room.activeQuestionStartDate == null) {
        room.sockets.push(socket);
        socket.join(String(room.id));
        socket.roomId = room.id;
        socket.answeredQuestion = false;
        socket.answer = null;
        socket.score = 0;
        console.log(socket.id, " Joined ", room.id);
    }
    else {
        socket.emit('gameInProgress')
    }
}

/***
 * Disconnect a socket from a specified room
 * @param socket socket.io socket
 * @param room that represents a room from rooms
 */
 const leaveRoom = (socket, room) => {
    if (room == null)
        return;
    let i = room.sockets.indexOf(socket);
    room.sockets.splice(i, 1);
    socket.leave(String(room.id));
    socket.roomId = null;
    console.log(socket.id, " Left ", room.id);
    socket.ready = false;
    if(room.sockets.length === 0) {
        room.activeQuestionId = 0;
        room.activeQuestionStartDate = null;
        room.questions = [];
        for (let i = 0; i < 10; i++) {
            getTriviaQuestion((success, response) => {
                if (success) {
                    room.questions.push({ question: response.question, answer: response.answer });
                }
            });
        }
    }
}

let interval = setInterval(() => intervalTick(), 500);

io.on("connection", (socket) => {
    //give each socket a random identifier
    socket.id = randomUUID();
    socket.ready = false;
    console.log("New client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        let roomId = socket.roomId;
        let room = rooms.get(roomId);
        leaveRoom(socket, room);
    });

    socket.on('ready', () => {
        socket.ready = true;
        console.log(socket.id, "is Ready");
    });

    socket.on('login', (username, password, callback) => {
        console.log(socket.id, "on login " + username);
        databaseLogin(username, password, (result) => {
            if (result.success) {
                socket.username = result.username;
                socket.userid = result.id;
                callback(result.username);
            } else {
                callback(null);
            }
        });
    });

    socket.on('answer', (answer, callback) => {
        // don't allow answering multiple times
        if (socket.answeredQuestion) {
            callback(false);
            return;
        }

        // get room
        // if not in room or room has no active question
        // then ignore
        let roomId = socket.roomId;
        let room = rooms.get(roomId);
        if (room == null || room.activeQuestionId >= room.questions.length) {
            callback(false);
            return;
        }
        
        let question = room.questions[room.activeQuestionId];

        socket.answeredQuestion = true;
        socket.answer = answer;
        console.log(socket.id, "answered", answer);

        if (answer.toLowerCase() == question.answer.toLowerCase()) {
            socket.score += 1;
            callback(true);
        } else {
            callback(false);
        }
    })

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
            activeQuestionStartDate: null,
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
        console.log('Room: ' + rooms);
        joinRoom(socket, room)
        callback(true);
    });
    
    /**
     * Listen when a user wants the list of room names
     * 
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
        username: socket.username,
        roomId: socket.roomId,
        ready: socket.ready
    };

    // 

    // Emitting a new message. Will be consumed by the client
    socket.emit("clientState", response);
};

const sendRoomState = room => {

    // 
    let now = new Date();
    let msLeft = null;
    if (room.activeQuestionStartDate == null) {
        // wait for everyone to be ready before beginning question
        if (room.sockets.every(x => x.ready) && room.sockets.length !== 0) {
            room.activeQuestionStartDate = now;
        }
    } else if (room.activeQuestionId >= room.questions.length) {
        // game over
        //update player stats and reset user socket
        room.sockets.forEach (user => {
            console.log(user.score);
            db.updateLeaderboard(user.username, user.score, room.questions.length);
            user.score = 0;
            user.ready = false;
        })
        // reset game
        room.activeQuestionId = 0; 
        room.activeQuestionStartDate = null;
        room.questions = [];
        for (let i = 0; i < 10; i++) {
            getTriviaQuestion((success, response) => {
                if (success) {
                    room.questions.push({ question: response.question, answer: response.answer });
                }
            });
        }
    } else if ((now - room.activeQuestionStartDate) > questionDurationMs) {
        // move to next question after duration has been met
        room.activeQuestionStartDate = now;
        room.activeQuestionId += 1;
        msLeft = questionDurationMs;

        // mark each player as not answered question
        for (let i = 0; i < room.sockets.length; i++) {
            room.sockets[i].answeredQuestion = false;
        }
    } else {
        // compute ms left to answer question
        msLeft = Math.max(0, questionDurationMs - (now - room.activeQuestionStartDate));
    }

    // grab question and answer if available
    // answer is for debugging purposes
    let question = null;
    let answer = null;
    if (room.activeQuestionStartDate && room.activeQuestionId < room.questions.length) {
        question = room.questions[room.activeQuestionId].question;
        answer = room.questions[room.activeQuestionId].answer;
    }

    const response = {
        date: new Date(),
        name: room.name,
        players: room.sockets.map((o, i) => { return { id: o.id, username: o.username, score: o.score, answeredQuestion: o.answeredQuestion, ready: o.ready }; }),
        question: question,
        questionId: room.activeQuestionId,
        questionMsLeft: msLeft,
        answer: answer,
        gameOver: room.activeQuestionId >= room.questions.length
    };

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

function hashPassword(password) {
    var salt = crypto.randomBytes(128).toString('base64');
    var iterations = 10000;
    var hash = pbkdf2.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: hash,
        iterations: iterations
    };
}

function isPasswordCorrect(savedHash, savedSalt, savedIterations, passwordAttempt) {
    return savedHash == pbkdf2.pbkdf2Sync(passwordAttempt, savedSalt, savedIterations, 64, 'sha512').toString('hex');
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
            pwHash = hashPassword(password);
            pool.query('INSERT INTO users (USERNAME, PASSWORD, SALT, ITERATIONS) VALUES ($1, $2, $3, $4);', [username, pwHash.hash, pwHash.salt, pwHash.iterations], (error, results) => {
                if (error) {
                    throw error;
                }

                // get newly inserted row
                pool.query('SELECT * FROM users WHERE LOWER(USERNAME) = LOWER($1);', [username], (error, results) => {
                    if (error) {
                        throw error;
                    }

                    callback({id: results.rows[0].id, username: results.rows[0].username, success: true });
                });
            });
        }
        else if (isPasswordCorrect(results.rows[0].password, results.rows[0].salt, results.rows[0].iterations, password)) {
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
        pool.query('CREATE TABLE IF NOT EXISTS users(ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, USERNAME VARCHAR(100) NOT NULL, PASSWORD VARCHAR(1024) NOT NULL, SALT VARCHAR(256) NOT NULL, ITERATIONS INT NOT NULL);', (error, results) => {
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

setupDatabase();
db.setupLeaderboardTable();
server.listen(port, () => {
    console.log("SERVER IS RUNNING")
})
