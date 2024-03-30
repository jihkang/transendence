import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import {JwtGuard} from 'src/auth/jwt/guard/jwt.guard';
import {GetUser} from 'src/decorator/user.decorator';
import {PostRelationDto} from './dto/postRelation.dto';
import {Relation} from './relation.entity';
import {RelationService} from './relation.service';

@Controller('relation')
export class RelationController {
	constructor(private relationService: RelationService) {}
	private logger = new Logger(RelationController.name);

	/////////////////////////////////
	// @Post('test')
	// test(@Body() postRelationDto: PostRelationDto) {
	// 	return this.relationService.createRelation(postRelationDto);
	// }

	// @Get('dev')
	// async gettest() {
	// 	return await this.relationService.gettest();
	// }
	/////////////////////////////////

	@UseGuards(JwtGuard)
	@Get()
	async getAllRelation(@GetUser() user) {
		const following: Relation[] =
			await this.relationService.findActingWithState(user.id, true);
		const follower: Relation[] =
			await this.relationService.findActedWithState(user.id, true);
		const block: Relation[] =
			await this.relationService.findActingWithState(user.id, false);

		return {
			following: following,
			follower: follower,
			block: block,
		};
	}

	@UseGuards(JwtGuard)
	@Get('block')
	async getBlock(@GetUser() user) {
		return await this.relationService.findActingWithState(user.id, false);
	}

	@UseGuards(JwtGuard)
	@Get('following')
	async getFollowing(@GetUser() user) {
		return await this.relationService.findActingWithState(user.id, true);
	}

	@UseGuards(JwtGuard)
	@Get('follower')
	async getFollower(@GetUser() user) {
		return await this.relationService.findActedWithState(user.id, true);
	}

	@UseGuards(JwtGuard)
	@Get('checkFollow/:actedId')
	async checkRelation(
		@GetUser() user,
		@Param('actedId', ParseIntPipe) actedId: number,
	) {
		return this.relationService.isFollow(user.id, actedId);
	}

	@UseGuards(JwtGuard)
	@Get('checkBlock/:actedId')
	async checkBlock(
		@GetUser() user,
		@Param('actedId', ParseIntPipe) actedId: number,
	) {
		return this.relationService.isBlock(user.id, actedId);
	}

	@UseGuards(JwtGuard)
	@Post()
	async createRelation(
		@GetUser() user,
		@Body(ValidationPipe) postRelationDto: PostRelationDto,
	) {
		this.relationService.checkPostRelationDto(user.id, postRelationDto);
		return await this.relationService.createRelation(user.id, postRelationDto);
	}

	@UseGuards(JwtGuard)
	@Post('delete')
	async deleteRelation(
		@GetUser() user,
		@Body(ValidationPipe) postRelationDto: PostRelationDto,
	) {
		this.relationService.checkPostRelationDto(user.id, postRelationDto);
		return await this.relationService.deleteRelation(user.id, postRelationDto);
	}
}
