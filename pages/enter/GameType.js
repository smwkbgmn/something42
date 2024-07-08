import Component from '../../core/Component.js'

export default class Gametype extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/enter/GameType.css">
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="./design_src/home-icon.png">
				</a>
				
				<p class="main-p">게임 모드</p>
				<a class="tournament-a" href="#set_player_num/">토너먼트</a>
				<botton class="ai-btn">AI 대전</botton>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.ai-btn', ({ target }) => {
			if (sessionStorage.getItem('isLoggedIn') == 'true')
				window.location.href = './#game_ai/';
			else
				window.location.href = './#set_name_ai/';
		});
	}
}