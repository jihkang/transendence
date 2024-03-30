import {dist2} from './game.util.js';

export class Ball {
	speed: number;
	width: number;
	height: number;
	left: number;
	right: number;
	velo: {
		vx: number;
		vy: number;
	};
	pos: {
		x: number;
		y: number;
	};
	radius: number;
	interval: NodeJS.Timer;
	done: boolean;
	constructor(speed = 2, width = 640, height = 480) {
		this.speed = speed / 3;
		this.width = width;
		this.height = height;

		this.left = this.right = 0;
		this.radius = 20;
		this.initalize();
	}

	initalize() {
		this.pos = {
			x: this.width / 2,
			y: this.height / 2,
		};
		this.velo = {
			vx: -3,
			vy: 5 - Math.floor(Math.random() * 10),
		};
		if (this.velo.vx < 0) {
			this.velo.vx -= 0.5;
		} else if (this.velo.vx > 0) {
			this.velo.vx += 0.5;
		}
		if (this.left >= 3 || this.right >= 3) {
			this.done = true;
		}
	}

	clearIntervals() {
		clearInterval(this.interval);
	}

	updatePos(board :{
		left: {
			x: number;
			y: number;
		};
		right: {
			x: number;
			y: number;
		};
	} ) {
		let tempPos = {
			x: this.pos.x + this.velo.vx * this.speed * 2,
			y: this.pos.y + this.velo.vy * this.speed * 2,
		};
		if (this.collide(tempPos, board)) {
			return true;
		}
		this.updates();
		return false;
	}

	updates() {
		this.pos = {
			x: this.pos.x + this.velo.vx * this.speed * 2,
			y: this.pos.y + this.velo.vy * this.speed * 2,
		}
	}

	collide(
		pos,
		board: {
			left: {
				x: number;
				y: number;
			};
			right: {
				x: number;
				y: number;
			};
		}
	) {
		const distLeft = dist2(
			pos.x,
			board.left.x + 10,
			pos.y,
			board.left.y + 20,
		);
		const distRight = dist2(
			pos.x,
			board.right.x,
			pos.y,
			board.right.y + 20,
		);
		if (pos.x <= 0 && distLeft > this.radius) {
			this.right += 1;
			this.initalize();
			return true;
		}
		if (pos.x >= board.right.x + 10 && distRight > this.radius) {
			this.left += 1;
			this.initalize();
			return true;
		}
		else if (
			pos.y - this.radius <= 0 ||
			pos.y + this.radius >= this.height) {
				this.velo.vy *= -1;

		} else {
			if ((pos.x <= board.left.x + this.radius &&
				pos.y >= board.left.y - 15 && pos.y <= board.left.y + 15) || (
					pos.x >= board.right.x - this.radius &&
				pos.y >= board.right.y - 15 && pos.y <= board.right.y + 15
				)) {
					this.velo.vx *= -1;
					this.velo.vy *= -1;
					return false;
				}
			let addY = -1;

			for (let i = 0; i < 2; ++i) {
				let addX = -1;
				for (let j = 0; j < 2; ++j) {
					const distLeft = dist2(
						pos.x,
						board.left.x + 15 * addX,
						pos.y,
						board.left.y + 15 * addY,
					);
					const distRight = dist2(
						pos.x,
						board.right.x + 15 * addX,
						pos.y,
						board.right.y + 15 * addY,
					);
					if (distRight < this.radius || distLeft < this.radius) {
						this.velo.vx *= addX;
						this.velo.vy *= addY;
						this.velo.vx += this.velo.vx < 0 ? -0.5 : 0.5;
						return false;
					}
					addX *= -1;
				}
				addY *= -1;
				}
		}
		return false;
	}

	getFinished() {
		return this.done;
	}

	getPos() {
		return this.pos;
	}

	getScore() {
		return {'left': this.left, 'right' : this.right};
	}
}
