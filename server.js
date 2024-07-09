const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PongPhysic = require('./PongPhysic');
const waitingPlayers = [];
const activeGames = new Map();

function start() {
	console.log("Starting server...");

	io.on('connection', (socket) => {
		socket.on('requestMatch', () => {
			if (waitingPlayers.length > 0) {
				const opponent = waitingPlayers.pop();
				const roomId = `pong_${Date.now()}`;
				
				socket.join(roomId);
				opponent.join(roomId);

				console.log("room " + roomId + " has created");					

				const game = new PongPhysic(roomId, io);
				activeGames.set(roomId, game);

				io.to(roomId).emit('matchFound', { roomId });
			} else {
				waitingPlayers.push(socket);
				socket.emit('waitingForOpponent');
			}
		});

		socket.on('joinRoom', ({ roomId, socketId }) => {
			const game = activeGames.get(roomId);
			if (!game) return;
			
			if (game.players.left == null) {
				console.log("joinRoom event is fired by socket", socket.id, "to", roomId, "as left player");
				game.players.left = socketId;
			}
	
			else {
				console.log("joinRoom event is fired by socket", socket.id, "to", roomId, "as right player");
				game.players.right = socketId;
			}

			socket.join(roomId);

			if (game.players.left && game.players.right)
				game.start();
		});
		
		socket.on('playerMove', ({ roomId, movedY }) => {
			const game = activeGames.get(roomId);

			if (game)
				game.movePaddle(socket.id, movedY);
		});

		socket.on('disconnect', () => {
			// Handle disconnection, remove from waiting players if needed

			const index = waitingPlayers.indexOf(socket);

			if (index !== -1)
				waitingPlayers.splice(index, 1);

			// You might want to handle game cleanup here as well
		});
	});

	app.use(express.static('public'));

	app.get('/game', (req, res) => {
	    res.sendFile(path.join(__dirname, 'public', 'game.html'));
	});

	const PORT = process.env.PORT || 3000;
	server.listen(PORT, () => {
	    console.log(`Server running on port ${PORT}\n`);
	});
}

try { start(); }
catch (error) { console.error("Failed to start server: ", error); }
