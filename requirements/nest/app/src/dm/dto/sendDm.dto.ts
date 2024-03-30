import {IsNumber, IsString} from 'class-validator';

export class SendDmDto {
	@IsString()
	message: string;

	@IsNumber()
	toId: number;
}
