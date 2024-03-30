import {
	IsAlphanumeric,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class AdminCommandDto {
	@IsString()
	roomId: string;

	@IsAlphanumeric()
	@MinLength(4)
	@MaxLength(20)
	target: string;
}

export class AdminCommandMuteDto {
	@IsString()
	roomId: string;

	@IsAlphanumeric()
	@MinLength(4)
	@MaxLength(20)
	target: string;

	@IsNumber()
	time: number;
}

export class AdminCommandPassDto {
	@IsString()
	roomId: string;

	@IsOptional()
	@IsAlphanumeric()
	@MinLength(3)
	@MaxLength(10)
	pass: string;
}

export class AdminCommandDestroyDto {
	@IsString()
	roomId: string;
}

export class InviteChatDto {
	@IsAlphanumeric()
	@MinLength(4)
	@MaxLength(20)
	target: string;

	@IsString()
	roomId: string;
}
