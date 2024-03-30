import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {UserModule} from 'src/user/user.module';
import {FTStrategy} from './42/ft.strategy';
import {HttpModule} from '@nestjs/axios';
import {JwtModule} from '@nestjs/jwt';
import {DatabaseModule} from 'src/database/database.module';
import {PassportModule} from '@nestjs/passport';
import {UserService} from 'src/user/user.service';
import {JwtStrategy} from './jwt/strategy/jwt.stratagy';
import {JwtWsStrategy} from './jwt/strategy/jwt-ws.stratagy';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
	imports: [
		NestjsFormDataModule,
		UserModule,
		HttpModule,
		DatabaseModule,
		PassportModule.register({defaultStrategy: 'jwt'}),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_ACCESSTOKEN_SECRET,
			signOptions: {expiresIn: `${process.env.JWT_ACCESSTOKEN_EXPIRE}s`},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		UserService,
		FTStrategy,
		JwtStrategy,
		JwtWsStrategy,
	],
	exports: [AuthService],
})
export class AuthModule {}
