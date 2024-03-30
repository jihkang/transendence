import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import {User} from 'src/user/user.entity';
import {UserService} from 'src/user/user.service';
import {Repository} from 'typeorm';
import {PostRelationDto} from './dto/postRelation.dto';
import {Relation} from './relation.entity';

@Injectable()
export class RelationService {
	constructor(
		@Inject('RELATION_REPOSITORY')
		private relationRepository: Repository<Relation>,
		private userService: UserService,
	) {}
	private readonly logger = new Logger(RelationService.name);

	///////////////////////////
	// async gettest() {
	// 	return await this.relationRepository.find({
	// 		relations: {
	// 			acting: true,
	// 			acted: true,
	// 		},
	// 		select: {
	// 			// id: true,
	// 			// follow: true,
	// 			acting: {
	// 				id: true,
	// 				nick: true,
	// 			},
	// 			acted: {
	// 				id: true,
	// 				nick: true,
	// 			}
	// 		}
	// 	});
	// }
	///////////////////////////

	async createRelation(actingId: number, postRelationDto: PostRelationDto) {
		const {actedId, follow} = postRelationDto;
		const acting = await this.userService.findOneById(actingId);
		const acted = await this.userService.findOneById(actedId);
		if (!acting || !acted) return;

		const isRelated = await this.relationRepository.findOne({
			relations: {
				acted: true,
				acting: true,
			},
			where: {
				acted: {
					id: actedId,
				},
				acting: {
					id: actingId,
				},
				follow: follow,
			},
			select: {
				id: true,
				acted: {
					id: true,
					nick: true,
					status: true,
				},
				acting: {
					id: true,
					nick: true,
					status: true,
				},
			}
		});
		if (isRelated) return isRelated;

		const relation = this.relationRepository.create({
			acting,
			acted,
			follow,
		});

		try {
			await this.relationRepository.save(relation);
			this.logger.debug('Relation save success');
		} catch (error) {
			this.logger.debug('Relation save fail');
			throw new InternalServerErrorException('Relation save fail');
		}
		return relation;
	}

	async deleteRelation(actingId: number, postRelationDto: PostRelationDto) {
		const {actedId, follow} = postRelationDto;
		await this.relationRepository.delete({
			acted: {
				id: actedId,
			},
			acting: {
				id: actingId,
			},
			follow: follow,
		});
	}

	async findActingWithState(id: number, follow: boolean) {
		return await this.relationRepository.find({
			relations: {
				acting: true,
				acted: true,
			},
			where: {
				acting: {
					id: id,
				},
				follow: follow,
			},
			select: {
				id: true,
				follow: true,
				acting: {
					id: true,
					nick: true,
					status: true,
				},
				acted: {
					id: true,
					nick: true,
					status: true,
				}
			}
		});
	}

	async findActedWithState(id: number, follow: boolean) {
		return await this.relationRepository.find({
			relations: {
				acting: true,
				acted: true,
			},
			where: {
				acted: {
					id: id,
				},
				follow: follow,
			},
			select: {
				id: true,
				follow: true,
				acting: {
					id: true,
					nick: true,
					status: true,
				},
				acted: {
					id: true,
					nick: true,
					status: true,
				}
			}
		});
	}

	async isBlock(id: number, blockedId: number) {
		return (
			(await this.relationRepository.countBy({
				acting: {
					id: id,
				},
				acted: {
					id: blockedId,
				},
				follow: false,
			})) > 0
		);
	}

	async isFollow(id: number, blockedId: number) {
		return (
			(await this.relationRepository.countBy({
				acting: {
					id: id,
				},
				acted: {
					id: blockedId,
				},
				follow: true,
			})) > 0
		);
	}

	checkPostRelationDto(actingId: number, postRelationDto: PostRelationDto) {
		if (postRelationDto.actedId === actingId) {
			if (postRelationDto.follow)
				throw new InternalServerErrorException('Follow myself');
			else
				throw new InternalServerErrorException('Block myself');
		}
	}
}
