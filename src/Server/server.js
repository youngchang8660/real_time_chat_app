const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require('cors');

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
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
        return res.status(500).send(err.message);
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
        console.log(err.message)
    }
})

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})