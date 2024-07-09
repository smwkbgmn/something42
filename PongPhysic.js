const Matter = require('matter-js');

class PongPhysic {
    constructor(roomId, io) {
        this.roomId = roomId;
        this.io = io;

		this.players = {
			left: null,
			right: null
		}
        
        this.ballSpeedDefault = 0.042;
        this.ballSpeedIncreament = 0.006;
        this.ballTimeScale = 1;

		// (rand -50 ~ +50)% * 0.2 = (-10 ~ +10)% modulation
		this.paddleRandomBounceScale = 0.3;

		this.propertiesBall = {
			label: "ball",

			restitution: 1,
			frictionAir: 0,
			friction: 0,
			density: 1,
			slop: 0.01,
			timeScale: this.ballTimeScale
		};

		this.propertiesPaddle = {
			label: "paddle",

			isStatic: true,
			restitution: 1,
			friction: 0,
			density: 1,
			slop: 0.01,
		};

		this.propertiesWall = {
			label: "wall",

			isStatic: true,
			restitution: 1,
			friction: 0,
			density: 1,
			slop: 0.01,
		}

		this.setUp();
	}

	setUp() {
		// See this issue for the colision configs on Matter
		// https://github.com/liabru/matter-js/issues/394
		Matter.Resolver._restingThresh = 0.001;

		this.engine = Matter.Engine.create({ enableSleeping: false });
		this.engine.world.gravity.y = 0;
		
		this.ball = Matter.Bodies.circle(0, 0, 0.1, this.propertiesBall);
		
		this.paddleLeft = Matter.Bodies.rectangle(-4.5, 0, 0.2, 1, this.propertiesPaddle);
		this.paddleRight = Matter.Bodies.rectangle(4.5, 0, 0.2, 1, this.propertiesPaddle);
		
		this.wallTop = Matter.Bodies.rectangle(0, -5, 8, 0.1, this.propertiesWall);
		this.wallBottom = Matter.Bodies.rectangle(0, 5, 8, 0.1, this.propertiesWall);
		
		Matter.World.add(this.engine.world, [this.ball, this.paddleLeft, this.paddleRight, this.wallTop, this.wallBottom]);
		Matter.Events.on(this.engine, 'collisionEnd', (event) => this.handleCollision(event));

		this.gameLoop = setInterval(() => this.updateGameState(), 1000 / 60 );
	}

	start() {
		Matter.Body.setPosition(this.ball, { x: 0, y: 0 });
		const direction = {
			x: Math.random() > 0.5? 1 : -1,
			y: (Math.random() - 0.5) * 2
		};

		const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
		direction.x /= length;
		direction.y /= length;
		this.updateBallVelocity(direction, this.ballSpeedDefault);
	}

	updateBallVelocity(direction, speed) {

		const velocity = {
			x: direction.x * speed,
			y: direction.y * speed
		};
		Matter.Body.setVelocity(this.ball, velocity);

	}

	handleCollision(event) {
		const pair = event.pairs[0];
		if (pair.bodyA.label === "ball" || pair.bodyB.label === "ball") {
			const speed = Matter.Body.getSpeed(this.ball);

			if (pair.bodyA.label === "paddle" || pair.bodyB.label === "paddle") {
				const direction = {
					x: this.ball.velocity.x / speed,
					y: this.ball.velocity.y / speed,
				};

				const mod = 1 + ((Math.random() - 0.5) * this.paddleRandomBounceScale); 
				direction.y *= mod;
				console.log(mod);

				this.updateBallVelocity(direction, speed);
			}
			Matter.Body.setSpeed(this.ball, speed + this.ballSpeedIncreament);
		}
	}

	updateGameState() {
		Matter.Engine.update(this.engine, 1000 / 60);
		
		if (Math.abs(this.ball.position.x) > 7 || Math.abs(this.ball.position.y) > 5) {
			this.start();
			// this.finish();
		}
		
		const gameState = {
			players: this.players,

			ballPosition: this.ball.position,
			leftPaddlePositionY: this.paddleLeft.position.y,
			rightPaddlePositionY: this.paddleRight.position.y
		};
		
		this.io.to(this.roomId).emit('gameState', gameState);
	}

	finish() {
		clearInterval(this.gameLoop);
		this.io.emit('gameFinish');
	}

	movePaddle(player, movedY) {
		const paddle = player === this.players.left?
			this.paddleLeft : this.paddleRight;

        Matter.Body.setPosition(paddle, {
            x: paddle.position.x,
            y: movedY
        });
	}
}

module.exports = PongPhysic;