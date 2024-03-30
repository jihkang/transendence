import {GameUser} from './game.gameUser';
import { GameApp } from './gamelogic/gamel.logic';

export class GameRoom {
	roomId: string;

	userLeft: GameUser | null;
	userRight: GameUser | null;

	scoreLeft: number;
	scoreRight: number;

	isRank: boolean;

	speed: number;

	gameApp: GameApp;

	timer: NodeJS.Timer | null;

	visual: boolean;
}
