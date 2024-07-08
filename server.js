const express = require('express');
const http = require('http');
// const socketIo = require('socket.io');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const io = new Server(server);

const waitingPlayers = [];
const activeGames = new Map();

io.on('connection', (socket) => {
	console.log('a user connected');
	
    socket.on('requestMatch', () => {
        if (waitingPlayers.length > 0) {
            const opponent = waitingPlayers.pop();
            const roomId = `game_${Date.now()}`;
            
            socket.join(roomId);
            opponent.join(roomId);
            
            io.to(roomId).emit('matchFound', { roomId });
            activeGames.set(roomId, { players: [socket.id, opponent.id] });
        } else {
            waitingPlayers.push(socket);
            socket.emit('waitingForOpponent');
        }
    });

    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
    });

    socket.on('playerMove', ({ roomId, paddlePosition }) => {
        socket.to(roomId).emit('opponentMove', { paddlePosition });
    });

    socket.on('updateGameState', ({ roomId, gameState }) => {
        socket.to(roomId).emit('gameState', gameState);
    });

    socket.on('disconnect', () => {
        const index = waitingPlayers.indexOf(socket);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
        }
        // Handle disconnection from active games if needed
    });
});

app.use(express.static('public'));

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});