const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const path = require("path");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const redirectLogin = (req, res, next) => {
    if(!req.session.userId){
        res.redirect("/login")
    } else {
        next();
    }
};

const redirectHome = (req, res, next) => {
    if(req.session.userId){
        res.redirect("/home")
    } else {
        next();
    }
};

router.get("/", redirectHome, (req, res) => {
    const { userId } = req.session;
    res.sendFile(path.join(__dirname, "../public/landing.html"));
});

router.get("/login", redirectHome, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/register", redirectHome, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/register.html"));
});

router.get("/home", redirectLogin, (req, res) => {
    const user = db.query("SELECT * FROM users WHERE id = ?", [req.session.userId], (err, user) => {
        console.log(user);
        if(err){
            console.log(err)
        } else {
            res.send(`
                <h1>${user[0].name}'s Profile</h1>
                <form action = "/auth/logout" method = "POST">
                    <button>Logout</button>
                </form>
                <ul>
                    <li>Name: ${user[0].name} </li>
                    <li>Email: ${user[0].email} </li>
                </ul>
    `)
        }
    })
});

module.exports = router;