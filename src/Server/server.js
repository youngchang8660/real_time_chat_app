const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require('cors');
const socket = require('socket.io');

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

/*************** socket io *******************/

// let interval;
// io.on("connection", (socket) => {
//   console.log("New client connected");
//   if (interval) {
//     clearInterval(interval);
//   }
// //   interval = setInterval(() => getApiAndEmit(socket), 1000);
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });

// const getAllChats = socket => {
    
// }

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
        console.log(err.message, 'failed to update user info')
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

// create new chat
app.post('/api/createNewChat/:userOne/:userTwo', async (req, res) => {
    let { userOne, userTwo } = req.params;
    try {
        let query = "CALL Create_Chat_Room (?, ?)";
        connection.query(query, [userOne, userTwo], (err, result) => {
            if(err) {
                console.log(err.message)
                return res.status(500).send('Failed to create new chat')
            } else {
                return res.status(200).send(result[0])
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

const server = app.listen(port, () => {
    console.log(`Server running on ${port}`)
})

const io = socket(server);

io.on("connection", function (socket) {
    console.log("Made socket connection");
});