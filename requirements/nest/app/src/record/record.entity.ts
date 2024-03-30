import {User} from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Record extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.winRecords, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	winner: User;

	@ManyToOne(() => User, (user) => user.loseRecords, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	loser: User;

	@Column()
	winnerScore: number;

	@Column()
	loserScore: number;

	@Column()
	isRank: boolean;
}
