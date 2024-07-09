const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const waitingPlayers = [];
const activeGames = new Map();

io.on('connection', (player) => {

    player.on('requestMatch', () => {
        if (waitingPlayers.length > 0) {
            const opponent = waitingPlayers.pop();
            const roomId = `game_${Date.now()}`;
            
            player.join(roomId);
            opponent.join(roomId);
            
            io.to(roomId).emit('matchFound', { roomId });
            activeGames.set(roomId, { players: [player.id, opponent.id] });
        } else {
            waitingPlayers.push(player);
            player.emit('waitingForOpponent');
        }
    });

    player.on('joinRoom', ({ roomId }) => {
        player.join(roomId);
    });

    player.on('playerMove', ({ roomId, paddlePosition }) => {
        player.to(roomId).emit('opponentMove', { paddlePosition });
    });

    player.on('updateGameState', ({ roomId, gameState }) => {
        player.to(roomId).emit('gameState', gameState);
    });

    player.on('disconnect', () => {
        const index = waitingPlayers.indexOf(player);
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