import {Injectable} from '@nestjs/common';
import {Namespace} from 'socket.io';
import { ChattingService } from 'src/chatting/chatting.service';
import {RecordService} from 'src/record/record.service';
import {UserService} from 'src/user/user.service';
import {v4} from 'uuid';
import {GameRoom} from './game.gameRoom';
import {GameUser} from './game.gameUser';
import {GameApp} from './gamelogic/gamel.logic';

@Injectable()
export class GameService {
	constructor(
		private recordService: RecordService,
		private userService: UserService,
	) {}

	private gameRoom: GameRoom[] = [];
	private matchMakingQueue: GameUser[] = [];

	private gamerList: GameUser[] = [];

	// test() {
	// 	return {gameRoom: this.gameRoom, queue: this.matchMakingQueue};
	// }

	_pushList(socket) {
		this.gamerList.push({
			id: socket.user.id,
			clientId: socket.id,
			nick: socket.user.nick,
		});
	}

	_popList(socket) {
		const curUser = this.gamerList.find((ele) => ele.clientId == socket.id);
		if (curUser) {
			this.gamerList = this.gamerList.filter(
				(ele) => ele.clientId != socket.id,
			);
			if (!this.gamerList.find((ele) => ele.id == curUser.id)) {
			}
		}
	}

	_isInRoom(userId: number) {
		if (
			this.gameRoom.find(
				(ele) =>
					ele.userLeft?.id == userId || ele.userRight?.id == userId,
			)
		)
			return true;
		return false;
	}

	findAllRoom() {
		const res: any[] = [];
		this.gameRoom.forEach((ele) => {
			if (ele.userLeft && !ele.userRight && ele.visual) {
				res.push({
					roomId: ele.roomId,
					user: ele.userLeft.nick,
					speed: ele.speed,
				});
			}
		});
		return res;
	}

	findAllRoomId() {
		const res: string[] = [];
		this.gameRoom.forEach((ele) => res.push(ele.roomId));
		return res;
	}

	_getSocketByClientId(nsp: Namespace, clientId: string) {
		return nsp.sockets.get(clientId);
	}

	_makeRoom(isRank: boolean, speed: number = 2, visual: boolean): GameRoom {
		const roomId = v4();
		const room = {
			roomId: roomId,
			userLeft: null,
			userRight: null,
			scoreLeft: 0,
			scoreRight: 0,
			isRank: isRank,
			speed: isRank ? 2 : speed,
			gameApp: new GameApp(isRank ? 2 : speed),
			timer: null,
			visual: visual,
		};
		this.gameRoom.push(room);
		return room;
	}

	_joinRoom(user: GameUser, room: GameRoom, nsp: Namespace) {
		if (!room) return false; // no room
		if (room.userLeft && room.userRight) return false; // full room
		if (room.userLeft == null) room.userLeft = user;
		else if (room.userRight == null) room.userRight = user;
		this._getSocketByClientId(nsp, user.clientId)?.join(room.roomId);
		return true;
	}

	_deleteRoom(roomId: string) {
		this.gameRoom = this.gameRoom.filter((ele) => ele.roomId != roomId);
	}

	_findRoomByRoomId(roomId: string) {
		return this.gameRoom.find((ele) => ele.roomId == roomId);
	}

	_findRoomByClientId(clientId: string) {
		return this.gameRoom.find(
			(ele) =>
				ele.userLeft?.clientId == clientId ||
				ele.userRight?.clientId == clientId,
		);
	}

	_leaveRoomAlone(room: GameRoom, clientId: string, nsp: Namespace) {
		if (!room) return;
		if (room?.userLeft?.clientId == clientId) room.userLeft == null;
		else if (room?.userRight?.clientId == clientId) room.scoreRight == null;
		else return false; // error, no user

		this._getSocketByClientId(nsp, clientId)?.leave(room.roomId);
		this._deleteRoom(room.roomId);
		return true;
	}

	async _makeRecord(winnerLeft: boolean, curRoom: GameRoom) {
		if (!curRoom.userLeft || !curRoom.userRight) return;
		const record = await this.recordService.createRecord({
			winnerId: winnerLeft ? curRoom.userLeft.id : curRoom.userRight.id,
			loserId: winnerLeft ? curRoom.userRight.id : curRoom.userLeft.id,
			winnerScore: winnerLeft ? curRoom.scoreLeft : curRoom.scoreRight,
			loserScore: winnerLeft ? curRoom.scoreRight : curRoom.scoreLeft,
			isRank: curRoom.isRank,
		});
		if (record) return true;
		else return false;
	}

	async _abstention(clientId: string, nsp: Namespace, curRoom: GameRoom) {
		let record;
		if (!curRoom.userLeft || !curRoom.userRight) return false;
		else if (curRoom.userLeft.clientId == clientId)
			record = await this._makeRecord(false, curRoom);
		else record = await this._makeRecord(true, curRoom);
		if (!this._leaveRoomAlone(curRoom, curRoom.userLeft.clientId, nsp))
			return false; // leave error
		if (!this._leaveRoomAlone(curRoom, curRoom.userRight.clientId, nsp))
			return false; // leave error
		this._deleteRoom(curRoom.roomId);
		return record;
	}

	// _startInterval(roomId, nsp: Namespace) {
	// 	const curRoom = this._findRoomByRoomId(roomId);
	// 	if (!curRoom) return; // error, no room
	// 	curRoom.timer = setInterval(() => this.gameApp(curRoom, nsp), 1000);
	// }

	// _endInterval(room: GameRoom) {
	// 	if (room.timer) clearInterval(room.timer);
	// 	room.timer = null;
	// }

	async _endGame(nsp: Namespace, roomId: string) {
		const curRoom = this._findRoomByRoomId(roomId);
		if (!curRoom) return; // error, no room
		let tmp;
		if (!curRoom.userLeft || !curRoom.userRight)
			return; // error, game not played
		else if (curRoom.scoreLeft < curRoom.scoreRight) {
			tmp = await this._makeRecord(false, curRoom);
		} else {
			tmp = await this._makeRecord(true, curRoom);
		}
		if (!tmp) return; // error, make record error
		if (!this._leaveRoomAlone(curRoom, curRoom.userLeft.clientId, nsp))
			return; // leave error
		if (!this._leaveRoomAlone(curRoom, curRoom.userRight.clientId, nsp))
			return; // leave error
		this._deleteRoom(curRoom.roomId);
		return; // success
	}

	_findUserFromList(id: number) {
		return this.gamerList.find((ele) => ele.id == id);
	}

	_delMatchmaking(clientId: string) {
		this.matchMakingQueue = this.matchMakingQueue.filter(
			(ele) => ele.clientId != clientId,
		);
	}

	_isInMatchmaking(userId: number) {
		if (this.matchMakingQueue.find((ele) => ele.id == userId)) return true;
		return false;
	}

	async makeMatchmaking(socket, nsp: Namespace) {
		if (this._isInMatchmaking(socket.user.id)) {
			socket.emit('match-making', {
				status: 'success',
			});
			return;
		}
		if (this.matchMakingQueue.length == 0) {
			this.matchMakingQueue.push({
				id: socket.user.id,
				clientId: socket.id,
				nick: socket.user.nick,
			});
			socket.emit('match-making', {
				status: 'success',
			});
			return; // success, no user in queue, wait
		}

		const user1 = this.matchMakingQueue.shift();
		const user2: GameUser = {
			id: socket.user.id,
			clientId: socket.id,
			nick: socket.user.nick,
		};
		if (!user1) {
			this.matchMakingQueue.push(user2);
			socket.emit('match-making', {
				status: 'success',
			});
			return; // success, no user in queue
		}

		const room = this._makeRoom(true, 2, false); // make room

		if (!this._joinRoom(user1, room, nsp)) {
			// if user1 not exist
			this._deleteRoom(room.roomId);
			if (this.gamerList.find((ele) => ele.clientId == user2.clientId)) {
				this.matchMakingQueue.push(user2);
				this._getSocketByClientId(nsp, user2.clientId)?.emit(
					'match-making',
					{status: 'success'},
				); // make user2 in queue
			}
			return; // join error
		}
		if (!this._joinRoom(user2, room, nsp)) {
			// if user2 not exist
			this._deleteRoom(room.roomId);
			this._getSocketByClientId(nsp, user1.clientId)?.leave(room.roomId);
			if (this.gamerList.find((ele) => ele.clientId == user1.clientId)) {
				this.matchMakingQueue.push(user1);
				this._getSocketByClientId(nsp, user1.clientId)?.emit(
					'match-making',
					{status: 'success'},
				); // make user1 in queue
			}
			return; // join error
		}
		// start game
		await this._emitGameStart(nsp, room);
		return; // success
	}

	cancelMatchMaking(socket) {
		this._delMatchmaking(socket.id);
		socket.emit('cancel-match-making');
		return; // success
	}

	createRoom(socket, nsp: Namespace, data) {
		if (this._isInRoom(socket.user.id)) return;
		const user: GameUser = {
			id: socket.user.id,
			clientId: socket.id,
			nick: socket.user.nick,
		};
		const room = this._makeRoom(
			false,
			data.speed,
			data.visible ? true : false,
		);
		if (!this._joinRoom(user, room, nsp)) {
			socket.leave(room.roomId);
			this._deleteRoom(room.roomId);
			socket.emit('create-room', {
				status: 'fail',
				reason: 'join error',
			});
			return; // join error
		}
		socket.emit('create-room', {
			status: 'success',
			roomId: room.roomId,
		});
		return; // success
	}

	async joinRoom(socket, nsp: Namespace, data) {
		if (this._isInRoom(socket.user.id)) return;
		const user: GameUser = {
			id: socket.user.id,
			clientId: socket.id,
			nick: socket.user.nick,
		};
		const room = this._findRoomByRoomId(data.roomId);
		if (!room) {
			socket.emit('join-room', {
				status: 'fail',
				reason: 'no room',
			});
			return; // error, no room
		}
		if (
			room.userLeft?.id == socket.user.id ||
			room.userRight?.id == socket.user.id
		) {
			socket.emit('join-room', {
				status: 'fail',
				reason: 'self service',
			});
			return; // join error
		}
		if (!this._joinRoom(user, room, nsp)) {
			socket.emit('join-room', {
				status: 'fail',
				reason: 'join error',
			});
			return; // join error
		}
		await this._emitGameStart(nsp, room);
		// console.log(this.gameRoom);
		return; // success
	}

	inviteRoom(socket, nsp: Namespace, data) {
		const target = this._findUserFromList(data.targetId);
		if (!target) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		if (this._isInRoom(target.id)) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		if (target.id == socket.user.id) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		// this._getSocketByClientId(nsp, target.clientId)?.emit('invite-room', {
		// 	status: 'success',
		// 	roomId: data.roomId,
		// 	targetNick: socket.user.nick,
		// });
		nsp.to(target.clientId).emit('invite-room', {
			status: 'success',
			roomId: data.roomId,
			targetNick: socket.user.nick,
		});
		return; // success
	}

	async inviteRoomChat(socket, nsp: Namespace, data) {
		const targetEntity = await this.userService.findOneByNick(
			data.nick,
		);
		if (!targetEntity) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		const target = this._findUserFromList(targetEntity.id);
		if (!target) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		if (this._isInRoom(target.id)) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		if (target.id == socket.user.id) {
			this._leaveRoom(socket.id, nsp);
			return;
		}
		nsp.to(target.clientId).emit('invite-room', {
			status: 'success',
			roomId: data.roomId,
			targetNick: socket.user.nick,
		});
		return; // success
	}

	inviteReject(socket, nsp: Namespace, data) {
		const room = this._findRoomByRoomId(data.roomId);
		if (!room) {
			socket.emit('invite-reject', {status: 'fail', reason: 'no room'});
			return;
		}
		const user = room?.userLeft ? room.userLeft : room?.userRight;
		if (!user) {
			socket.emit('invite-reject', {status: 'fail', reason: 'no target'});
			return;
		}
		console.log(room);
		this._leaveRoom(user.clientId, nsp);
	}

	async _leaveRoom(clientId: string, nsp: Namespace) {
		const curRoom = this._findRoomByClientId(clientId);
		if (!curRoom) return;
		if (curRoom.userLeft && curRoom.userRight)
			await this._abstention(clientId, nsp, curRoom);
		else this._leaveRoomAlone(curRoom, clientId, nsp);
		await this._emitGameEnd(nsp, curRoom);
		return; // success
	}

	async disconnect(socket, nsp: Namespace) {
		this._popList(socket);
		this._delMatchmaking(socket.id);

		const curRoom = this._findRoomByClientId(socket.id);
		if (!curRoom) {
			socket.emit('leave-room', {
				status: 'fail',
				reason: 'no room',
			});
			return; // error, no room
		}
		let record;
		if (curRoom.userLeft && curRoom.userRight)
			record = await this._abstention(socket.id, nsp, curRoom);
		else record = this._leaveRoomAlone(curRoom, socket.id, nsp);
		await this._emitGameEnd(nsp, curRoom);
		return; // success
	}

	keyIn(socket, data) {
		const curRoom = this._findRoomByRoomId(data.roomId);
		if (!curRoom) return; // error, no room
		// curRoom
		if (curRoom.userLeft?.clientId == socket.id) {
			curRoom.gameApp.keyPressed('left', data.key);
		} else if (curRoom.userRight?.clientId == socket.id) {
			curRoom.gameApp.keyPressed('right', data.key);
		} else return; // error, no user
	}

	async _emitGameStart(nsp: Namespace, room: GameRoom) {
		if (!room || !room.userLeft || !room.userRight) return;
		nsp.to(room.roomId).emit('start-game', {
			userLeft: room.userLeft.nick,
			userRight: room.userRight.nick,
			roomId: room.roomId,
		});
		await this.userService.userOnGame(room.userLeft.id);
		await this.userService.userOnGame(room.userRight.id);
	}

	async _emitGameEnd(nsp: Namespace, room: GameRoom) {
		if (room.userLeft) {
			this._getSocketByClientId(nsp, room.userLeft.clientId)?.emit(
				'end-game',
			);
			await this.userService.userOnline(room.userLeft.id);
		}
		if (room.userRight) {
			this._getSocketByClientId(nsp, room.userRight.clientId)?.emit(
				'end-game',
			);
			await this.userService.userOnline(room.userRight.id);
		}
	}

	async gameApp(socket, nsp: Namespace, data) {
		const room = this._findRoomByRoomId(data.roomId);
		if (!room) {
			socket.emit('render', {
				status: 'fail',
				reason: 'no room',
			});
			return;
		}
		if (!room.userLeft || !room.userRight) {
			socket.emit('render', {
				status: 'fail',
				reason: 'wtf',
			});
			return;
		}
		const res = room.gameApp.render();
		if (room.gameApp.getDone() && room.userLeft.clientId == socket.id) {
			room.scoreLeft = res.board.left.score;
			room.scoreRight = res.board.right.score;
			await this._endGame(nsp, room.roomId);
			await this._emitGameEnd(nsp, room);
			return; // end game
		}
		nsp.to(room.roomId).emit('render', res);
		return; // success
	}

	reset(socket, nsp: Namespace) {
		this._delMatchmaking(socket.id);
		this._leaveRoom(socket.id, nsp);
	}
}
