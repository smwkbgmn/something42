import Component from '../core/Component.js'
import * as THREE from 'three';
import Matter from 'matter-js';

export default class PongGame extends Component {
	
	// constructor() {
	// 	super();
	// 	this.handleCollision = this.handleCollision.bind(this);
	// }

	constructor() {
		super();
		this.socket = io(); // Connect to Socket.IO server
		this.setupSocketListeners();
	}

	template() {
		return ``;
	}

	setUp() {
		this.$state = {
			isSetup: true,
		}
		
		this.isRunning = true;
		
		this.ballDirection = { x: 1, y: 1 };
		this.ballSpeedDefault = 0.035;
		this.ballSpeed = this.ballSpeedDefault;
		this.ballSpeedIncreament = 0.003;
		this.ballTimeScale = 1;
		
		this.paddleMoveDistance = 0.7;
		this.paddleRandomBounceScale = 0.2; // (rand -50 ~ +50)% * 0.2 = (-10 ~ +10)% modulation
		
		this.aiMode = false;
		this.aiUpdateInterval = 100; // ms
		this.aiMoveInterval = 80; // ms
		this.aiErrorMargin = 0.05; // AI has a 50% chance to make a "mistake"

		this.aiLastUpdate = 0;
		this.aiLastMove = 0;
		this.aiTargetY = 0;
		
		this.setupThreeJS();
        this.setupPhysics();
        this.setupInputs();

        this.animate();
	}

	setEvent() {
		window.addEventListener('hashchange', () => {
			if (window.location.hash != '#game_ai/') {
				console.log("stopping game");
				this.stopGame();
				this.cleanup();
			}
		})
	}
	
	/*** SETUP ***/
    setupThreeJS() {

        this.gameScene = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 10;
        this.gameCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 0.1, 1000);
        this.gameCamera.position.z = 5;

        this.gameRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.gameRenderer.setClearColor(0x000000, 0);
        this.gameRenderer.setSize(window.innerWidth, window.innerHeight);
        this.gameRenderer.domElement.style.position = 'absolute';
        this.gameRenderer.domElement.style.top = '0px';
        document.body.appendChild(this.gameRenderer.domElement);

        this.gameObjects = new Map();

    }

    setupPhysics() {

		// See this issue for the colision configs on Matter
		// https://github.com/liabru/matter-js/issues/394
		Matter.Resolver._restingThresh = 0.001;

        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0;

		this.ball = this.createBall();
		this.resetBall();

		this.paddleLeft = this.createPaddle(-4.5, 0);
        this.paddleRight = this.createPaddle(4.5, 0);

		this.wallUp = this.createWall(0, -5, 8, 0.1);
		this.wallDown = this.createWall(0, 5, 8, 0.1);

        Matter.Events.on(this.engine, 'collisionEnd', (event) => this.handleCollision(event));

    }

	handleCollision(event) {

		const pair = event.pairs[0];
		if (pair.bodyA === this.ball.body || pair.bodyB === this.ball.body) {

			if (pair.bodyA === this.paddleLeft.body || pair.bodyB === this.paddleLeft.body ||
				pair.bodyA === this.paddleRight.body || pair.bodyB === this.paddleRight.body) {
				
				console.log("hit the paddle");
				// const velocity = this.ball.body.velocity;
				// const mod = 1 + ((Math.random() - 0.5) * 0.2);
				// velocity.y = velocity.y * mod;
				// Matter.Body.setVelocity(this.ball.body, velocity);

				const velocity = this.ball.body.velocity;
				const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
				const direction = {
					x: velocity.x / speed,
					y: velocity.y / speed,
				};

				const mod = 1 + ((Math.random() - 0.5) * this.paddleRandomBounceScale); 
				console.log(mod);
				
				direction.y *= mod;
				
				const length = Math.sqrt(this.ballDirection.x ** 2 + this.ballDirection.y ** 2);
				direction.x /= length;
				direction.y /= length;
				
				this.updateBallVelocity(this.ball.body, direction);
				
			}
			this.ballSpeed += this.ballSpeedIncreament;
			Matter.Body.setSpeed(this.ball.body, this.ballSpeed);

			console.log(this.ball.body.velocity);

		}

	}

	updateBallVelocity(ballBody, direction) {

		const velocity = {
			x: direction.x * this.ballSpeed,
			y: direction.y * this.ballSpeed
		};
		Matter.Body.setVelocity(ballBody, velocity);

	}

    setupInputs() {

        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'w'			: this.movePaddle(this.paddleLeft, this.paddleMoveDistance); break;
                case 's'			: this.movePaddle(this.paddleLeft, -this.paddleMoveDistance); break;
                case 'ArrowUp'		: if (!this.aiMode) this.movePaddle(this.paddleRight, this.paddleMoveDistance); break;
                case 'ArrowDown'	: if (!this.aiMode) this.movePaddle(this.paddleRight, -this.paddleMoveDistance); break;

				case 'o':
					if (this.isRunning) this.stopGame();
					else this.resumeGame();
					break;
				
				case 'i':
					this.aiMode = !this.aiMode;
					console.log("AI mode: " + (this.modeAI? "ON" : "OFF"));
					break;
            }
        });

    }

	/*** OBJ - Ball ***/
    createBall() {

        const ballBody = Matter.Bodies.circle(0, 0, 0.1, {
            restitution: 1,
            frictionAir: 0,
            friction: 0,
            // inertia: Infinity,
			// inverseInertia: 1 / Infinity,
			density: 1,
			slop: 0.01,
			timeScale: this.ballTimeScale
        });
        Matter.World.add(this.engine.world, ballBody);

        const ballGeometry = new THREE.CircleGeometry(0.1, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

        this.gameScene.add(ballMesh);
        this.gameObjects.set(ballBody, ballMesh);

        return { body: ballBody, mesh: ballMesh };

    }

	resetBall() {

		Matter.Body.setPosition(this.ball.body, { x: 0, y: 0 });
		this.ballDirection = {
			x: Math.random() > 0.5 ? 1 : -1,
			y: (Math.random() - 0.5) * 2
		};

		// Normalize the direction vector
		const length = Math.sqrt(this.ballDirection.x ** 2 + this.ballDirection.y ** 2);
		this.ballDirection.x /= length;
		this.ballDirection.y /= length;
		this.ballSpeed = this.ballSpeedDefault;  // Reset to initial speed
		this.updateBallVelocity(this.ball.body, this.ballDirection);

	}

	/*** OBJ - Paddle ***/
	createPaddle(x, y) {

        const paddleBody = Matter.Bodies.rectangle(x, y, 0.2, 1, {
			isStatic: true,
			restitution: 1,
			friction: 0,
			slop: 0.01,
			density: 1
            // inertia: Infinity,
			// inverseInertia: 1 / Infinity
		});
        Matter.World.add(this.engine.world, paddleBody);

        const paddleGeometry = new THREE.PlaneGeometry(0.2, 1);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddleMesh.position.set(x, y, 0);

        this.gameScene.add(paddleMesh);
        this.gameObjects.set(paddleBody, paddleMesh);

        return { body: paddleBody, mesh: paddleMesh };

    }

	movePaddle(paddle, distance) {

        const newY = paddle.body.position.y + distance;
        if (newY > -4.5 && newY < 4.5) {
            Matter.Body.setPosition(paddle.body, { x: paddle.body.position.x, y: newY });
        }

    }

	aiMovePaddle() {

		const currentTime = Date.now();
		
		// Only update AI decision every aiUpdateInterval milliseconds
		if (currentTime - this.aiLastUpdate > this.aiUpdateInterval) {

			this.aiLastUpdate = currentTime;
			
			const ballY = this.ball.body.position.y;
			
			// Randomly decide whether to make a "mistake"
			if (Math.random() > this.aiErrorMargin) {
				this.aiTargetY = ballY;
			}
			
			else {
				// If making a "mistake", aim for a random position
				this.aiTargetY = (Math.random() - 0.5) * 8; // Random position between -4 and 4
			}

		}
	
		if (currentTime - this.aiLastMove > this.aiMoveInterval) {

			this.aiLastMove = currentTime;
	
			const paddleY = this.paddleRight.body.position.y;
			const difference = this.aiTargetY - paddleY;
	
			if (Math.abs(difference) > 0.3) {

				const direction = difference > 0 ? 1 : -1;
				this.movePaddle(this.paddleRight, direction * this.paddleMoveDistance);

			}

		}

	}


	/*** OBJ - Wall ***/
    createWall(x, y, width, height) {

        const wallBody = Matter.Bodies.rectangle(x, y, width, height, {
			isStatic: true,
			restitution: 1,
			friction: 0,
			slop: 0.01,
			density: 1,
            // inertia: Infinity,
			// inverseInertia: 1 / Infinity
		});
        Matter.World.add(this.engine.world, wallBody);

        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(x, y, 0);

        this.gameScene.add(wallMesh);
		this.gameObjects.set(wallBody, wallMesh);

		return { body: wallBody, mesh: wallMesh };

    }

	/*** GAME UTILL ***/
	stopGame() {

		this.isRunning = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

	}

	resumeGame() {

		if (!this.isRunning) {
			this.isRunning = true;
			this.animate();
		}

	}

	cleanup() {

        this.stopGame();
        if (this.gameRenderer && this.gameRenderer.domElement) {
            document.body.removeChild(this.gameRenderer.domElement);
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);

        // Clear Three.js scene
        while(this.gameScene.children.length > 0){ 
            this.gameScene.remove(this.gameScene.children[0]); 
        }

        // Clear Matter.js world
        Matter.World.clear(this.engine.world);
        Matter.Engine.clear(this.engine);
        
        this.isSetup = false;

    }

	
	/*** RENDER ***/
    animate() {

		// if (!this.isRunning) return;

		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	
		Matter.Engine.update(this.engine, 1000 / 60, 1 / 60, 8);
	
		// Update positions of game objects
		for (let [body, mesh] of this.gameObjects) {
			mesh.position.set(body.position.x, body.position.y, 0);
			mesh.rotation.z = body.angle;
		}

		if (this.aiMode)
			this.aiMovePaddle();
	
		// Check if ball is out of bounds
		if (Math.abs(this.ball.body.position.x) > 7
			|| Math.abs(this.ball.body.position.y) > 5) {
			this.resetBall();
		}
	
		this.gameRenderer.render(this.gameScene, this.gameCamera);

	}

	addEventWindowResize() {
		window.addEventListener('resize', this.handleWindowResize);
	}

	handleWindowResize() {
        // get the current window size
        var width = window.innerWidth,
            height = window.innerHeight;

        // set the render size to equal window size
        Render.setSize(render, width, height);

        // update the render bounds to fit the scene
        Render.lookAt(render, Composite.allBodies(engine.world), {
            x: 50,
            y: 50
        });
    };

}

// "Planck.js", "Box2D", "Ammo.js"