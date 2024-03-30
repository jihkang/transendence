import {Module} from '@nestjs/common';
import {ChattingService} from './chatting.service';
import {ChattingGateway} from './chatting.gateway';
import {UserModule} from 'src/user/user.module';
import {UserService} from 'src/user/user.service';

@Module({
	imports: [UserModule],
	providers: [ChattingService, ChattingGateway, UserService],
})
export class ChattingModule {}
