const express = require("express");
const app = express();
const Auth = require("./Controllers/auth");
const User = require("./Controllers/user");
const Chat = require("./Controllers/chat");
const Message = require("./Controllers/message");

app.use(express.json());
app.use("/auth", Auth);
app.use("/user", User);
app.use("/chat", Chat);
app.use("/message", Message);

module.exports = app;
