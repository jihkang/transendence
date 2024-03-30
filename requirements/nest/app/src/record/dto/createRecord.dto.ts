import {IsBoolean, IsNumber} from 'class-validator';

export class CreateRecordDto {
	@IsNumber()
	winnerId: number;

	@IsNumber()
	loserId: number;

	@IsNumber()
	winnerScore: number;

	@IsNumber()
	loserScore: number;

	@IsBoolean()
	isRank: boolean;
}
