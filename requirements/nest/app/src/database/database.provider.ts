import {DataSource} from 'typeorm';

export const databaseProviders = [
	{
		provide: 'DATA_SOURCE',
		useFactory: async () => {
			const dataSource = new DataSource({
				type: 'postgres', // db 종류
				host: 'postgres', // host ip, container 이름으로 설정
				port: 5432, // container port
				username: process.env.POSTGRES_USER,
				password: process.env.POSTGRES_PASSWORD,
				database: process.env.POSTGRES_DB,
				entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 엔티티 파일의 위치?
				synchronize: true,
			});

			return dataSource.initialize();
		},
	},
];
