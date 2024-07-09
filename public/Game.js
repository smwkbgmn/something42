export default class PongGame {
	
	constructor(roomId) {
		this.socket = null;
		this.roomId = null;
		
		this.join(roomId);
		this.setUp();
		this.animate();
		// this.gameRenderer.setAnimationLoop( this.animate );
    }
	
	setUp() {
		this.paddleMoveDistance = 0.7;

		this.setupThreeJS();
		this.setupObject();
		this.setupInputs();
	}

	/*** METHOD FOR REMOTE PLAY ***/
    join(roomId) {
		this.socket = io();
		console.log("Socket object created:", this.socket);

		this.socket.on('connect', () => {
			console.log("Socket connected, ID:", this.socket.id);
			
			this.socket.emit('joinRoom', {
				roomId: roomId,
				socketId: this.socket.id
			});

			this.roomId = roomId;
			this.setupSocketListeners();
			
			console.log("Joined room:", roomId);
			console.log("Starting multiplayer");
		});

    }

	setupSocketListeners() {
		console.log("Setting up socket listeners");
		
		this.socket.on('connect', () => { console.log("Socket connected"); });
		this.socket.on('gameState', (gameState) => { this.updateGameObjects(gameState); });
		this.socket.on('disconnect', (error) => {});	
		this.socket.on('connect_error', (error) => { console.log("Connection error:", error);});	
	}

    updateGameObjects(lastState) {
		if (this.socket.id == lastState.players.left) {
			this.ball.position.set(
				lastState.ballPosition.x,
				lastState.ballPosition.y,
				0
			);
			this.paddleRight.position.set(
				this.paddleRight.position.x,
				lastState.rightPaddlePositionY,
				0
			);
		} else {
			this.ball.position.set(
				-lastState.ballPosition.x,
				lastState.ballPosition.y,
				0
			);
			this.paddleRight.position.set(
				this.paddleRight.position.x,
				lastState.leftPaddlePositionY,
				0
			);
		}
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
    }

    setupObject() {
		this.ball = this.createBall();

		this.paddleLeft = this.createPaddle(-4.5, 0);
        this.paddleRight = this.createPaddle(4.5, 0);

		this.wallTop = this.createWall(0, -5, 8, 0.1);
		this.wallBottom = this.createWall(0, 5, 8, 0.1);
    }

	setupInputs() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'w'			: this.movePaddle(this.paddleLeft, this.paddleMoveDistance); break;
                case 's'			: this.movePaddle(this.paddleLeft, -this.paddleMoveDistance); break;
            }
        });
    }

	/*** OBJECT ***/
    createBall() {
        const ballGeometry = new THREE.CircleGeometry(0.1, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
		ballMesh.position.set(0, 0, 0);

		this.gameScene.add(ballMesh);

        return ballMesh;
    }

	createPaddle(x, y) {
        const paddleGeometry = new THREE.PlaneGeometry(0.2, 1);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddleMesh.position.set(x, y, 0);

        this.gameScene.add(paddleMesh);

        return paddleMesh;
    }

	movePaddle(paddle, distance) {
        const newY = paddle.position.y + distance;
        if (newY > -4.5 && newY < 4.5) {
            paddle.position.set(paddle.position.x, newY, 0);
        }

		this.socket.emit('playerMove', { roomId: this.roomId, movedY: paddle.position.y });
    }

    createWall(x, y, width, height) {
        const wallGeometry = new THREE.PlaneGeometry(width, height);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(x, y, 0);

        this.gameScene.add(wallMesh);

		return wallMesh;
    }

	/*** SHOOT ***/
	animate() {
        requestAnimationFrame(this.animate.bind(this));

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
