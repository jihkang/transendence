import {GameUser} from './game.gameUser';

class GameLogic {
	player: GameUser[];
	pos: Number[];

	constructor(User1, User2, Height: number) {
		this.player = [User1, User2];
		this.pos[0] = this.pos[1] = 1080 / 2;
	}

	calculate(socketId, y) {
		this.player.forEach((p, i) => {
			if (p.clientId === socketId) {
				this.pos[i] = y;
			}
		});
		for (let i = 0; i < 2; ++i) {}
	}

	commuicate() {}
}
