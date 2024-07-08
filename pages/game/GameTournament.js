import Component from '../../core/Component.js'

export default class GameTournament extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/game/GameTournament.css">
			
			<div class="main-box">
				<p class="main-p">토너먼트 게임 페이지</p>

				<a class="start-a" href="#local_tournament_game/">게임 시작</a>
			</div>
		`;
	}
}
