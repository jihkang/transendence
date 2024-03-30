import {DataSource} from 'typeorm';
import {DM} from './dm.entity';

export const dmProviders = [
	{
		provide: 'DM_REPOSITORY',
		useFactory: (dataSource: DataSource) => dataSource.getRepository(DM),
		inject: ['DATA_SOURCE'],
	},
];
