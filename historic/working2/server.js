const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const GameMatter = require('./GameMatter');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const waitingPlayers = [];
const activeGames = new Map();

try {
	console.log("Starting server...");

	io.on('connection', (socket) => {
		socket.on('requestMatch', () => {
			if (waitingPlayers.length > 0) {
				const opponent = waitingPlayers.pop();
				const roomId = `game_${Date.now()}`;
				
				GameMatter.createGame(roomId, activeGames, io);
				const game = activeGames.get(roomId);

				socket.join(roomId);
				opponent.join(roomId);

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

			// console.log(`Player joined room: ${roomId}`);
			socket.join(roomId);
		});
		
		socket.on('playerMove', ({ roomId, movedY }) => {
			const game = activeGames.get(roomId);
			if (!game) return;

			const paddle = socket.id == game.players.left?
				game.paddleLeft : game.paddleRight;
			
			GameMatter.movePaddle(paddle, movedY);
			
			// Matter.Body.setPosition(paddle, {
			// 	x: paddle.position.x,
			// 	y: movedY
			// });
		});
		
		socket.on('disconnect', () => {
			// Handle disconnection, remove from waiting players if needed
			const index = waitingPlayers.indexOf(socket);
			if (index !== -1) {
				waitingPlayers.splice(index, 1);
			}
			// You might want to handle game cleanup here as well
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

} catch (error) {
	console.error("Failed to start server: ", error);
}

