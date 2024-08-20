const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection URI and Database Name
const mongoUri = 'mongodb://localhost:27017';
const dbName = 'chatApp';

// Connect to MongoDB
let db, chatCollection;

MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        chatCollection = db.collection('chats');
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send chat history to the newly connected user
    chatCollection.find().toArray()
        .then(chats => {
            socket.emit('chat history', chats);
        })
        .catch(err => console.error('Failed to retrieve chat history', err));

    socket.on('chat message', (msg) => {
        // Save the chat message to MongoDB
        chatCollection.insertOne(msg)
            .then(result => {
                io.emit('chat message', msg); // Broadcast the message to everyone
            })
            .catch(err => console.error('Failed to save chat message', err));
    });

    socket.on('name change', (data) => {
        // Broadcast name change notification
        socket.broadcast.emit('name change', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
