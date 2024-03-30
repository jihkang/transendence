import {IsBoolean, IsNumber} from 'class-validator';

export class PostRelationDto {
	@IsNumber()
	actedId: number;

	@IsBoolean()
	follow: boolean;
}
