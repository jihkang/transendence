import {TypePos} from './game.util';

export class Board {
	speed: number;
	width: number;
	height: number;
	ball: any;
	pos: {
		left: TypePos;
		right: TypePos;
	};

	constructor(speed = 4, ball, width = 640, height = 480) {
		this.speed = speed;
		this.width = width;
		this.height = height;
		this.ball = ball;
		this.pos = {
			left: {
				x: 9,
				y: height / 2,
				key: '',
				score: 0,
			},
			right: {
				x: width - 10,
				y: height / 2,
				key: '',
				score: 0,
			},
		};
	}

	initalize() {
		const score = this.ball.getScore();
		this.pos = {
			left: {
				x: 9,
				y: this.height / 2,
				key: '',
				score: score.left
			},
			right: {
				x: this.width - 10,
				y: this.height / 2,
				key: '',
				score: score.right,
			},
		}
	}

	setKey(position, key) {
		this.pos[position].key = key;
	}

	collide() {
		const pos = this.ball.getPos();
		if (this.ball.collide(pos, this.pos)) {
			const score = this.ball.getScore();
			this.pos.left.score = score.left;
			this.pos.right.score = score.right;
			return true;
		}
		return false;
	}

	updatePosition(dir) {
		if (this.pos[dir]['key'] === 'Up') {
			this.pos[dir].y -= this.speed * 3;
		}
		if (this.pos[dir]['key'] === 'Down') {
			this.pos[dir].y += this.speed * 3;
		}
		if (this.pos[dir].y < 20) {
			this.pos[dir].y = 20;
		} else if (this.pos[dir].y >= this.height - 20) {
			this.pos[dir].y = this.height - 20;
		}
	}

	updatePos() {
		this.updatePosition("left");
		this.updatePosition("right");
		if (this.ball.updatePos(this.pos)) {
			this.initalize();
		}
		return {
			board : this.pos,
			ball : this.ball.getPos(),	
		}
	}
}
