import {Logger, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import {Namespace, Socket} from 'socket.io';
import {JwtWsGuard} from 'src/auth/jwt/guard/jwt-ws.guard';
import {ChattingService} from './chatting.service';
import {
	AdminCommandDestroyDto,
	AdminCommandDto,
	AdminCommandMuteDto,
	AdminCommandPassDto,
	InviteChatDto,
} from './dto/command.dto';
import {MessageDto} from './dto/message.dto';
import {CreateRoomDto, JoinRoomDto, LeaveRoomDto} from './dto/room.dto';

@WebSocketGateway({
	namespace: '/chat',
	cors: {origin: '*'},
})
@UseGuards(JwtWsGuard)
export class ChattingGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private chattingService: ChattingService) {}
	private logger = new Logger(ChattingGateway.name);

	@WebSocketServer()
	nsp: Namespace;

	handleConnection(@ConnectedSocket() socket: Socket) {
		this.logger.debug(`/chat [ ${socket.id} ] connected`);
	}

	handleDisconnect(@ConnectedSocket() socket: Socket) {
		this.logger.debug(`/chat [ ${socket.id} ] disconnected`);
		this.chattingService.disconnect(socket);
	}

	@SubscribeMessage('add-list')
	handleAddList(@ConnectedSocket() socket) {
		this.chattingService.connect(socket);
	}

	@SubscribeMessage('get-rooms')
	handleGetRoom(@ConnectedSocket() socket: Socket) {
		const data = this.chattingService.findRoomList();
		socket.emit('get-rooms', data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('create-room')
	handleCreateRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: CreateRoomDto,
	) {
		this.logger.debug(
			`[ ${socket.id} ] create room with password [ ${
				data.pass == null ? null : `"${data.pass}"`
			} ]`,
		);
		this.chattingService.createRoom(socket, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('join-room')
	handleJoinRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: JoinRoomDto,
	) {
		this.logger.debug(
			`[ ${socket.id} ] join room with password [ ${
				data.pass == null ? null : `"${data.pass}"`
			} ]`,
		);
		this.chattingService.joinRoom(socket, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('leave-room')
	handleLeaveRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: LeaveRoomDto,
	) {
		this.logger.debug(`[ ${socket.id} ] leave room`);
		this.chattingService.leaveRoom(socket, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('kick')
	async handleKick(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandDto,
	) {
		this.logger.debug(`[ ${socket.id} ] kick [ ${data.target} ]`);
		await this.chattingService.kick(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('ban')
	async handleBan(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandDto,
	) {
		this.logger.debug(`[ ${socket.id} ] ban [ ${data.target} ]`);
		await this.chattingService.ban(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('mute')
	async handleMute(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandMuteDto,
	) {
		this.logger.debug(
			`[ ${socket.id} ] mute [ ${data.target} ] ${data.time} secs`,
		);
		await this.chattingService.mute(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('message')
	handleMessage(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: MessageDto,
	) {
		this.logger.debug(`[ ${socket.id} ] send message [ ${data.message} ]`);
		this.chattingService.message(socket, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('make-admin')
	async handleMakeAdmin(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandDto,
	) {
		this.logger.debug(`[ ${socket.id} ] make [ ${data.target} ] admin`);
		await this.chattingService.makeAdmin(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('make-user')
	async handleMakeUser(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandDto,
	) {
		this.logger.debug(`[ ${socket.id} ] make [ ${data.target} ] user`);
		await this.chattingService.makeUser(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('set-pass')
	handleSetPass(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandPassDto,
	) {
		this.logger.debug(
			`[ ${socket.id} ] change password to [ ${
				data.pass == null ? null : `"${data.pass}"`
			} ]`,
		);
		this.chattingService.setPass(socket, data);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('destroy-room')
	handleDestroyRoom(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: AdminCommandDestroyDto,
	) {
		this.logger.debug(`[ ${socket.id} ] destroy room`);
		this.chattingService.destroyRoom(socket, data, this.nsp);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('check-user')
	async handleCheckUser(
		@ConnectedSocket() socket: Socket,
		@MessageBody() data: InviteChatDto
	) {
		return await this.chattingService.checkUser(socket, data);
	}
}
