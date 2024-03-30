import {User} from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DM extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sendDm, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	from: User;

	@ManyToOne(() => User, (user) => user.recvDm, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	to: User;

	// @Column()
	// from: number;

	// @Column()
	// to: number;

	@Column()
	text: string;
}
