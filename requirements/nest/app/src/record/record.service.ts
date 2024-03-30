import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import {User} from 'src/user/user.entity';
import {UserService} from 'src/user/user.service';
import {Repository} from 'typeorm';
import {CreateRecordDto} from './dto/createRecord.dto';
import {Record} from './record.entity';

@Injectable()
export class RecordService {
	constructor(
		@Inject('RECORD_REPOSITORY')
		private recordRepository: Repository<Record>,
		private userService: UserService,
	) {}
	private readonly logger = new Logger(RecordService.name);

	////////////////////////////////////////
	// async test() {
	// 	return await this.recordRepository.find({
	// 		relations: {
	// 			winner: true,
	// 			loser: true,
	// 		},
	// 	});
	// 	// await this.recordRepository.clear();
	// }
	////////////////////////////////////////

	async createRecord(createRecordDto: CreateRecordDto) {
		const {winnerId, loserId, winnerScore, loserScore, isRank} =
			createRecordDto;
		const winner: User = await this.userService.findOneById(winnerId);
		const loser: User = await this.userService.findOneById(loserId);

		const record = this.recordRepository.create({
			winner,
			loser,
			winnerScore,
			loserScore,
			isRank,
		});

		try {
			await this.recordRepository.save(record);
			this.logger.debug('Record save success');
		} catch (error) {
			this.logger.debug('Record save fail');
			throw new InternalServerErrorException('Record save fail');
		}
		if (isRank) {
			await this.userService.updateMMR(
				winner.id,
				this.ratingFormula(winner.mmr, loser.mmr, 1),
			);
			await this.userService.updateMMR(
				loser.id,
				this.ratingFormula(loser.mmr, winner.mmr, 0),
			);
		}
		return 'success';
	}

	async getWinRecords(id: number, isRank: boolean) {
		return await this.recordRepository.find({
			relations: {
				winner: true,
				loser: true,
			},
			select: {
				winner: {
					id: true,
					nick: true,
				},
				loser: {
					id: true,
					nick: true,
				},
				id: true,
				winnerScore: true,
				loserScore: true,
				isRank: true,
			},
			where: {
				winner: {
					id: id,
				},
				isRank: isRank,
			},
		});
	}

	async getLoseRecords(id: number, isRank: boolean) {
		return await this.recordRepository.find({
			relations: {
				winner: true,
				loser: true,
			},
			select: {
				winner: {
					id: true,
					nick: true,
				},
				loser: {
					id: true,
					nick: true,
				},
				id: true,
				winnerScore: true,
				loserScore: true,
				isRank: true,
			},
			where: {
				loser: {
					id: id,
				},
				isRank: isRank,
			},
		});
	}

	async getAllRecordsWithRank(id: number, isRank: boolean) {
		const win = await this.getWinRecords(id, isRank);
		const lose = await this.getLoseRecords(id, isRank);
		const tmp = win.concat(lose);
		return tmp.sort((a: Record, b: Record) => a.id - b.id);
	}

	async getAllRecords(id: number) {
		const rank = await this.getAllRecordsWithRank(id, true);
		const unrank = await this.getAllRecordsWithRank(id, false);
		const tmp = rank.concat(unrank);
		return tmp.sort((a: Record, b: Record) => a.id - b.id);
	}

	async getRecord(recordId: number) {
		return await this.recordRepository.findOne({
			relations: {
				winner: true,
				loser: true,
			},
			select: {
				winner: {
					id: true,
					nick: true,
				},
				loser: {
					id: true,
					nick: true,
				},
				id: true,
				winnerScore: true,
				loserScore: true,
				isRank: true,
			},
			where: {
				id: recordId,
			},
		});
	}

	ratingFormula(me: number, op: number, res: number) {
		const K = 20.0;
		const expect = 1.0 / (1.0 + Math.pow(10, (me - op) / 400));
		return Math.round(me + K * (res - expect));
	}
}
