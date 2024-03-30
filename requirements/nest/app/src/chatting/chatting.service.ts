import {Injectable} from '@nestjs/common';
import {Namespace, Socket} from 'socket.io';
import {SocketList} from 'src/socket/socket.list';
import {User} from 'src/user/user.entity';
import {UserService} from 'src/user/user.service';
import {v4} from 'uuid';
import {Permission} from './chatting.chattingUser';
import {ChattingRoom, roomList} from './chatting.room';

@Injectable()
export class ChattingService {
	constructor(private userService: UserService) {}
	private chattingRoom: ChattingRoom[] = [];
	private socketList: SocketList[] = [];

	findAllRoom() {
		return this.chattingRoom;
	}

	findAllIdOfRoom() {
		let res: string[] = [];
		this.chattingRoom.forEach((ele) => res.push(ele.roomId));
		return res;
	}

	findRoomList() {
		let res: roomList[] = [];
		this.chattingRoom.forEach((ele) =>
			res.push({
				roomName: ele.roomName,
				roomId: ele.roomId,
				userCount: ele.user.length,
			}),
		);
		return res;
	}

	findRoomByRoomId(roomId: string) {
		return this.chattingRoom.find((ele) => ele.roomId == roomId);
	}

	findRoomByClientId(clientId: String) {
		return this.chattingRoom.find((ele) =>
			ele.user.some((ele2) => ele2.clientId == clientId),
		);
	}

	findRoomByUserId(id: number) {
		return this.chattingRoom.find((ele) =>
			ele.user.some((ele2) => ele2.id == id),
		);
	}

	findUserByClientId(chattingRoom: ChattingRoom, clientId: string) {
		return chattingRoom.user.find((ele) => ele.clientId == clientId);
	}

	findUserByUserId(chattingRoom: ChattingRoom, userId: number) {
		return chattingRoom.user.find((ele) => ele.id == userId);
	}

	createRoom(socket, data) {
		if (this.findRoomByUserId(socket.user.id)) {
			socket.emit('create-room', {
				state: 'Fail',
				reason: 'AlreadyJoin',
			});
			return; // create room fail, user already join in some room
		}

		const roomId: string = v4();
		this.chattingRoom.push({
			roomName: data.roomName,
			roomId: roomId,
			pass: data.pass ? data.pass : null,
			user: [
				{
					id: socket.user.id,
					clientId: socket.id,
					permission: Permission.Owner,
					mute: 0,
				},
			],
			banList: [],
		});
		socket.join(roomId);
		socket.emit('create-room', {
			state: 'Success',
			roomId: roomId,
		});
		return; // create success
	}

	async joinRoom(socket, data) {
		if (this.findRoomByUserId(socket.user.id)) {
			socket.emit('join-room', {
				state: 'Fail',
				reason: 'AlreadyJoin',
			});
			return; // join fail, user already join in some room
		}
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('join-room', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // join fail, no room
		}
		if (curRoom.banList.includes(socket.user.id)) {
			socket.emit('join-room', {
				state: 'Fail',
				reason: 'Ban',
			});
			return; // join fail, ban
		}
		if (curRoom.pass != data.pass) {
			socket.emit('join-room', {
				state: 'Fail',
				reason: 'Pass',
			});
			return; // join fail, password not collect
		}
		curRoom.user.push({
			id: socket.user.id,
			clientId: socket.id,
			permission: Permission.User,
			mute: 0,
		});
		socket.join(data.roomId);
		socket.emit('join-room', {
			state: 'Success',
		});
		socket.broadcast.to(data.roomId).emit('join-room', {
			userId: socket.user.id,
			userNick: socket.user.nick,
		});
		return; // join success
	}

	async leaveRoom(socket, data) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('leave-room', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // leave fail, no room
		}
		if (!curRoom.user.some((ele) => ele.clientId == socket.id)) {
			socket.emit('leave-room', {
				state: 'Fail',
				reason: 'NotJoin',
			});
			return; // leave-room fail, user not join the room
		}
		curRoom.user = curRoom.user.filter((ele) => ele.clientId != socket.id);
		if (curRoom.user.length == 0)
			this.chattingRoom = this.chattingRoom.filter(
				(ele) => ele.roomId != curRoom.roomId,
			);
		socket.emit('leave-room', {
			state: 'Success',
		});
		socket.broadcast.to(data.roomId).emit('leave-room', {
			userId: socket.user.id,
			userNick: socket.user.nick,
		});
		socket.leave(data.roomId);
		return; // leave success
	}

	async kick(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('kick', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // kick fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('kick', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // kick fail, no user
		}
		const targetUser: User = await this.userService.findOneByNick(
			data.target,
		);
		if (!targetUser) {
			socket.emit('kick', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // kick fail, no target user
		}
		const target = this.findUserByUserId(curRoom, targetUser.id);
		if (!target) {
			socket.emit('kick', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // kick fail, no target user
		}
		if (user.clientId == target.clientId) {
			socket.emit('kick', {
				state: 'Fail',
				reason: 'SelfService',
			});
			return;
		}
		if (user.permission < target.permission) {
			curRoom.user = curRoom.user.filter(
				(ele) => ele.clientId != target.clientId,
			);
			socket.emit('kick', {
				state: 'Success',
				target: target.id,
				targetNick: targetUser.nick,
			});
			socket.broadcast.to(data.roomId).emit('kick', {
				userId: socket.user.id,
				userNick: socket.user.nick,
				target: target.id,
				targetNick: targetUser.nick,
			});
			nsp.sockets.get(target.clientId)?.leave(data.roomId);
		}

		return; // kick success
	}

	async ban(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('ban', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // ban fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('ban', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // ban fail, no user
		}
		const targetUser: User = await this.userService.findOneByNick(
			data.target,
		);
		if (!targetUser) {
			socket.emit('ban', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // ban fail, no target user
		}
		const target = this.findUserByUserId(curRoom, targetUser.id);
		if (!target) {
			socket.emit('ban', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // ban fail, no target user
		}
		if (user.clientId == target.clientId) {
			socket.emit('ban', {
				state: 'Fail',
				reason: 'SelfService',
			});
			return;
		}
		if (user.permission < target.permission) {
			curRoom.user = curRoom.user.filter(
				(ele) => ele.clientId != target.clientId,
			);
			socket.emit('ban', {
				state: 'Success',
				target: target.id,
				targetNick: targetUser.nick,
			});
			socket.broadcast.to(data.roomId).emit('ban', {
				userId: socket.user.id,
				userNick: socket.user.nick,
				target: target.id,
				targetNick: targetUser.nick,
			});
			nsp.sockets.get(target.clientId)?.leave(data.roomId);
			curRoom.banList.push(target.id);
		}

		return; // ban success
	}

	async mute(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('mute', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // mute fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('mute', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // mute fail, no user
		}
		const targetUser: User = await this.userService.findOneByNick(
			data.target,
		);
		if (!targetUser) {
			socket.emit('mute', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // mute fail, no target user
		}
		const target = this.findUserByUserId(curRoom, targetUser.id);
		if (!target) {
			socket.emit('mute', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // mute fail, no target user
		}
		if (user.clientId == target.clientId) {
			socket.emit('mute', {
				state: 'Fail',
				reason: 'SelfService',
			});
			return;
		}
		if (user.permission < target.permission) {
			target.mute = +Math.floor(new Date().getTime() / 1000) + +data.time;
			socket.emit('mute', {
				state: 'Success',
				target: target.id,
				targetNick: targetUser.nick,
			});
			nsp.sockets.get(target.clientId)?.emit('mute', {
				userId: socket.user.id,
				userNick: socket.user.nick,
				target: target.id,
				targetNick: targetUser.nick,
			});
		}

		return; // mute success
	}

	async message(socket, data) {
		// this.chattingRoom.forEach(ele => console.log(ele.user));
		// console.log(socket.id);
		// console.log(socket.user.id);
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('message', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // chat fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('message', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // chat fail, no user
		}
		const userNick = await (
			await this.userService.findOneById(user.id)
		).nick;
		if (!userNick) {
			socket.emit('message', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // makeAdmin fail, no user
		}
		if (
			user.mute == 0 ||
			user.mute <= Math.floor(new Date().getTime() / 1000)
		) {
			user.mute = 0;
			socket.emit('message', {
				state: 'Success',
				message: data.message,
			});
			socket.broadcast.to(data.roomId).emit('message', {
				userId: socket.user.id,
				userNick: socket.user.nick,
				message: data.message,
			});
			return; // chat broadcast to curRoom
		} else {
			socket.emit('message', {
				state: 'Fail',
				reason: 'Mute',
			});
			return; // you are muted
		}
	}

	async makeAdmin(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // makeAdmin fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // makeAdmin fail, no user
		}
		const userNick = await (
			await this.userService.findOneById(user.id)
		).nick;
		if (!userNick) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // makeAdmin fail, no user
		}
		if (user.permission == Permission.User) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'PermissionDeny',
			});
			return; // permission denied
		}

		const targetUser: User = await this.userService.findOneByNick(
			data.target,
		);
		if (!targetUser) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // give admin fail, no target user
		}
		const target = this.findUserByUserId(curRoom, targetUser.id);
		if (!target) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // give admin fail, no target user
		}
		if (user.clientId == target.clientId) {
			socket.emit('make-admin', {
				state: 'Fail',
				reason: 'SelfService',
			});
			return;
		}

		target.permission = Permission.Admin;
		socket.emit('make-admin', {
			state: 'Success',
			target: target.id,
			targetNick: targetUser.nick,
		});
		nsp.sockets.get(target.clientId)?.emit('make-admin', {
			userId: user.id,
			userNick: socket.user.nick,
			target: target.id,
			targetNick: targetUser.nick,
		});
		return; // give admin success
	}

	async makeUser(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // makeUser fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // makeUser fail, no user
		}
		const userNick = await (
			await this.userService.findOneById(user.id)
		).nick;
		if (!userNick) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // makeAdmin fail, no user
		}
		if (user.permission != Permission.Owner) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'PermissionDeny',
			});
			return; // permission denied
		}

		const targetUser: User = await this.userService.findOneByNick(
			data.target,
		);
		if (!targetUser) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // take admin fail, no target user
		}
		const target = this.findUserByUserId(curRoom, targetUser.id);
		if (!target) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'NoTarget',
			});
			return; // take admin fail, no target user
		}
		if (user.clientId == target.clientId) {
			socket.emit('make-user', {
				state: 'Fail',
				reason: 'SelfService',
			});
			return;
		}

		target.permission = Permission.User;
		socket.emit('make-user', {
			state: 'Success',
			target: target.id,
			targetNick: targetUser.nick,
		});
		nsp.sockets.get(target.clientId)?.emit('make-user', {
			userId: user.id,
			userNick: socket.user.nick,
			target: target.id,
			targetNick: targetUser.nick,
		});
		return; // take admin success
	}

	setPass(socket, data) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('set-pass', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // setPass fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('set-pass', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // setPass fail, no user
		}
		if (user.permission != Permission.Owner) {
			socket.emit('set-pass', {
				state: 'Fail',
				reason: 'PermissionDeny',
			});
			return; // permission denied
		}
		curRoom.pass = data.pass;
		socket.emit('set-pass', {
			state: 'Success',
		});
		return; // change password success
	}

	destroyRoom(socket, data, nsp: Namespace) {
		const curRoom = this.findRoomByRoomId(data.roomId);
		if (!curRoom) {
			socket.emit('destroy-room', {
				state: 'Fail',
				reason: 'NoRoom',
			});
			return; // destroyRoom fail, no room
		}
		const user = this.findUserByClientId(curRoom, socket.id);
		if (!user) {
			socket.emit('destroy-room', {
				state: 'Fail',
				reason: 'NoUser',
			});
			return; // destroyRoom fail, no user
		}
		if (user.permission != Permission.Owner) {
			socket.emit('destroy-room', {
				state: 'Fail',
				reason: 'PermissionDeny',
			});
			return; // permission denied
		}
		socket.broadcast.to(data.roomId).emit('destroy-room', {
			userId: socket.user.id,
		});
		nsp.in(data.roomId).socketsLeave(data.roomId);
		this.chattingRoom = this.chattingRoom.filter(
			(ele) => ele.roomId != curRoom.roomId,
		);
		socket.emit('destroy-room', {
			state: 'Success',
		});
		return; // destroy room success
	}

	disconnect(socket) {
		const curUser = this.socketList.find(
			(ele) => ele.clientId == socket.id,
		);
		if (curUser) {
			this.socketList = this.socketList.filter(
				(ele) => ele.clientId != socket.id,
			);
			if (!this.socketList.find((ele) => ele.id == curUser.id)) {
				this.userService.userOffline(curUser.id);
			}
		}

		let curRoom = this.findRoomByClientId(socket.id);
		if (!curRoom) return;
		let user = this.findUserByClientId(curRoom, socket.id);
		if (!user) return;
		this.leaveRoom(socket, {
			userId: user.id,
			roomId: curRoom.roomId,
		});
	}

	connect(socket) {
		this.socketList.push({
			id: socket.user.id,
			clientId: socket.id,
		});
		this.userService.userOnline(socket.user.id);
	}

	async checkUser(socket, data) {
		if (socket.user.nick == data.target) return false;
		const room = this.findRoomByRoomId(data.roomId);
		if (!room) return false;
		const target = await this.userService.findOneByNick(data.target);
		if (!target) return false;
		if (this.findUserByUserId(room, target.id)) return true;
		return false;
	}
}
