import Component from '../../core/Component.js'
import PongGame from './Game.js'

export default class GameAI extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameAI.css">
			
			<a class="home-a" href="#/">
				<img class="game-home-img" src="./design_src/home-icon.png">
			</a>

			<div data-component="game-div"></div>
		`;
	}

	mounted() {
		const $game = this.$target.querySelector(
			'[data-component="game-div"]'
		);
		new PongGame($game);
	}
}
