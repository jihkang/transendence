import {ChattingUser} from './chatting.chattingUser';

export class ChattingRoom {
	roomName: string;

	roomId: string;

	pass: number | null;

	user: ChattingUser[];

	banList: number[];
}

export class roomList {
	roomName: string;

	roomId: string;

	userCount: number;
}