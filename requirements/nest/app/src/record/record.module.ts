import {Module} from '@nestjs/common';
import {DatabaseModule} from 'src/database/database.module';
import {UserModule} from 'src/user/user.module';
import {RecordController} from './record.controller';
import {recordProviders} from './record.providers';
import {RecordService} from './record.service';

@Module({
	imports: [DatabaseModule, UserModule],
	providers: [RecordService, ...recordProviders],
	controllers: [RecordController],
	exports: [RecordService],
})
export class RecordModule {}
