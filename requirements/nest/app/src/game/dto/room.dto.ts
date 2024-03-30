import {
	IsAlphanumeric,
	IsBoolean,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';

export class CreateRoomDto {
	// test
	@IsNumber()
	@IsIn([1, 2, 4])
	speed: number;

	@IsOptional()
	@IsBoolean()
	visual?: boolean;
}

export class RoomDto {
	@IsString()
	roomId: string;
}

export class InviteDto {
	@IsNumber()
	targetId: number;

	@IsString()
	roomId: string;
}

export class InviteChatDto {
	@IsAlphanumeric()
	@Length(4, 20)
	nick: string;

	@IsString()
	roomId: string;
}

export class InviteRejectDto {
	@IsString()
	roomId: string;
}

export class KeyInDto {
	@IsString()
	roomId: string;

	@IsIn(['ArrowDown', 'ArrowUp'])
	key: string;
}
