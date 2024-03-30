import {Module} from '@nestjs/common';
import {RecordModule} from 'src/record/record.module';
import {GameGateway} from './game.gateway';
import {GameService} from './game.service';
import { UserModule } from 'src/user/user.module';
import { ChattingModule } from 'src/chatting/chatting.module';

@Module({
	imports: [RecordModule, UserModule],
	providers: [GameService, GameGateway],
})
export class GameModule {}
