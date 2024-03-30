import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import {RelationService} from 'src/relation/relation.service';
import {UserService} from 'src/user/user.service';
import {Repository} from 'typeorm';
import {DM} from './dm.entity';
import {SendDmDto} from './dto/sendDm.dto';

@Injectable()
export class DmService {
	constructor(
		@Inject('DM_REPOSITORY')
		private dmRepository: Repository<DM>,
		private relationService: RelationService,
		private userService: UserService,
	) {}

	private logger = new Logger(DmService.name);

	//////////////////////////////
	// async gettest() {
	// 	return this.dmRepository.find({
	// 		relations: {
	// 			from: true,
	// 			to: true,
	// 		},
	// 		select: {
	// 			from: {
	// 				id: true,
	// 				nick: true,
	// 			},
	// 			to: {
	// 				id: true,
	// 				nick: true,
	// 			},
	// 		},
	// 	});
	// }
	//////////////////////////////

	/*
	 * 내가 보낸 메세지 전부 보기
	 */
	async getSendMessage(id: number) {
		return await this.dmRepository.find({
			relations: {
				from: true,
				to: true,
			},
			select: {
				from: {
					id: true,
					nick: true,
				},
				to: {
					id: true,
					nick: true,
				},
			},
			where: {
				from: {
					id: id,
				},
			},
		});
	}

	/*
	 * 내가 받은 메세지 전부 보기
	 */
	async getRecvMessage(id: number) {
		let res = await this.dmRepository.find({
			relations: {
				from: true,
				to: true,
			},
			select: {
				from: {
					id: true,
					nick: true,
				},
				to: {
					id: true,
					nick: true,
				},
			},
			where: {
				to: {
					id: id,
				},
			},
		});
		if (!res) return;
		const block = await this.relationService.findActingWithState(id, false);
		if (!block) return res;
		res = res.filter(
			(ele) => !(block.find((bele) => bele.acted.id == ele.from.id)),
		);
		return res;
	}

	async getMessage(id: number, msgId: number) {
		const msg = await this.dmRepository.findOne({
			relations: {
				from: true,
				to: true,
			},
			select: {
				from: {
					id: true,
					nick: true,
				},
				to: {
					id: true,
					nick: true,
				},
			},
			where: {
				id: msgId,
			},
		});
		if (!msg) return;
		if (msg.from.id != id && msg.to.id != id) return;
		if (await this.relationService.isBlock(id, msg.from.id)) return;
		return msg;
	}

	async newMessage(id: number, sendDmDto: SendDmDto) {
		const {toId, message} = sendDmDto;
		const to = await this.userService.findOneById(toId);
		const from = await this.userService.findOneById(id);
		const newMsg = this.dmRepository.create({
			from: from,
			to: to,
			text: message,
		});
		try {
			await this.dmRepository.save(newMsg);
			this.logger.debug('Message save success');
		} catch (error) {
			this.logger.debug('Message save fail');
			throw new InternalServerErrorException('Message save fail');
		}
		return newMsg;
	}

	async deleteMessage(id: number, msgId: number) {
		const msg = await this.dmRepository.findOne({
			relations: {
				from: true,
			},
			select: {
				from: {
					id: true,
				},
			},
			where: {
				id: msgId,
			},
		});
		if (!msg) return;
		if (msg.from.id != id) return;
		return await this.dmRepository.delete({id: msgId});
	}
}
