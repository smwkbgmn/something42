import Component from '../../core/Component.js'

const clientID = 'u-s4t2ud-9063f4e8ff01e5b0878f85b3cc0434661267ebbee2ae65bcba9fc2a973a6584e';
const redirectURI = 'http://localhost:5173/';

export default class ConnectionType extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/enter/ConnectionType.css">
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="./design_src/home-icon.png">
				</a>

				<p class="main-p">게임 모드</p>
				<botton class="online-btn">온라인 게임</botton>
				<a class="local-a" href="#game_type/">로컬 게임</a>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.online-btn', ({ target }) => {
			this.login();
		});
	}

	async login() {
		sessionStorage.setItem('isLogging', true);
	    const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
		window.location.href = authURL;
	}	
}