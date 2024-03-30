import {forwardRef, Module} from '@nestjs/common';
import {RelationService} from './relation.service';
import {RelationController} from './relation.controller';
import {relationProviders} from './relation.provider';
import {DatabaseModule} from 'src/database/database.module';
import {UserModule} from 'src/user/user.module';
import {UserService} from 'src/user/user.service';

@Module({
	imports: [DatabaseModule, UserModule],
	controllers: [RelationController],
	providers: [RelationService, ...relationProviders],
	exports: [RelationService],
})
export class RelationModule {}
