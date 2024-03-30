import {
	Body,
	Controller,
	Get,
	Logger,
	Post,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	ValidationPipe,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {FormDataRequest} from 'nestjs-form-data';
import {GetUser} from 'src/decorator/user.decorator';
import {multerOptions} from 'src/file/multer.options';
import {UserService} from 'src/user/user.service';
import {FtAuthGuard} from './42/guard/ft.guard';
import {AuthService} from './auth.service';
import {CheckCodeDto} from './dto/checkCode.dto';
import {AuthUpdateDto} from './dto/user.update.dto';
import UserRegisterType from './enum.user.register.type';
import {JwtGuard} from './jwt/guard/jwt.guard';

@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Get()
	async oauth(@Res() res: Response) {
		this.logger.debug('redirect to 42oauth page');
		res.redirect(
			`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENTID}&redirect_uri=${process.env.REDIRECTURI}&response_type=code`,
		);
	}

	@UseGuards(JwtGuard)
	@Post('initialize')
	@UseInterceptors(FileInterceptor('image', multerOptions))
	async uploadFile(
		@GetUser() user,
		@Body(ValidationPipe) authUpdateDto: AuthUpdateDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		return await this.authService.updateUser(
			user.id,
			authUpdateDto.name,
			file,
		);
	}

	@UseGuards(JwtGuard)
	@Get('twoFactor')
	async twoFactorAuth(@GetUser() user) {
		await this.authService.twoFactorPublish(user.id);
	}

	@UseGuards(JwtGuard)
	@Post('twoFactor')
	checkMail(
		@GetUser() user,
		@Body(ValidationPipe) checkCodeDto: CheckCodeDto,
	) {
		return this.authService.checkMail(user.id, +checkCodeDto.code);
	}

	@UseGuards(FtAuthGuard)
	@Get('redirect')
	async redirect(@GetUser() user, @Res() res: Response) {
		this.logger.debug('redirect api');
		let state: string = 'login';

		if (await this.authService.isUUID(user.user.id)) {
			this.logger.debug('UUID');
			state = 'initialize';
		} else if (user.status === UserRegisterType.PASS) {
			this.logger.debug('HOME');
			state = 'login';
		} else if (user.status === UserRegisterType.TWO_FACTOR_LOGIN) {
			this.logger.debug('TWO_FACTOR');
			state = 'twoFactor';
		} else if (user.status === UserRegisterType.FIRST_LOGIN) {
			this.logger.debug('FIRST_LOGIN');
			state = 'initialize';
		}
		const {accessToken, ...accessOption} =
			await this.authService.getAccessToken(user.user.id, state);
		res.cookie('Auth', accessToken, accessOption);
		res.redirect(`http://localhost:42421/loading`);
	}

	@UseGuards(JwtGuard)
	@Get('login')
	async login(@GetUser() user, @Res() res: Response) {
		let state: string;
		if (await this.userService.isTwoFactor(user.id)) state = 'twoFactor';
		else state = 'login';
		const {accessToken, ...accessOption} =
			await this.authService.getAccessToken(user.id, state);
		res.cookie('Auth', accessToken, accessOption);
		res.redirect(`http://localhost:42421/loading`);
	}

	@UseGuards(JwtGuard)
	@Get('twoFactorLogin')
	async twoFactorLogin(@GetUser() user, @Res() res: Response) {
		const {accessToken, ...accessOption} =
			await this.authService.getAccessToken(user.id, 'login');
		res.cookie('Auth', accessToken, accessOption);
		res.redirect(`http://localhost:42421/loading`);
	}

	@UseGuards(JwtGuard)
	@Get('logout')
	async logout(@GetUser() user, @Res() res: Response) {
		this.userService.userOffline(user.id);
		const accessOption = this.authService.getCookiesForLogOut();
		res.cookie('Auth', '', accessOption);
		res.send();
	}
}
