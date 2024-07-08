import StartPage from './enter/StartPage.js'
import ConnectionType from './enter/ConnectionType.js';
import GameType from './enter/GameType.js';
import SetPlayerNum from './setting/SetPlayerNum.js';
import WaitingPlayer from './setting/online/WaitingPlayer.js';
import SetNameTournament from './setting/local/SetNameTournament.js';
import SetNameAI from './setting/local/SetNameAI.js';
import GameTournament from './game/GameTournament.js';
import GameAI from './game/GameAI.js';

// import LocalTournamentGame from './game/LocalTournamentGame.js';


export default (main) => {
	const start = () => new StartPage(main);
	const connection_type = () => new ConnectionType(main);
	const game_type = () => new GameType(main);
	const set_player_num = () => new SetPlayerNum(main);
	const game_tournament = () => new GameTournament(main);
	const waiting_player = () => new WaitingPlayer(main);
	const set_name_tournament = () => new SetNameTournament(main);
	const game_ai = () => new GameAI(main);
	const set_name_ai = () => new SetNameAI(main);

	// const local_tournament_game = (roomID) => new LocalTournamentGame($target, { roomID });

	return {
		start,
		connection_type,
		game_type,
		set_player_num,
		game_tournament,
		waiting_player,
		set_name_tournament,
		game_ai,
		set_name_ai

		// local_tournament_game
	};
};