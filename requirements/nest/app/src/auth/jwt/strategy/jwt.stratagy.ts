import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UserService} from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private readonly userService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: any) => {
					// console.log(request);
					let token = null;
					if (request && request.cookies) {
						token = request?.cookies?.Auth;
					}
					return token;
				},
			]),
			secretOrKey: process.env.JWT_ACCESSTOKEN_SECRET,
		});
	}

	async validate(payload: any) {
		return this.userService.findOneById(payload.id);
	}
}
