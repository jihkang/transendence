import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import {JwtGuard} from 'src/auth/jwt/guard/jwt.guard';
import {GetUser} from 'src/decorator/user.decorator';
import {DmService} from './dm.service';
import {SendDmDto} from './dto/sendDm.dto';

@Controller('dm')
export class DmController {
	constructor(private dmService: DmService) {}

///////////////////////////////
	// @Get('dev')
	// async gettest() {
	// 	return await this.dmService.gettest();
	// }
///////////////////////////////

	@UseGuards(JwtGuard)
	@Get('send')
	async getSendMessage(@GetUser() user) {
		return await this.dmService.getSendMessage(user.id);
	}

	@UseGuards(JwtGuard)
	@Get('recv')
	async getRecvMessage(@GetUser() user) {
		return await this.dmService.getRecvMessage(user.id);
	}

	@UseGuards(JwtGuard)
	@Get(':id')
	async getMessage(
		@GetUser() user,
		@Param('id', ParseIntPipe) msgId: number,
	) {
		return await this.dmService.getMessage(user.id, msgId);
	}

	@UseGuards(JwtGuard)
	@Post()
	async newMessage(
		@GetUser() user,
		@Body(ValidationPipe) sendDmDto: SendDmDto,
	) {
		return await this.dmService.newMessage(user.id, sendDmDto);
	}

	@UseGuards(JwtGuard)
	@Delete(':id')
	async deleteMessage(
		@GetUser() user,
		@Param('id', ParseIntPipe) msgId: number,
	) {
		return await this.dmService.deleteMessage(user.id, msgId);
	}
}
