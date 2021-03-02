const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const path = require("path");
const bcrypt = require("bcrypt");
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

router.post("/register", redirectHome, (req, res) => {
    const { name, email, password } = req.body;
    db.query("SELECT email FROM users WHERE email = ?", [email], async (err, user) => {
        if(err){
            console.log(err);
        }

        if(user.length > 0){
            return res.send("<h1>Email Already in Use</h1>")
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query("INSERT INTO users SET ?", {name: name, email: email, password: hashedPassword}, (err, user) => {
            if(err){
                console.log(err)
            } else {
                res.send(`
                    <h1>User Successfully Registered!</h1>
                    <a href = "/login">Login Here</a>
                `)
            }
        })
    })
});

router.post("/login", redirectHome, (req, res) => {
    try {
        const { email, password } = req.body;
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if(!user || !(await bcrypt.compare(password, user[0].password))){
                res.send("<h1>Email or Password Incorrect<h1>")
            } else {
                const id = user[0].id;
                req.session.userId = id;
                res.redirect("/home");
            }
        })
    } catch(err){
        console.log(err)
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.redirect("/home");
        } else {
            res.clearCookie(process.env.SESS_NAME);
            return res.redirect("/");
        }
    })
})

module.exports = router;