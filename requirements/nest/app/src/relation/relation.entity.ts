import {User} from 'src/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Relation extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.acting, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	acting: User;

	@ManyToOne(() => User, (user) => user.acted, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	acted: User;

	@Column()
	follow: boolean;
}
