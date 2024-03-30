import {forwardRef, Module} from '@nestjs/common';
import {UserService} from './user.service';
import {DatabaseModule} from 'src/database/database.module';
import {userProviders} from './user.providers';
import {UserController} from './user.controller';
import {DmModule} from 'src/dm/dm.module';

@Module({
	imports: [DatabaseModule],
	controllers: [UserController],
	providers: [...userProviders, UserService],
	exports: [...userProviders, UserService],
})
export class UserModule {}
