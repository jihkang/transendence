import {IsNumber} from 'class-validator';

export class ChechRelationDto {
	@IsNumber()
	actingId: number;

	@IsNumber()
	actedId: number;
}
