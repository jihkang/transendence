import {
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import {Not, Repository} from 'typeorm';
import {Status, User} from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@Inject('USER_REPOSITORY')
		private userRepository: Repository<User>, // private dmService: DmService,
	) {}

	///////////////////////////////////////////
	// async findAll(): Promise<User[]> {
	// 	return await this.userRepository.find();
	// }

	// async removeAll(): Promise<void> {
	// 	await this.userRepository.delete({});
	// }

	// async test() {}
	///////////////////////////////////////////

	// find user
	async findOneById(id: number): Promise<User> {
		const user = await this.userRepository.findOneBy({id: id});
		if (user) return user;
		throw new NotFoundException('No user exists with that Id');
	}

	async findOneByNick(nick: string): Promise<User> {
		const user = await this.userRepository.findOneBy({nick: nick});
		if (user) return user;
		throw new NotFoundException('No user exists with that Nick');
	}

	async findOnlineUser(id: number) {
		const onlineE = await this.userRepository.find({
			where: {
				id: Not(id),
				status: Status.ONLINE,
			},
			select: {
				id: true,
				nick: true,
			},
		});
		const onGame = await this.userRepository.find({
			where: {
				id: Not(id),
				status: Status.ONGAME,
			},
			select: {
				id: true,
				nick: true,
			},
		});
		const online = onlineE.filter((ele) => ele.nick.length <= 20);
		return {online, onGame};
	}

	async isTwoFactor(id: number) {
		const user = await this.findOneById(id);
		return user.twoFactorAuth;
	}

	// update user
	async updateNick(id: number, nick: string) {
		const curUser = await this.userRepository.findOneBy({nick: nick});
		if (curUser) return {state: 'fail', reason: 'Already used nickname'};

		let user = await this.findOneById(id);
		user.nick = nick;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}

	async updateProfile(id: number, profileName: string) {
		let user = await this.findOneById(id);

		const oriPic = user.profileUrl.replace(
			`http://localhost:${process.env.BACK_PORT}/`,
			'/public/',
		);

		user.profileUrl =
			`http://localhost:${process.env.BACK_PORT}/` + profileName;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		const fs = require('fs');
		fs.exists(oriPic, function (exists) {
			if (exists) fs.unlinkSync(oriPic);
		});

		return user;
	}

	async updateTwoFactor(id: number, twoFactor: boolean) {
		let user = await this.findOneById(id);
		user.twoFactorAuth = twoFactor;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}

	async updateMMR(id: number, mmr: number) {
		let user = await this.findOneById(id);
		if (mmr < 0) mmr = 0;
		else if (mmr > 2000) mmr = 2000;
		user.mmr = mmr;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}

	async userOnline(id: number) {
		const user = await this.findOneById(id);
		user.status = Status.ONLINE;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}

	async userOffline(id: number) {
		const user = await this.findOneById(id);
		user.status = Status.OFFLINE;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}

	async userOnGame(id: number) {
		const user = await this.findOneById(id);
		user.status = Status.ONGAME;
		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('User save fail');
		}
		return user;
	}
}
