import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	ValidationPipe,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {JwtGuard} from 'src/auth/jwt/guard/jwt.guard';
import {GetUser} from 'src/decorator/user.decorator';
import {multerOptions} from 'src/file/multer.options';
import {UserUpdateDto} from './dto/user.update.dto';
import {User} from './user.entity';
import {UserService} from './user.service';

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	////////////////////////////////////////////
	// @Get('dev')
	// findAll(): Promise<User[]> {
	// 	return this.userService.findAll();
	// }

	// @Delete('dev')
	// removeAll(): Promise<void> {
	// 	return this.userService.removeAll();
	// }
	////////////////////////////////////////////

	@UseGuards(JwtGuard)
	@Get()
	async getUser(@GetUser() user) {
		return await this.userService.findOneById(user.id);
	}

	@UseGuards(JwtGuard)
	@Get('other/:id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		return await this.userService.findOneById(id);
	}

	@UseGuards(JwtGuard)
	@Get('onlineUser')
	async findOnlineUser(@GetUser() user) {
		return await this.userService.findOnlineUser(user.id);
	}

	@UseGuards(JwtGuard)
	@Post('updateProfile')
	@UseInterceptors(FileInterceptor('image', multerOptions))
	async updateProfile(
		@GetUser() user,
		@UploadedFile() image: Express.Multer.File,
	) {
		return await this.userService.updateProfile(user.id, image.filename);
	}

	@UseGuards(JwtGuard)
	@Post('updateNick')
	async updateNick(
		@GetUser() user,
		@Body(ValidationPipe) updateUserDto: UserUpdateDto,
	) {
		return await this.userService.updateNick(user.id, updateUserDto.name);
	}

	@UseGuards(JwtGuard)
	@Post('updateTwoFactor')
	async updateTwoFactor(
		@GetUser() user,
		@Body('twoFactor', ParseBoolPipe) twoFactor: boolean
	) {
		return await this.userService.updateTwoFactor(user.id, twoFactor);
	}
}
