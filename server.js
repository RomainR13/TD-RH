const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session')
const mainRouter = require("./routers/mainRouter");
require('dotenv').config()
const app = express()

app.use(express.static("./assets")) // permet de servir des fichiers statiques qui se trouvent dans "./assets"
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: "ok",
    resave: true,
    saveUninitialized: true,
}));
app.use(mainRouter)

app.listen(process.env.PORT, (err)=>{
    console.log(err ? err : "Connecté au serveur");
})

mongoose.connect(process.env.URIBDD)