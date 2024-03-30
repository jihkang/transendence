import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {Socket} from 'socket.io';
import {UserService} from 'src/user/user.service';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
	constructor(private readonly userService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(socket: Socket) => {
					var cookie = require('cookie');
					const res = cookie.parse(socket.handshake.headers.cookie).Auth;
					if (res)
						return res;
					return;
				},
			]),
			secretOrKey: process.env.JWT_ACCESSTOKEN_SECRET,
		});
	}

	async validate(payload: any) {
		return this.userService.findOneById(payload.id);
	}
}
