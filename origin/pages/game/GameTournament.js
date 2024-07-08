import Component from '../../core/Component.js'
import io from 'socket.io-client'
import PongGame from './Game.js'

export default class GameTournament extends Component {
    setUp() {
        this.$state = {
            matchmakingStatus: 'Not started',
        };
        this.socket = io(); // Connect to Socket.IO server
        this.setupSocketListeners();
    }

    template() {
        return `
            <link rel="stylesheet" href="./style/Home.css">
            <link rel="stylesheet" href="./style/game/GameTournament.css">
            
            <div class="main-box">
                <p class="main-p">토너먼트 게임 페이지</p>
            </div>

			<div data-component="game-div"></div>
        `;
    }

	mounted() {
		const $game = this.$target.querySelector(
			'[data-component="game-div"]'
		);
		new PongGame($game);
	}

    setEvent() {
        this.addEvent('click', '#matchmakingBtn', () => {
            this.requestMatchmaking();
        });
    }

    setupSocketListeners() {
        this.socket.on('waitingForOpponent', () => {
            this.setState({ matchmakingStatus: 'Waiting for an opponent...' });
        });

        this.socket.on('matchFound', ({ roomId }) => {
            this.setState({ matchmakingStatus: 'Match found! Starting game...' });
            // Redirect to the game page or start the game
            setTimeout(() => {
                window.location.hash = `#local_tournament_game/${roomId}`;
            }, 2000);
        });
    }

    requestMatchmaking() {
        this.socket.emit('requestMatch');
        this.setState({ matchmakingStatus: 'Searching for opponent...' });
    }
}

{/* <button id="matchmakingBtn">Find Opponent</button>
<p id="matchmakingStatus">${this.$state.matchmakingStatus}</p>

<a class="start-a" href="#local_tournament_game/">게임 시작</a> */}