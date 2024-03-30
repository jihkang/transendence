import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class FtAuthGuard extends AuthGuard('ft') {
	handleRequest<TUser = any>(err: any, user: any): TUser {
		if (err || !user) {
			throw err || new UnauthorizedException('42 Auth Unauthorized');
		}
		return user;
	}
}
