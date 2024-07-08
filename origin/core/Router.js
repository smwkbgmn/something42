import Component from './Component.js'
// import PongGame from '../pages/game/Game.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
	}

	addRoute(fragment, component) {
		this.$state.routes.push({ fragment, component });
	}

	async checkRoutes() {
		const currentRoute = this.$state.routes.find((route) => {
			return route.fragment === window.location.hash;
		});

		// console.log('hash ' + window.location.hash);

		if (window.location.hash == '#/') {
			if (sessionStorage.getItem('isLogging') == 'true') {
				const isLoggedIn = sessionStorage.getItem('isLoggedIn');

				if (isLoggedIn != 'true') {
					await this.waitForLoad().then(() => {
						this.extractToken();
					})
					if (this.isValidToken() == true)
						sessionStorage.setItem('isLoggedIn', true);
				}

				if (sessionStorage.getItem('isLoggedIn') == 'true')
					window.location.href = './#game_type/';
				else
					currentRoute.component();
			}
			else
				currentRoute.component();
		}

		if (!currentRoute) {
			window.location.href = './#';
			this.$state.routes[0].component();
		}

		// console.log(currentRoute);

		currentRoute.component();
	}
	
	start() {
		window.addEventListener('hashchange', () => this.checkRoutes());

		// console.log('hashchange');
		
		if (!window.location.hash) {
			window.location.hash = '#/';
		}
		
		this.checkRoutes();
	}

	// new Promise() 메서드 호출 시 resolve와 reject를 인자로 대기 상태 진입
	// resolve()를 실행하면 이행 상태가 되어 promise 종료
	// reject는 실패 상태로 종료
	// 콜백 함수에서 이벤트를 등록하고, load 이벤트 핸들러에서 resolve를 실행하기 때문에
	// 이벤트가 발생할 때까지 promise는 대기 상태이고 종료될 때까지 await 했기 때문에
	// 이벤트 발생 대기가 가능함
	waitForLoad() {
		return new Promise((resolve, reject) => {
			window.addEventListener('load', function handler(event) {
				window.removeEventListener('load', handler);
				resolve(event);
			});
		});
	}

	extractToken() {
		const token42 = new URLSearchParams(window.location.search).get('code');

		if (token42) {
			sessionStorage.setItem('token42', JSON.stringify(token42));
			// 백에 전달 해야됨

			let currentURL = new URL(window.location.href);
			let cleanURL = new URL(currentURL.origin + window.location.hash);
			window.history.replaceState({}, document.title, cleanURL);

			// console.log('token42');
		}
		// else
		//	hadling with fail
	}

	isValidToken() {
		// 토큰값을 그대로 바로 우리 백에 전달함과 동시에
		// 42api 데이터 요청하는 우리 백 api 바로 요청
		// 성공 -> 게임 모드 페이지, 실패 -> 알림 및 메인페이지로 튕기기

		const tokenString = sessionStorage.getItem('token42');
		const token42 = JSON.parse(tokenString);

		// console.log('token42');
		// console.log(tokenString);
		// console.log(token42);
		return token42 != null;
	}
}