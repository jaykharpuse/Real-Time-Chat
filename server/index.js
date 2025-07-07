const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const saveMessage = require('./services/save-message');
const getLast100Messages = require('./services/getLast100Messages');
const leaveRoom = require('./utils/leave-room');

require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

app.use(cors());

const server = http.createServer(app);
const CHAT_BOT = 'ChatBot';
let allUsers = [];

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://real-time-chat-dun.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on('join_room', async (data) => {
    const { username, room } = data;
    socket.join(room);

    const __createdtime__ = Date.now();

    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });

    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    try {
      const last100Messages = await getLast100Messages(room);
      socket.emit('last_100_messages', last100Messages);
    } catch (err) {
      console.error('❌ Error fetching last 100 messages:', err);
    }

    allUsers.push({ id: socket.id, username, room });
    const chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);
  });

  socket.on('send_message', (data) => {
    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit('receive_message', data);

    saveMessage(message, username, room, __createdtime__)
      .then((response) =>
        console.log('✅ Message saved to MongoDB:', response)
      )
      .catch((err) => console.log('❌ MongoDB save error:', err));
  });

  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);

    const __createdtime__ = Date.now();
    allUsers = leaveRoom(socket.id, allUsers);
    const chatRoomUsers = allUsers.filter((user) => user.room === room);

    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });

    console.log(`${username} has left the chat`);
  });

  // ✅ Disconnect Logic
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    const user = allUsers.find((user) => user.id === socket.id);
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      const chatRoomUsers = allUsers.filter((u) => u.room === user.room);

      socket.to(user.room).emit('chatroom_users', chatRoomUsers);
      socket.to(user.room).emit('receive_message', {
        username: CHAT_BOT,
        message: `${user.username} has disconnected from the chat.`,
        __createdtime__: Date.now(),
      });
    }
  });
});

server.listen(4000, () =>
  console.log('🚀 Server is running on port 4000')
);