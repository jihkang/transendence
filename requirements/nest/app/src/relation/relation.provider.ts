import {DataSource} from 'typeorm';
import {Relation} from './relation.entity';

export const relationProviders = [
	{
		provide: 'RELATION_REPOSITORY',
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(Relation),
		inject: ['DATA_SOURCE'],
	},
];
