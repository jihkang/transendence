import {forwardRef, Module} from '@nestjs/common';
import {DmService} from './dm.service';
import {DatabaseModule} from 'src/database/database.module';
import {dmProviders} from './dm.providers';
import {DmController} from './dm.controller';
import {RelationModule} from 'src/relation/relation.module';
import {UserModule} from 'src/user/user.module';
import {UserService} from 'src/user/user.service';

@Module({
	imports: [DatabaseModule, RelationModule, UserModule],
	providers: [DmService, ...dmProviders],
	controllers: [DmController],
	exports: [DmService],
})
export class DmModule {}
