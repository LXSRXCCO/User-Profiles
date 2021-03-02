const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const mysql = require("mysql");
const path = require("path");
const app = express();

dotenv.config({path: "./.env"});

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if(err){
        console.log(err)
    } else {
        console.log("MySQL Connected...");
    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening at "+ 3000));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(session({
    name: process.env.SESS_NAME,
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 1
    }
}));

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
