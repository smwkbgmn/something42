import Component from '../../../core/Component.js'

export default class SetNameTournament extends Component {
	setUp() {
		this.$state = {
			errorMessage: '',
		}
	}

	template() {
		const player_num = sessionStorage.getItem('player_num');
		const { errorMessage } = this.$state;
		
		let inputHTML = '';
		for(let i = 0; i < player_num; i++) {
			inputHTML += `
				<div class="set-wrap">
					<p class="set-p">플레이어 ${i + 1}</p>
					<input class="set-input set${i + 1}"></input>
				</div>
			`;
		}

		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/setting/local/SetNameTournament.css">
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="./design_src/home-icon.png">
				</a>
				
				<p class="main-p">이름 설정</p>

				<div class="set-div">
					${inputHTML}
				</div>

				<p class="error-p">${errorMessage}</p>

				<button class="done-btn">완료</button>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.done-btn', ({ target }) => {
			this.checkInput();
		});
	}

	checkInput() {
		const player_num = sessionStorage.getItem('player_num');
		let name = [];

		for(let i = 0; i < player_num; i++) {
			let tmp = this.$target.querySelector('.set' + (i + 1)).value;

			if (tmp == '') {
				this.setErrorMessage();
				return ;
			}
			name.push(tmp);
		}

		localStorage.setItem('player_name', JSON.stringify(name));
		window.location.href = './#game_tournament/';
	}

	setErrorMessage() {
		this.setState({ errorMessage: '이름을 설정해주세요.' });
	}
}
