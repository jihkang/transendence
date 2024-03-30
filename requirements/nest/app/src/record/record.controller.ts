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
import {CreateRecordDto} from './dto/createRecord.dto';
import {RecordService} from './record.service';

@Controller('record')
export class RecordController {
	constructor(private recordService: RecordService) {}

	//////////////////////////
	// @Get('test')
	// async test() {
	// 	return await this.recordService.test();
	// }
	//////////////////////////

	@Post()
	async createNewRecord(
		@Body(ValidationPipe) createRecordDto: CreateRecordDto,
	) {
		return await this.recordService.createRecord(createRecordDto);
	}

	@UseGuards(JwtGuard)
	@Get('unrank/:id')
	async getMyUnRankRecords(@Param('id', ParseIntPipe) id: number) {
		return await this.recordService.getAllRecordsWithRank(id, false);
	}

	@UseGuards(JwtGuard)
	@Get('rank/:id')
	async getMyRankRecords(@Param('id', ParseIntPipe) id: number) {
		return await this.recordService.getAllRecordsWithRank(id, true);
	}

	@UseGuards(JwtGuard)
	@Get('game/:id')
	async getOneRecord(@Param('id', ParseIntPipe) id: number) {
		return await this.recordService.getRecord(id);
	}

	@UseGuards(JwtGuard)
	@Get(':id')
	async getMyRecords(@Param('id', ParseIntPipe) id: number) {
		return await this.recordService.getAllRecords(id);
	}
}
