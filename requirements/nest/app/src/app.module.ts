import {Module} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {DatabaseModule} from './database/database.module';
import {ConfigModule} from '@nestjs/config';
import {ServeStaticModule} from '@nestjs/serve-static';
import {RecordModule} from './record/record.module';
import {GameModule} from './game/game.module';
import {ChattingModule} from './chatting/chatting.module';
import {DmModule} from './dm/dm.module';
import {RelationModule} from './relation/relation.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: '/public',
		}),
		UserModule,
		AuthModule,
		DatabaseModule,
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		RecordModule,
		RelationModule,
		GameModule,
		ChattingModule,
		DmModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
