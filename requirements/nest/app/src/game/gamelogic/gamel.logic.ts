import { Socket } from 'socket.io';
import {Ball} from './game.ball';
import {Board} from './game.board';

export class GameApp {
	width: number;
	height: number;
	ball: any;
	board: any;
	result: any;
	speed: number;
	done : boolean;

	constructor(speed = 2, width = 640, height = 480) {
		this.width = width;
		this.height = height;
		this.ball = new Ball(speed);
		this.board = new Board(this.speed, this.ball);
		this.done = false;
	}

	/**
	 * () =>  {
	 *  	board: this.board.getPos(),
	 *  	ball: this.ball.getPos(),
	 * 	score : ()
	 * }
	 * socket RETURN
	 */
	keyPressed(user: 'left' | 'right', key: 'ArrowDown' | 'ArrowUp') {
		this.board.setKey(user, key.replace('Arrow', ''));
	}

	updates() {
		const ret = this.board.updatePos();
		this.done = this.ball.getFinished();
		return ret;
	}

	render() {
		return this.updates();
	}

	getDone() {
		return this.done;
	}
}
