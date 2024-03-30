import {Logger, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import {Namespace, Socket} from 'socket.io';
import {JwtWsGuard} from 'src/auth/jwt/guard/jwt-ws.guard';
import {
	CreateRoomDto,
	InviteChatDto,
	InviteDto,
	InviteRejectDto,
	KeyInDto,
	RoomDto,
} from './dto/room.dto';
import {GameService} from './game.service';

@WebSocketGateway({
	namespace: '/game',
	cors: {origin: '*'},
})
@UseGuards(JwtWsGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private gameService: GameService) {}
	private logger = new Logger(GameGateway.name);

	@WebSocketServer()
	nsp: Namespace;

	handleConnection(@ConnectedSocket() socket: Socket) {
		this.logger.debug(`/game [ ${socket.id} ] connected`);
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.logger.debug(`/game [ ${socket.id} ] disconnected`);
		this.gameService.disconnect(socket, this.nsp);
	}

	// @SubscribeMessage('test')
	// test(@ConnectedSocket() socket: Socket) {
	// 	socket.emit('test', this.gameService.test());
	// }

	@SubscribeMessage('add-list')
	handleAddList(@ConnectedSocket() socket) {
		this.gameService._pushList(socket);
	}

	@SubscribeMessage('get-rooms')
	handleGetRoom(@ConnectedSocket() socket: Socket) {
		const data = this.gameService.findAllRoom();
		socket.emit('get-rooms', data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('create-room')
	handleCreateRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: CreateRoomDto,
	) {
		this.gameService.createRoom(socket, this.nsp, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('match-making')
	async handleMatchMaking(@ConnectedSocket() socket: Socket) {
		await this.gameService.makeMatchmaking(socket, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('cancel-match-making')
	handleCancelMatchMaking(@ConnectedSocket() socket: Socket) {
		this.gameService.cancelMatchMaking(socket);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('join-room')
	async handleJoinRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: RoomDto,
	) {
		await this.gameService.joinRoom(socket, this.nsp, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('invite-room')
	handleInviteRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: InviteDto,
	) {
		this.gameService.inviteRoom(socket, this.nsp, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('invite-room-chat')
	async handleInviteRoomChat(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: InviteChatDto,
	) {
		await this.gameService.inviteRoomChat(socket, this.nsp, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('invite-reject')
	handleInviteReject(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: InviteRejectDto,
	) {
		this.gameService.inviteReject(socket, this.nsp, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('key-in')
	handlePlaying(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: KeyInDto,
	) {
		this.gameService.keyIn(socket, data);
	}

	@SubscribeMessage('render')
	async handleInterval(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: RoomDto,
	) {
		await this.gameService.gameApp(socket, this.nsp, data);
	}

	@SubscribeMessage('page')
	handlePage(@ConnectedSocket() socket: Socket) {
		this.gameService.reset(socket, this.nsp);
		return 'success';
	}
}
