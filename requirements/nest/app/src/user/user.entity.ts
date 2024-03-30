import {DM} from 'src/dm/dm.entity';
import {Record} from 'src/record/record.entity';
import {Relation} from 'src/relation/relation.entity';
import {
	BaseEntity,
	Column,
	Entity,
	OneToMany,
	PrimaryColumn,
	Unique,
} from 'typeorm';

export enum Status {
	ONLINE,
	OFFLINE,
	ONGAME,
}

@Entity()
@Unique(['nick'])
export class User extends BaseEntity {
	@PrimaryColumn()
	id: number;

	@Column()
	nick: string;

	@Column()
	email: string;

	@Column()
	profileUrl: string;

	@Column({default: false})
	twoFactorAuth: boolean;

	@Column()
	status: Status;

	@Column({default: 1000})
	mmr: number;

	@OneToMany(() => Record, (record) => record.winner, {nullable: true})
	winRecords: Record[];

	@OneToMany(() => Record, (record) => record.loser, {nullable: true})
	loseRecords: Record[];

	@OneToMany(() => Relation, (relation) => relation.acting, {nullable: true})
	acting: Relation[];

	@OneToMany(() => Relation, (relation) => relation.acted, {nullable: true})
	acted: Relation[];

	@OneToMany(() => DM, (dm) => dm.from, {nullable: true})
	sendDm: DM[];

	@OneToMany(() => DM, (dm) => dm.to, {nullable: true})
	recvDm: DM[];
}
