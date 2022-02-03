const express = require('express');
const http = require("http");
const mysql = require('mysql');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require('cors');
const server = http.createServer(app);

app.use(express.static(__dirname + '../../build'))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'))
})

const socketIo = require("socket.io");
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`)
    socket.on("join", (room) => {
        console.log(`Socket ${socket.id} joining ${room}`);
        socket.join(room);
    })

    socket.on("getOnlineUsers", (roomId) => {
        let number_of_connected_clients_in_the_room = io.sockets.adapter.rooms.get(roomId).size;
        io.to(roomId).emit("roomSize", number_of_connected_clients_in_the_room);
    })

    socket.on("send message", (data) => {
        const { chatID } = data;
        io.to(chatID).emit('get message', data);
    })

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);

    })
})

app.use(cors());
app.use(express.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

require('dotenv').config();
const { PORT, HOST, DATABASE, PASSWORD } = process.env;
const port = PORT;
const host = HOST;
const db = DATABASE;
const password = PASSWORD;

const connection = mysql.createConnection({
    host: host,
    user: 'root',
    password: password,
    database: db,
    multipleStatements: true
});

connection.connect((err) => {
    if(err) throw err;
    console.log('db connected')
})

// Register new users
app.post('/api/signUpNewUser', async (req, res) => {
    let { user_id, first_name, last_name, email, password, password_confirm } = req.body;
    let user_image = null;
    try {
        if(user_id === '' || first_name === '' || last_name === '' || email === '' || password === '' || password_confirm === '') {
            return res.status(500).send("Fill up all required Fields.");
        }
        if(password_confirm !== password) {
            return res.status(500).send("Password does not match.");
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        password_confirm = password;

        let query = "CALL SignUp_New_User (?, ?, ?, ?, ?, ?, ?)";
        connection.query(query, [user_id, email, first_name, last_name, user_image, password, password_confirm], (err, result) => {
            if(err) {
                return res.status(500).send("User already exists.");
            } else {
                return res.status(200).send(result);
            }
        });
    } catch(err) {
        console.log(err.message, 'failed to register')
        res.status(500).send(err.message);
    }
})

// Login a user
app.post('/api/login', async (req, res) => {
    let { user_id, password } = req.body;
    try {
        if(user_id === '' || password === '') {
            return res.status(500).send("Fill up all required Fields.");
        }
        let query = "CALL Check_If_User_Exist (?)";
        connection.query(query, [user_id], (err, result) => {
            if(err) {
                return res.status(500).send(err.message)
            } else {
                if(result[0] !== undefined) {
                    bcrypt.compare(password, result[0][0].password, (err, data) => {
                        if(err) {
                            return res.status(500).send(err.message);
                        }
                        if(data) {
                            result[0][0].message = 'Successfully logged in';
                            delete result[0][0].password;
                            return res.status(200).send(result[0][0]);
                        } else {
                            return res.status(500).send('Incorrect password')
                        }
                    })
                } else {
                    return res.status(500).send("User does not exist.")
                }
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to login')
        res.status(500).send(err.message);
    }
})

// fetch User Info
app.get('/api/getUserInfo/:userID', async (req, res) => {
    let { userID } = req.params;
    try {
        let query = "CALL Get_User_Info (?)";
        connection.query(query, [userID], (err, result) => {
            if(err) {
                return res.status(500).send(err.message);
            } else {
                return res.status(200).send(result[0]);
            }
        })
    } catch(err) {
        console.log(err.message, 'failed to fetch user info')
        return res.status(500).send(err.message);
    }
})

// update user info
app.put('/api/updateUser', async (req, res) => {
    let { userID, firstName, lastName, imgContent } = req.body;
    let userPictureBuffer;
    if(imgContent === "") {
        userPictureBuffer = null;
    } else {
        userPictureBuffer = Buffer.from(imgContent,'hex')
    }
    try {
        let query = "CALL Update_User_Info (?, ?, ?, ?)";
        connection.query(query, [userID, firstName, lastName, userPictureBuffer], (err, result) => {
            if(err) {
                res.status(500).send('Your image is too big. Select different image.')
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to update user info');
        return res.status(500).json(err.message);
    }
})

// search user by user_id
app.get('/api/getUserByID/:userID/:friendID', async (req, res) => {
    let { userID, friendID } = req.params;
    if(friendID !== "") {
        try {
            let query = "CALL Search_User_By_ID (?, ?)";
            connection.query(query, [userID, friendID], (err, result) => {
                if(err) {
                    console.log(err.message)
                    res.status(500).send('Failed to fetch friends list.')
                } else {
                    return res.status(200).send(result[0]);
                }
            })
        } catch(err) {
            console.log(err.message, 'failed to fetch friends by id')
            return res.status(500).json(err.message);
        }
    }
})

// send friend request
app.post('/api/sendFriendRequest', async (req, res) => {
    let { sender, receiver, status } = req.body;
    try {
        let query = "CALL Send_Friend_Request (?, ?, ?)";
        connection.query(query, [sender, receiver, status], (err, result) => {
            if(err) {
                console.log(err.message)
                return res.status(500).send('Request already sent')
            } else {
                return res.status(200).send('Request just sent.')
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to send Friend Request')
        return res.status(500).json(err.message);
    }
})

// cancel sent friend requests
app.delete('/api/cancelFriendRequest/:userID/:friendID', async (req, res) => {
    let { userID, friendID } = req.params;
    try {
        let query = "CALL Cancel_Friend_Request (?, ?)";
        connection.query(query, [userID, friendID], (err, result) => {
            if(err) {
                console.log(err.message)
                return res.status(500).send('Cant cancel friend request')
            } else {
                return res.status(200).send('Request just canceled.')
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to cancel Friend Request')
        return res.status(500).json(err.message);
    }
})

// Get all pending requests (received)
app.get('/api/getPendingRequests/:userID', async (req, res) => {
    let userID = req.params.userID;
    try {
        let query = "CALL Get_Pending_Requests (?)";
        connection.query(query, [userID], (err, result) => {
            if(err) {
                return res.status(500).send('failed to fetch pending requests')
            } else {
                return res.status(200).send(result[0])
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to fetch pending requests')
        return res.status(500).json(err.message);
    }
})

// Accept or reject friend request
app.put('/api/acceptOrRejectRequest', async (req, res) => {
    let { requestID, status } = req.body;
    try {
        let query = "CALL Accept_Reject_Friend_Request (?, ?)";
        connection.query(query, [requestID, status], (err, result) => {
            if(err) {
                console.log(err.message)
                return res.status(500).send('Failed to answer to request')
            } else {
                return res.status(200).send(result[0])
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to answer to request')
        return res.status(500).json(err.message);
    }
})

// Get all my friends list
app.get('/api/getMyFriends/:userID', async(req, res) => {
    let { userID } = req.params;
    try {
        let query = "CALL Get_All_My_Friends (?)";
        connection.query(query, [userID], (err, result) => {
            if(err) {
                console.log(err.message)
                return res.status(500).send('Failed to fetch all my friends list')
            } else {
                return res.status(200).send(result[0])
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to fetch pending requests')
        return res.status(500).json(err.message);
    }
})

/********************* Chats *************************/

// check if chat already exists
app.get('/api/checkChatExistence/:userOne/:userTwo', async (req, res) => {
    let { userOne, userTwo } = req.params;
    try {
        let query = "CALL Check_If_ChatRoom_Exists (?, ?)";
        connection.query(query, [userOne, userTwo], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to check if chat already exists');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to check if chat already exists')
        return res.status(500).json(err.message);
    }
})

// create new chat
app.post('/api/createNewChat', async (req, res) => {
    let { userOne, userTwo, messageText } = req.body;
    try {
        let query = "CALL Create_New_Chat (?, ?, ?)";
        connection.query(query, [userOne, userTwo, messageText], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to create new chat');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to create new chat')
        return res.status(500).json(err.message);
    }
})

// get all my chats
app.get('/api/getAllChats/:userID', async (req, res) => {
    let { userID } = req.params;
    try {
        let query = "CALL Get_All_My_Chats (?)";
        connection.query(query, [userID], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to fetch all chats');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'failed to fetch all chats');
        return res.status(500).json(err.message);
    }
})

/******************** Messages *************************/

// Get all Messages in the chat room
app.get('/api/getMessages/:chatID', async (req, res) => {
    let { chatID } = req.params;
    // console.log(chatID)
    try {
        let query = "CALL Get_All_Messages_By_Chat (?)";
        connection.query(query, [chatID], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to fetch all messages from the chat room');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to fetch all messages from the chat room');
        return res.status(500).json(err.message);
    }
})

// send message
app.post('/api/sendMessage', async (req, res) => {
    let { chatID, sender, messageText } = req.body['data'];
    try {
        let query = "CALL Send_Message (?, ?, ?)";
        connection.query(query, [chatID, sender, messageText], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to send message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to send message');
        return res.status(500).json(err.message);
    }
})

// edit message
app.put('/api/editMessage', async (req, res) => {
    let { chatID, messageID, sender, messageText } = req.body['data'];
    try {
        let query = "CALL Edit_Message (?, ?, ?, ?)";
        connection.query(query, [chatID, messageID, sender, messageText], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to update message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to update message');
        return res.status(500).json(err.message);
    }
})

// delete message
app.delete('/api/deleteMessage', async (req, res) => {
    let { chatID, messageID, sender } = req.body;
    try {
        let query = "CALL Delete_Message (?, ?, ?)";
        connection.query(query, [chatID, messageID, sender], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to fetch delete message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to fetch delete message');
        return res.status(500).json(err.message);
    }
})

// save unread message
app.post('/api/saveUnreadMessage', async (req, res) => {
    let { recipient, chatID, sender, messageText } = req.body;
    try {
        let query = "CALL Save_Unread_Messages (?, ?, ?, ?)";
        connection.query(query, [recipient, chatID, sender, messageText], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to save unread message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to save unread message');
        return res.status(500).json(err.message);
    }
})

// get all unread message by user_id
app.get('/api/getUnreadMessage/:userID', async (req, res) => {
    let { userID } = req.params;
    try {
        let query = "CALL Get_All_Unread_Messages (?)";
        connection.query(query, [userID], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to fetch unread message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to fetch unread message');
        return res.status(500).json(err.message);
    }
})

// remove unread message
app.delete('/api/removeUnreadMessage/:messageId', async (req, res) => {
    let { messageId } = req.params;
    try {
        let query = "CALL Remove_Unread_Messages (?)";
        connection.query(query, [messageId], (err, result) => {
            if(err) {
                console.log(err.message);
                return res.status(500).send('Failed to remove unread message');
            } else {
                return res.status(200).send(result[0]);
            }
        })
    }catch(err) {
        console.log(err.message, 'Failed to remove unread message');
        return res.status(500).json(err.message);
    }
})

server.listen(port, () => {
    console.log(`Server running on ${port}`)
})