const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const io = new Server({ cors: true });
const app = express();
app.use(bodyParser.json());
const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();
io.on("connection", (socket) => {
  console.log("socket server is running");
  //singnaling
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("user", emailId, "joined room", socket.id, roomId);
    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    console.log("joined-room", roomId);
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    console.log("call-user", emailId, offer);
    const fromEmail = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(emailId);
    socket.to(socketId).emit("incomming-call", { from: fromEmail, offer });
    console.log("incomming-call", fromEmail, offer);
  });

  socket.on("call-accepted", (data) => {
    const { email, answer } = data;
    const socketId = emailToSocketMapping.get(email);
    console.log("call-accepted", socketId, answer);
    socket.to(socketId).emit("call-accepted", { answer });
  });
});
app.listen(8000, () => {
  console.log("Htpp server running on 8000");
});
io.listen(8001);
