import {
	IsAlphanumeric,
	IsOptional,
	IsString,
	Length,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateRoomDto {
	@IsString()
	@Length(4, 20)
	roomName: string;

	@IsOptional()
	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(10)
	pass: string;
}

export class JoinRoomDto {
	@IsString()
	roomId: string;

	@IsOptional()
	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(10)
	pass: string;
}

export class LeaveRoomDto {
	@IsString()
	roomId: string;
}
