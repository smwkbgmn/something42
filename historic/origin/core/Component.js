export default class Component {
	$target;
	$props;
	$state;

	constructor($target, $props) {
		this.$target = $target;
		this.$props = $props;
		
		this.setUp();		// 컴포넌트 상태 설정
		this.setEvent();	// 컴포넌트에서 발생할 이벤트 설정
		this.render();		// UI 렌더링
	}

	setUp() {}

	mounted() {}

	template() {
		return ``;
	}

	render() {
		this.$target.innerHTML = this.template();
		this.mounted();
	}

	setEvent() {}

	setState(newState) {
		this.$state = { ...this.$state, ...newState };
		this.render();
	}

	addEvent(eventType, selector, callback) {
		this.$target.addEventListener(eventType, (event) => {
			if (!event.target.closest(selector))
				return false;
			callback(event);
		})
	}
}